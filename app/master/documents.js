'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../common/shared';
import { pretty, today } from './shared';

/* Everything that can lapse, in one place: expired first, then whatever is
   closest. Chasing and renewing are separate actions because they are
   separate facts — one says we asked, the other says it is done. */

const DOCS = [
  ['all',         'Everything'],
  ['visa',        'Residency visa'],
  ['passport',    'Passport'],
  ['emirates_id', 'Emirates ID']
];

/** 4202 days ago is a number; "11 years ago" is a fact. */
function ago(d) {
  const n = Math.abs(d);
  const past = d < 0;
  let t;
  if (n === 0) t = 'today';
  else if (n < 31) t = n + ' day' + (n > 1 ? 's' : '');
  else if (n < 365) t = Math.round(n / 30) + ' month' + (n >= 45 ? 's' : '');
  else t = (Math.round(n / 36.5) / 10) + ' years';
  return n === 0 ? 'today' : past ? t + ' ago' : 'in ' + t;
}

const STATES = {
  expired:  { label: 'Expired',       cls: 'red' },
  critical: { label: 'Within 30 days', cls: 'red' },
  soon:     { label: 'Within 90 days', cls: 'amber' },
  inactive: { label: 'Inactive',      cls: 'grey' }
};

export default function Documents({ actor }) {
  const [rows, setRows] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [doc, setDoc] = useState('all');
  const [state, setState] = useState('all');
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState({});
  const [chasing, setChasing] = useState(false);
  const [renewing, setRenewing] = useState(null);
  const [view, setView] = useState('expiry');
  const [ins, setIns] = useState([]);

  const load = useCallback(async () => {
    const [d, g, i] = await Promise.all([
      supabase.from('v_document_expiry').select('*').order('expires'),
      supabase.from('v_compliance_gaps').select('*'),
      supabase.from('v_insurance').select('*')
    ]);
    if (d.error) { setError(d.error.message); return; }
    setError(''); setRows(d.data || []); setGaps(g.data || []); setIns(i.data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  function note(t) { setMsg(t); setTimeout(() => setMsg(''), 2600); }

  async function chase(ids, document, text) {
    const { data, error } = await supabase.rpc('chase_documents', {
      p_ids: ids, p_document: document, p_note: text, p_actor: actor });
    if (error) { setError(error.message); return; }
    setChasing(false); setPicked({});
    note(`Reminder queued for ${data?.chased || ids.length} — it sends within a few minutes`);
    load();
  }

  async function renew(row, newDate, text) {
    const { data, error } = await supabase.rpc('renew_document', {
      p_id: row.employee_id, p_document: row.document,
      p_new_expiry: newDate, p_note: text, p_actor: actor });
    if (error) { setError(error.message); return; }
    if (data && data.ok === false) { setError(data.reason); return; }
    setRenewing(null); note('Updated — now expires ' + pretty(newDate));
    load();
  }

  if (!rows) return <p className="note-txt">Loading…</p>;

  const term = q.trim().toLowerCase();
  const list = rows.filter(r => {
    if (r.state === 'fine') return false;
    if (doc !== 'all' && r.document !== doc) return false;
    if (state !== 'all' && r.state !== state) return false;
    if (state === 'all' && r.state === 'inactive') return false;
    if (!term) return true;
    return [r.person, r.work_email, r.emp_no, r.department].some(v =>
      (v || '').toLowerCase().includes(term));
  });

  const ids = Object.keys(picked).filter(k => picked[k]);
  const insGap = ins.filter(r => r.uae && r.cover !== 'inactive'
    && (r.cover === 'none' || r.cover === 'unknown')).length;
  const counts = {
    expired: rows.filter(r => r.state === 'expired').length,
    critical: rows.filter(r => r.state === 'critical').length,
    soon: rows.filter(r => r.state === 'soon').length,
    inactive: rows.filter(r => r.state === 'inactive').length
  };

  return (
    <>
      {error && <div className="err">{error}</div>}
      {msg && <div className="busy">{msg}</div>}

      <div className="cards">
        <Card n={counts.expired} l="Expired" note="Already lapsed" tone="red"
          on={view === 'expiry' && state === 'expired'}
          onClick={() => { setView('expiry'); setState('expired'); }} />
        <Card n={counts.critical} l="Within 30 days" note="Chase these first" tone="red"
          on={view === 'expiry' && state === 'critical'}
          onClick={() => { setView('expiry'); setState('critical'); }} />
        <Card n={counts.soon} l="Within 90 days" note="Worth a heads up" tone="amber"
          on={view === 'expiry' && state === 'soon'}
          onClick={() => { setView('expiry'); setState('soon'); }} />
        <Card n={gaps.length} l="Missing" note="No date on record" tone="amber"
          on={view === 'gaps'} onClick={() => setView('gaps')} />
        <Card n={insGap} l="No insurance" note="UAE employees" tone="red"
          on={view === 'insurance'} onClick={() => setView('insurance')} />
      </div>

      <div className="toolbar">
        <div className="tabset">
          <button data-on={view === 'expiry' ? '1' : '0'} onClick={() => setView('expiry')}>
            Expiring · {list.length}
          </button>
          <button data-on={view === 'gaps' ? '1' : '0'} onClick={() => setView('gaps')}>
            Missing · {gaps.length}
          </button>
          <button data-on={view === 'insurance' ? '1' : '0'} onClick={() => setView('insurance')}>
            Insurance · {ins.filter(r => r.cover === 'none' || r.cover === 'unknown').length}
          </button>
        </div>
        <input className="search" value={q} placeholder="Search name, email or ID"
          onChange={e => setQ(e.target.value)} />
        <button className="mini" onClick={load}>Refresh</button>
      </div>

      {view === 'insurance' ? (
        (() => {
          // only UAE employees — insurance elsewhere is handled locally and
          // the sheet does not track it
          const active = ins.filter(r => r.cover !== 'inactive' && r.uae);
          const none = active.filter(r => r.cover === 'none');
          const unknown = active.filter(r => r.cover === 'unknown');
          const covered = active.filter(r => r.cover === 'covered');
          const show = [...none, ...unknown].filter(r => !term ||
            [r.person, r.work_email, r.department].some(v =>
              (v || '').toLowerCase().includes(term)));
          return (
            <>
              <div className="insbar">
                <span className="insseg covered" style={{
                  flex: covered.length || 0.01 }}>{covered.length} covered</span>
                <span className="insseg none" style={{
                  flex: none.length || 0.01 }}>{none.length ? none.length + ' none' : ''}</span>
                <span className="insseg unknown" style={{
                  flex: unknown.length || 0.01 }}>{unknown.length ? unknown.length + ' unknown' : ''}</span>
              </div>
              <p className="note-txt" style={{ margin: '12px 0 16px', lineHeight: 1.6 }}>
                UAE employees only — insurance elsewhere is arranged locally and the sheet
                does not track it. Recorded as Yes or No with no renewal date, so this is a
                state rather than something that expires.
              </p>
              {show.length === 0
                ? <div className="empty"><b>Everyone is covered</b>
                    <span>Every active employee has medical insurance recorded.</span></div>
                : <div className="people">
                    {show.map(r => (
                      <div key={r.employee_id} className="person">
                        <span className="who">
                          <span className="nm">{r.person}</span>
                          <span className="sub">
                            {r.department || 'no department'} · {r.location || '—'}
                            {r.insurance_category ? ' · ' + r.insurance_category : ''}
                          </span>
                        </span>
                        <span className={'chip ' + (r.cover === 'none' ? 'red' : 'grey')}>
                          {r.cover === 'none' ? 'No insurance' : 'Not recorded'}
                        </span>
                      </div>
                    ))}
                  </div>}
            </>
          );
        })()
      ) : view === 'gaps' ? (
        gaps.length === 0
          ? <div className="empty"><b>Nothing missing</b>
              <span>Every active employee has what they need on record.</span></div>
          : <div className="people">
              {gaps.map((g, i) => (
                <div key={i} className="person">
                  <span className="who">
                    <span className="nm">{g.person}</span>
                    <span className="sub">{g.department || 'no department'} · {g.location || '—'}</span>
                  </span>
                  <span className="chip amber">{g.item}</span>
                  <span className="note-txt" style={{ width: 190, flex: 'none' }}>{g.why}</span>
                </div>
              ))}
            </div>
      ) : (
        <>
          <div className="docchips">
            {DOCS.map(([v, l]) => {
              const n = v === 'all'
                ? rows.filter(r => r.state !== 'fine' && r.state !== 'inactive').length
                : rows.filter(r => r.document === v && r.state !== 'fine'
                    && r.state !== 'inactive').length;
              return (
                <button key={v} className="docchip" data-on={doc === v ? '1' : '0'}
                  onClick={() => setDoc(v)}>
                  {l}<span className="dn">{n}</span>
                </button>
              );
            })}
          </div>

          <div className="facets">
            <select className="facetsel" value={state} onChange={e => setState(e.target.value)}>
              <option value="all">Expired and expiring</option>
              <option value="expired">Expired only</option>
              <option value="critical">Within 30 days</option>
              <option value="soon">Within 90 days</option>
              <option value="inactive">Inactive employees</option>
            </select>
            {list.length > 0 && (
              <button className="mini" onClick={() => {
                const all = {};
                if (ids.length !== list.length) list.forEach(r => { all[r.employee_id] = true; });
                setPicked(all);
              }}>{ids.length === list.length ? 'Clear selection' : 'Select all'}</button>
            )}
            <span className="count">{list.length} shown</span>
          </div>

          {ids.length > 0 && (
            <div className="bulkbar">
              <span><b>{ids.length}</b> selected</span>
              <button className="btn" onClick={() => setChasing(true)}>
                Send a reminder to {ids.length === 1 ? 'them' : 'all ' + ids.length}
              </button>
              <button className="mini" onClick={() => setPicked({})}>Clear</button>
            </div>
          )}

          {list.length === 0
            ? <div className="empty"><b>Nothing to chase</b>
                <span>No documents are expired or expiring in the next 90 days.</span></div>
            : <div className="people">
                {list.map(r => {
                  const st = STATES[r.state] || { label: r.state, cls: 'grey' };
                  const key = r.employee_id + r.document;
                  return (
                    <div key={key} className={'person doc ' + r.state}>
                      <input type="checkbox" checked={!!picked[r.employee_id]}
                        onChange={() => setPicked(p =>
                          ({ ...p, [r.employee_id]: !p[r.employee_id] }))} />
                      <span className="who">
                        <span className="nm">{r.person}</span>
                        <span className="sub">
                          {r.department || 'no department'}
                          {r.location ? ' · ' + r.location : ''}
                          {r.last_chased_at
                            ? ' · chased ' + pretty(String(r.last_chased_at).slice(0, 10)) : ''}
                        </span>
                      </span>
                      <span className="docname">{r.label}</span>
                      <span className="docdate">
                        <b>{pretty(r.expires)}</b>
                        <span className={'chip ' + st.cls}>{ago(r.days_left)}</span>
                      </span>
                      <button className="mini go" onClick={() => setRenewing(r)}>Renewed</button>
                    </div>
                  );
                })}
              </div>}
        </>
      )}

      {chasing && <ChaseDialog count={ids.length} doc={doc}
        onCancel={() => setChasing(false)}
        onSend={text => chase(ids, doc === 'all' ? 'visa' : doc, text)} />}

      {renewing && <RenewDialog row={renewing} onCancel={() => setRenewing(null)}
        onSave={(d, t) => renew(renewing, d, t)} />}
    </>
  );
}

/* ------------------------------------------------------------ pieces */
/** A counter you can press. The number is the filter — seeing 162 expired
 *  and not being able to click it was the thing that made this page feel
 *  like a report rather than a tool. */
const Card = ({ n, l, note, tone, on, onClick }) => (
  <button className={'card ' + tone + (on ? ' on' : '') + (n ? '' : ' empty')}
    onClick={onClick} disabled={!n}>
    <b>{n}</b>
    <span className="cl">{l}</span>
    <span className="cn">{note}</span>
  </button>
);

function ChaseDialog({ count, doc, onCancel, onSend }) {
  const label = DOCS.find(d => d[0] === doc)?.[1] || 'document';
  const [text, setText] = useState(
    `Please send us an up to date copy of your ${label.toLowerCase()} so we can update our records.`);
  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="panel confirm">
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>
          Remind {count} {count === 1 ? 'person' : 'people'}
        </h2>
        <p className="note-txt" style={{ margin: '10px 0 18px', lineHeight: 1.7 }}>
          They get an email asking for the document, with the expiry date we hold. You are
          copied on every one. Sending is recorded against each person, so the next time you
          look you can see when they were last asked.
        </p>
        <label>What to say</label>
        <textarea rows="3" value={text} onChange={e => setText(e.target.value)} />
        <div className="confirm-acts">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={() => onSend(text)}>
            Send {count === 1 ? 'it' : 'all ' + count}
          </button>
        </div>
      </div>
    </div>
  );
}

function RenewDialog({ row, onCancel, onSave }) {
  const [date, setDate] = useState('');
  const [text, setText] = useState('');
  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="panel confirm">
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>
          {row.label} renewed for {row.person}
        </h2>
        <p className="note-txt" style={{ margin: '10px 0 18px', lineHeight: 1.7 }}>
          Currently expires {pretty(row.expires)}. The old date is kept in the history, so
          you can always see what it was and when it changed.
        </p>
        <label>New expiry date</label>
        <input type="date" value={date} min={today()}
          onChange={e => setDate(e.target.value)} />
        <label style={{ marginTop: 14 }}>Note</label>
        <input value={text} placeholder="Optional — where it was renewed, reference number"
          onChange={e => setText(e.target.value)} />
        <div className="confirm-acts">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn" disabled={!date} onClick={() => onSave(date, text)}>
            {date ? 'Save the new date' : 'Pick a date'}
          </button>
        </div>
      </div>
    </div>
  );
}
