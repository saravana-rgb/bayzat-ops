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
  ['emirates_id', 'Emirates ID'],
  ['probation',   'Probation']
];

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

  const load = useCallback(async () => {
    const [d, g] = await Promise.all([
      supabase.from('v_document_expiry').select('*').order('expires'),
      supabase.from('v_compliance_gaps').select('*')
    ]);
    if (d.error) { setError(d.error.message); return; }
    setError(''); setRows(d.data || []); setGaps(g.data || []);
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

      <div className="stats">
        <Stat n={counts.expired} l="Expired" c={counts.expired ? 'hot' : ''} />
        <Stat n={counts.critical} l="Within 30 days" c="warm" />
        <Stat n={counts.soon} l="Within 90 days" />
        <Stat n={gaps.length} l="Missing details" c={gaps.length ? 'warm' : ''} />
        <Stat n={counts.inactive} l="Inactive, not tracked" />
      </div>

      <div className="toolbar">
        <div className="tabset">
          <button data-on={view === 'expiry' ? '1' : '0'} onClick={() => setView('expiry')}>
            Expiring · {list.length}
          </button>
          <button data-on={view === 'gaps' ? '1' : '0'} onClick={() => setView('gaps')}>
            Missing · {gaps.length}
          </button>
        </div>
        <input className="search" value={q} placeholder="Search name, email or ID"
          onChange={e => setQ(e.target.value)} />
        <button className="mini" onClick={load}>Refresh</button>
      </div>

      {view === 'gaps' ? (
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
          <div className="facets">
            <select className="facetsel" value={doc} onChange={e => setDoc(e.target.value)}>
              {DOCS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
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
                        {pretty(r.expires)}
                        <span className={'chip ' + st.cls}>
                          {r.days_left < 0 ? `${-r.days_left}d ago` : `${r.days_left}d`}
                        </span>
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
const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
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
