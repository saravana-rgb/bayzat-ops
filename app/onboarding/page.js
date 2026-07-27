'use client';
import { useCallback, useEffect, useState } from 'react';
import { AuthGate, Bar, STATUS, ageChip, daysSince, pretty, supabase } from '../shared';
import Reports from './reports';

const ORDER = ['todo', 'progress', 'done', 'na'];
const DEVICES = ['Company laptop', 'Leasing device', 'Personal device', 'Not required'];

/* Why something is held up. Recorded on the comment so the monthly report
   can separate our own delays from a vendor's. */
const REASONS = [
  ['',          'No delay'],
  ['it',        'Waiting on IT'],
  ['vendor',    'Waiting on vendor'],
  ['approval',  'Waiting on approval'],
  ['employee',  'Waiting on employee'],
  ['shipping',  'In transit / shipping'],
  ['other',     'Something else']
];
const REASON_LABEL = Object.fromEntries(REASONS.map(r => r));

/* Styles specific to this screen, kept here so the file is self-contained. */

export default function OnboardingPage() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  const [email, setEmail] = useState('');
  const [view, setView] = useState('board');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);
  return (
    <div className="wrap">
      <Bar
        title="Onboarding"
        sub={view === 'board' ? 'Who is joining and what IT still owes them'
                              : 'How long each step took, and what held it up'}
        right={<a className="back" href="/">← All tiles</a>}
      />

      <div className="viewswitch">
        <button data-on={view === 'board' ? '1' : '0'} onClick={() => setView('board')}>Board</button>
        <button data-on={view === 'reports' ? '1' : '0'} onClick={() => setView('reports')}>Reports</button>
      </div>

      {view === 'board' ? <Tracker email={email} /> : <Reports />}
    </div>
  );
}

function Tracker({ email }) {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('today');
  const [openId, setOpenId] = useState(null);
  const [q, setQ] = useState('');
  const [synced, setSynced] = useState(null);
  const [busy, setBusy] = useState(false);
  const [stepSel, setStepSel] = useState(null);   // which step the batch view is showing
  const [picked, setPicked] = useState({});       // ids ticked in the batch view
  const [foldOpen, setFoldOpen] = useState(false);
  const [events, setEvents] = useState([]);

  const fetchAll = useCallback(async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from('tickets')
      .select('*, ticket_steps(*)')
      .order('doj', { ascending: true });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setError('');
    setTickets((data || []).map(t => ({
      ...t,
      ticket_steps: [...(t.ticket_steps || [])].sort((a, b) => a.position - b.position)
    })));
    setSynced(new Date());
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!openId) { setEvents([]); return; }
    supabase.from('step_events').select('*').eq('ticket_id', openId)
      .order('created_at', { ascending: false }).limit(60)
      .then(({ data }) => setEvents(data || []));
  }, [openId, tickets]);

  // "/" jumps to search, Escape closes the panel
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.querySelector('.search')?.focus();
      }
      if (e.key === 'Escape') setOpenId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // three ways to stay current: live changes, a poll, and returning to the tab
  useEffect(() => {
    const ch = supabase.channel('tracker')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_steps' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, fetchAll)
      .subscribe();
    const poll = setInterval(fetchAll, 60000);
    const onVis = () => { if (!document.hidden) fetchAll(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [fetchAll]);

  async function setStep(step, status) {
    setTickets(ts => ts.map(t => ({
      ...t,
      ticket_steps: t.ticket_steps.map(s => s.id === step.id ? { ...s, status } : s)
    })));
    const { error } = await supabase.from('ticket_steps')
      .update({ status, updated_at: new Date().toISOString(), updated_by: email })
      .eq('id', step.id);
    if (error) setError(error.message);
    fetchAll();
  }

  /** Mark the same step done for several joiners in one go. */
  async function bulkDone(ids) {
    if (!ids.length) return;
    setTickets(ts => ts.map(t => ({
      ...t,
      ticket_steps: t.ticket_steps.map(s => ids.includes(s.id) ? { ...s, status: 'done' } : s)
    })));
    setPicked({});
    const { error } = await supabase.from('ticket_steps')
      .update({ status: 'done', updated_at: new Date().toISOString(), updated_by: email })
      .in('id', ids);
    if (error) setError(error.message);
    fetchAll();
  }

  /** Logs a comment against a step, with an optional reason for the delay. */
  async function addComment(step, comment, reason) {
    if (!comment.trim()) return;
    const { error } = await supabase.rpc('add_step_comment', {
      p_step_id: step.id, p_comment: comment.trim(), p_reason: reason || '', p_actor: email
    });
    if (error) setError(error.message);
    fetchAll();
    supabase.from('step_events').select('*').eq('ticket_id', step.ticket_id)
      .order('created_at', { ascending: false }).limit(60)
      .then(({ data }) => setEvents(data || []));
  }

  async function setField(step, patch) {
    await supabase.from('ticket_steps').update(patch).eq('id', step.id);
    fetchAll();
  }

  if (!tickets) return <p style={{ color: 'var(--ink3)', fontWeight: 600 }}>Loading tickets…</p>;

  const term = q.trim().toLowerCase();
  const match = t => !term ||
    `${t.first_name} ${t.last_name} ${t.ref} ${t.location}`.toLowerCase().includes(term);

  const all    = tickets.filter(match);
  const open   = all.filter(t => t.status === 'open');
  const closed = all.filter(t => t.status === 'closed');
  const pendingOf = t => t.ticket_steps.filter(s => s.status !== 'done' && s.status !== 'na');

  const waiting = open.filter(t => pendingOf(t).length)
    .sort((a, b) => daysSince(b.doj) - daysSince(a.doj));
  const joined   = waiting.filter(t => daysSince(t.doj) >= 0);   // already started, work is owed now
  const upcoming = waiting.filter(t => daysSince(t.doj) < 0);    // joining date is still ahead
  const stale    = waiting.filter(t => daysSince(t.doj) >= 7);   // waiting a week or more
  const stepCount = waiting.reduce((n, t) => n + pendingOf(t).length, 0);

  // the same pending work, grouped by step instead of by person
  const byStep = [];
  open.forEach(t => t.ticket_steps.forEach(s => {
    let g = byStep.find(x => x.position === s.position);
    if (!g) { g = { position: s.position, label: s.label, people: [] }; byStep.push(g); }
    if (s.status !== 'done' && s.status !== 'na') g.people.push({ t, s });
  }));
  byStep.sort((a, b) => a.position - b.position);
  const busiest = byStep.reduce((m, g) => Math.max(m, g.people.length), 0);
  const active = byStep.find(g => g.position === stepSel)
    || byStep.slice().sort((a, b) => b.people.length - a.people.length)[0];
  const pickedIds = Object.keys(picked).filter(k => picked[k]);
  const detail = tickets.find(t => t.id === openId);

  return (
    <>
      {error && <div className="err">{error}</div>}

      <div className="stats">
        <Stat n={open.length}     l="Open tickets" />
        <Stat n={stepCount}       l="Steps to do" c="warm" />
        <Stat n={stale.length}    l="Waiting a week" c="hot" />
        <Stat n={upcoming.length} l="Starting soon" c="calm" />
        <Stat n={closed.length}   l="Closed" c="good" />
      </div>

      <div className="toolbar">
        <div className="tabset">
          {[['today', 'To do', waiting.length],
            ['bystep','By task',      stepCount],
            ['open',  'All tickets',  open.length],
            ['closed','Completed',    closed.length]].map(([k, label, n]) => (
            <button key={k} data-on={tab === k ? '1' : '0'} onClick={() => setTab(k)}>
              {label}{n ? ` · ${n}` : ''}
            </button>
          ))}
        </div>
        <input className="search" placeholder="Search name, ref or location    /"
          value={q} onChange={e => setQ(e.target.value)} />
        <div className="sync">
          {synced && <span>Updated {synced.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
          <button className="mini" onClick={fetchAll} disabled={busy}>
            {busy ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {tab === 'today' && (waiting.length === 0
        ? <Empty b={term ? 'Nobody matches that search' : 'Nothing waiting on you'}
                 s={term ? 'Try a name, a ticket ref, or a location.'
                         : 'Every open step is done. New joiners appear here within five minutes of hitting the sheet.'} />
        : <>
            <Group title="Already started — work is owed" cls="hot" list={joined}
                   pendingOf={pendingOf} onSet={setStep} onOpen={setOpenId} />
            <Group title="Joining later — get ahead" cls="calm" list={upcoming}
                   pendingOf={pendingOf} onSet={setStep} onOpen={setOpenId} />
          </>)}

      {tab === 'bystep' && (stepCount === 0
        ? <Empty b="No outstanding work" s="Every step on every open ticket is done." />
        : <>
            <div className="stepchips">
              {byStep.map(g => (
                <button key={g.position}
                  className={'stepchip c' + g.position + (g.people.length ? '' : ' empty')}
                  data-on={active && active.position === g.position ? '1' : '0'}
                  onClick={() => { setStepSel(g.position); setPicked({}); }}>
                  <span className="sq" />{g.label}<span className="n">{g.people.length}</span>
                </button>
              ))}
            </div>

            {active && (
              <div className="batch">
                <div className="batch-h">
                  <span className="t">Waiting on {active.label.toLowerCase()}</span>
                  <span className="c">
                    {active.people.length === 1 ? '1 person' : active.people.length + ' people'}
                  </span>
                  <button className="mini" style={{ marginLeft: 'auto' }}
                    onClick={() => {
                      const next = {};
                      active.people.forEach(p => { next[p.s.id] = true; });
                      setPicked(next);
                    }}>Select all</button>
                </div>

                {active.people.length === 0
                  ? <div style={{ padding: '18px 17px', fontSize: 12.5, color: 'var(--ink3)' }}>
                      Nobody is waiting on this one.
                    </div>
                  : active.people.map(({ t, s }) => (
                      <label key={s.id} className="prow">
                        <input type="checkbox" checked={!!picked[s.id]}
                          onChange={() => setPicked(p => ({ ...p, [s.id]: !p[s.id] }))} />
                        <span className="ini">
                          {(t.first_name[0] || '') + (t.last_name[0] || '')}
                        </span>
                        <span className="nm">{t.first_name} {t.last_name}</span>
                        <span className="sp">
                          <span className="chip grey">{t.location || 'no location'}</span>
                          <span className={'chip ' + ageChip(t.doj).cls}>{ageChip(t.doj).text}</span>
                          {s.status === 'progress' && <span className="chip amber">In progress</span>}
                        </span>
                      </label>
                    ))}

                <div className="batch-f">
                  <span style={{ fontSize: 12.5, color: 'var(--ink3)', fontWeight: 600 }}>
                    {pickedIds.length ? pickedIds.length + ' selected' : 'Nothing selected'}
                  </span>
                  <button className="btn" style={{ marginLeft: 'auto' }}
                    disabled={!pickedIds.length}
                    onClick={() => bulkDone(pickedIds)}>
                    Mark {pickedIds.length || ''} done
                  </button>
                </div>
              </div>
            )}

            <div className="fold">
              <div className="fold-h" onClick={() => setFoldOpen(o => !o)}>
                <span className="fold-t">Where the queue is stuck</span>
                <span className="fold-c">
                  {byStep.filter(g => g.people.length).length} of {byStep.length} steps have someone waiting
                </span>
                <span className="caret" data-open={foldOpen ? '1' : '0'}>▾</span>
              </div>
              {foldOpen && (
                <div className="fold-b">
                  {byStep.map(g => (
                    <div key={g.position} className="bar-row">
                      <span className="bar-lbl">{g.label}</span>
                      <span className="bar-track">
                        <span className={'bar-fill p' + g.position} style={{
                          width: busiest ? Math.round((g.people.length / busiest) * 100) + '%' : '0%',
                          background: g.people.length ? '' : 'transparent'
                        }} />
                      </span>
                      <span className="bar-n">{g.people.length}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>)}

      {tab === 'open' && (open.length === 0
        ? <Empty b="No open tickets" s="Everyone is fully onboarded." />
        : <div className="grid">
            {open.map(t => <Person key={t.id} t={t} pending={pendingOf(t)} onSet={setStep} onOpen={setOpenId} />)}
          </div>)}

      {tab === 'closed' && (closed.length === 0
        ? <Empty b="Nothing closed yet" s="A ticket closes itself once all six steps read Done or N/A." />
        : <div className="grid">
            {closed.map(t => <Person key={t.id} t={t} pending={[]} onSet={setStep} onOpen={setOpenId} />)}
          </div>)}

      {detail && <Panel t={detail} events={events} onClose={() => setOpenId(null)}
                        onSet={setStep} onField={setField} onComment={addComment} />}
    </>
  );
}

/* ---------------------------------------------------------- pieces */
const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c && n ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);
const Empty = ({ b, s }) => <div className="empty"><b>{b}</b><span>{s}</span></div>;

function Group({ title, cls, list, pendingOf, onSet, onOpen }) {
  if (!list.length) return null;
  return (
    <>
      <div className={'sec' + (cls ? ' ' + cls : '')}>{title} · {list.length}</div>
      <div className="grid">
        {list.map(t => (
          <Person key={t.id} t={t} pending={pendingOf(t)} onSet={onSet} onOpen={onOpen} />
        ))}
      </div>
    </>
  );
}

/** One card per joiner: who they are, then exactly what is still owed. */
function Person({ t, pending, onSet, onOpen }) {
  const chip = t.status === 'closed'
    ? { cls: 'green', text: 'Closed ' + pretty((t.closed_at || '').slice(0, 10)) }
    : ageChip(t.doj);
  const overdue = t.status === 'open' && daysSince(t.doj) >= 7;
  const done = t.ticket_steps.filter(s => ['done', 'na'].includes(s.status)).length;

  return (
    <div className={'pcard' + (overdue ? ' late' : '')} onClick={() => onOpen(t.id)}
         role="button" tabIndex={0}
         onKeyDown={e => { if (e.key === 'Enter') onOpen(t.id); }}>
      <div className="pc-top">
        <div>
          <div className="pc-name">
            {t.first_name} {t.last_name}
            <span className="pc-ref">{t.ref}</span>
          </div>
          <div className="pc-meta">
            {t.location || 'no location'} · joins {pretty(t.doj)}
            {t.laptop_required ? '' : ' · no laptop'}
          </div>
        </div>
        <div className="pc-right">
          <span className={'chip ' + chip.cls}>{chip.text}</span>
          <span className="pc-count">{done}/{t.ticket_steps.length}</span>
        </div>
      </div>

      <div className="pc-bar">
        <div className="runway">
          {t.ticket_steps.map(s => (
            <div key={s.id} title={`${s.label}: ${STATUS[s.status]}`}
              className={'seg p' + s.position + ' ' + (s.status === 'done' ? 'done'
                : s.status === 'na' ? 'na' : s.status === 'progress' ? 'progress'
                : overdue ? 'late' : '')} />
          ))}
        </div>
      </div>

      <div className="pc-steps">
        {pending.length === 0
          ? <div className="allgood">All six steps complete</div>
          : pending.map(s => (
              <div key={s.id} className="pstep">
                <span className={'pnum p' + s.position}>{s.position}</span>
                <span className="plabel">{s.label}</span>
                <span className={'chip ' + (s.status === 'progress' ? 'amber' : 'grey')}>
                  {STATUS[s.status]}
                </span>
                <div className="pacts" onClick={e => e.stopPropagation()}>
                  {s.status !== 'progress' &&
                    <button className="mini" onClick={() => onSet(s, 'progress')}>Start</button>}
                  <button className="mini go" onClick={() => onSet(s, 'done')}>Done</button>
                </div>
              </div>
            ))}
      </div>

      <div className="pfoot">
        <span className="note-txt">
          {pending.length ? `${pending.length} of ${t.ticket_steps.length} still to do` : 'Nothing outstanding'}
        </span>
        <button className="mini" style={{ marginLeft: 'auto' }}
          onClick={e => { e.stopPropagation(); onOpen(t.id); }}>
          Open full ticket
        </button>
      </div>
    </div>
  );
}

function Panel({ t, events, onClose, onSet, onField, onComment }) {
  const chip = ageChip(t.doj);
  const overdue = t.status === 'open' && daysSince(t.doj) >= 7;
  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel">
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px' }}>
              {t.first_name} {t.last_name} <span className="pc-ref">{t.ref}</span>
            </h2>
            <div style={{ fontSize: 11.5, color: 'var(--ink3)', fontWeight: 500, marginTop: 4 }}>
              {t.location || 'no location'} · joins {pretty(t.doj)}
            </div>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8, margin: '13px 0 3px', flexWrap: 'wrap' }}>
          {t.status === 'closed'
            ? <span className="chip green">Closed {pretty((t.closed_at || '').slice(0, 10))}</span>
            : <>
                <span className="chip accent">
                  {t.ticket_steps.filter(s => ['done', 'na'].includes(s.status)).length} of {t.ticket_steps.length} done
                </span>
                <span className={'chip ' + chip.cls}>{chip.text}</span>
              </>}
        </div>

        {t.ticket_steps.map(s => (
          <Step key={s.id} s={s} overdue={overdue} onSet={onSet} onField={onField}
                onComment={onComment}
                trail={events.filter(e => e.step_id === s.id)} />
        ))}

        <button className="btn ghost" style={{ marginTop: 16 }} onClick={onClose}>Close panel</button>
      </div>
    </div>
  );
}

/** One checklist step: status, device type, and its own comment trail. */
function Step({ s, overdue, onSet, onField, onComment, trail }) {
  const [text, setText] = useState('');
  const [reason, setReason] = useState('');
  const pending = !['done', 'na'].includes(s.status);

  return (
    <div className={'step e' + s.position + (s.status === 'done' ? ' done' : '')
      + (overdue && pending ? ' late' : '')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className={'num p' + s.position}>{s.position}</div>
        <div className="st">{s.label}</div>
        {s.done_at && (
          <span className="chip green" style={{ marginLeft: 'auto' }}>
            Done {pretty(String(s.done_at).slice(0, 10))}
          </span>
        )}
      </div>

      <div className="ctl">
        {ORDER.map(v => (
          <button key={v} data-on={s.status === v ? '1' : '0'} onClick={() => onSet(s, v)}>
            {STATUS[v]}
          </button>
        ))}
      </div>

      {s.position === 2 && (
        <select className="note" value={s.detail || ''}
          onChange={e => onField(s, { detail: e.target.value })}>
          {DEVICES.map(d => <option key={d}>{d}</option>)}
        </select>
      )}

      <div className="cmt">
        <div className="cmt-row">
          <select value={reason} onChange={e => setReason(e.target.value)}>
            {REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input value={text} placeholder="What happened? e.g. leased device requested, waiting on vendor"
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { onComment(s, text, reason); setText(''); } }} />
          <button className="mini" disabled={!text.trim()}
            onClick={() => { onComment(s, text, reason); setText(''); }}>Log</button>
        </div>

        {trail.length > 0 && (
          <div className="trail">
            {trail.map(e => (
              <div key={e.id} className="tr">
                <span className={'dot ' + (e.kind === 'comment' ? 'cmt'
                  : ['done', 'na'].includes(e.to_status) ? 'done' : '')} />
                <span>
                  {e.kind === 'comment'
                    ? <>{e.comment}{e.reason && <> · <b>{REASON_LABEL[e.reason]}</b></>}</>
                    : <>Moved to <b>{STATUS[e.to_status] || e.to_status}</b></>}
                  <span className="who"> · {(e.actor || 'someone').split('@')[0]} · {when(e.created_at)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Relative time, in the plainest words available. */
function when(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.round(hrs / 24);
  return days === 1 ? 'yesterday' : days + 'd ago';
}
