'use client';
import { useCallback, useEffect, useState } from 'react';
import { AuthGate, Bar, STATUS, ageChip, daysSince, pretty, supabase } from '../shared';

const ORDER = ['todo', 'progress', 'done', 'na'];
const DEVICES = ['Company laptop', 'Leasing device', 'Personal device', 'Not required'];

/* Styles specific to this screen, kept here so the file is self-contained. */
const CSS = `
.toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
.tabset{display:flex;gap:3px;background:var(--sunk);border-radius:10px;padding:3px}
.tabset button{border:0;background:transparent;color:var(--ink2);border-radius:7px;
  padding:7px 14px;font:700 12px Inter;cursor:pointer;white-space:nowrap}
.tabset button:hover{color:var(--ink)}
.tabset button[data-on="1"]{background:var(--card);color:var(--ink);box-shadow:0 1px 2px rgba(22,24,28,.10)}
.search{flex:1;min-width:150px;max-width:280px;background:#fff;border:1px solid var(--line);
  border-radius:9px;padding:9px 12px;font:500 12.5px Inter;color:var(--ink);outline:none}
.search:focus{border-color:var(--accent)}
.sync{margin-left:auto;display:flex;align-items:center;gap:8px;font:600 11px Inter;color:var(--ink3)}

.pcard{background:var(--card);border:1px solid var(--line);border-radius:var(--rl);overflow:hidden;
  transition:transform .2s var(--ease),box-shadow .2s var(--ease),border-color .2s}
.pcard:hover{border-color:#D8D3C7;box-shadow:0 8px 26px rgba(22,24,28,.07);transform:translateY(-2px)}
.pcard.late{border-color:#E9C9C6}
.pc-top{display:flex;align-items:flex-start;gap:12px;padding:15px 16px 0;flex-wrap:wrap}
.pc-name{font-size:15px;font-weight:800;letter-spacing:-.2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.pc-ref{font:700 10px Inter;letter-spacing:.03em;background:var(--sunk);color:var(--ink3);
  border-radius:6px;padding:3px 7px;font-variant-numeric:tabular-nums}
.pc-meta{font-size:11.5px;color:var(--ink3);font-weight:500;margin-top:4px}
.pc-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.pc-count{font:800 11px Inter;color:var(--ink3)}
.pc-bar{padding:11px 16px 0}
.pc-steps{padding:4px 16px 14px}
.pstep{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap;transition:opacity .2s var(--ease)}
.pstep:last-child{border-bottom:0}
.pnum{width:20px;height:20px;border-radius:6px;background:var(--sunk);display:grid;place-items:center;
  font:800 9.5px Inter;color:var(--ink3);flex:none}
.plabel{font-size:12.5px;font-weight:600;flex:1;min-width:120px}
.pacts{display:flex;gap:5px;margin-left:auto}
.pfoot{border-top:1px solid var(--line2);padding:11px 16px;display:flex;gap:8px;align-items:center;
  background:var(--sunk);flex-wrap:wrap}
.note-txt{font-size:11.5px;color:var(--ink3);font-weight:500}
.allgood{font-size:11.5px;color:var(--accent);font-weight:600;padding:5px 0}
`;

export default function OnboardingPage() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  const [email, setEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);
  return (
    <div className="wrap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Bar
        title="Onboarding tracker"
        sub="Who is joining and what IT still owes them"
        right={<a className="back" href="/">← All tiles</a>}
      />
      <Tracker email={email} />
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
  const chasing = waiting.filter(t => daysSince(t.doj) >= 3);
  const recent  = waiting.filter(t => daysSince(t.doj) >= 0 && daysSince(t.doj) < 3);
  const upcoming = waiting.filter(t => daysSince(t.doj) < 0);
  const stepCount = waiting.reduce((n, t) => n + pendingOf(t).length, 0);
  const detail = tickets.find(t => t.id === openId);

  return (
    <>
      {error && <div className="err">{error}</div>}

      <div className="stats">
        <Stat n={open.length} l="Open tickets" />
        <Stat n={chasing.length} l="Chasing 3d+" c="hot" />
        <Stat n={stepCount}   l="Steps pending" />
        <Stat n={upcoming.length} l="Not joined yet" />
        <Stat n={closed.length} l="Closed" />
      </div>

      <div className="toolbar">
        <div className="tabset">
          {[['today', 'Needs action', waiting.length],
            ['open',  'All open',     open.length],
            ['closed','Closed',       closed.length]].map(([k, label, n]) => (
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
            <Group title="Been waiting longest" cls="hot" list={chasing} pendingOf={pendingOf} onSet={setStep} onOpen={setOpenId} />
            <Group title="Recently joined" list={recent} pendingOf={pendingOf} onSet={setStep} onOpen={setOpenId} />
            <Group title="Not started yet" list={upcoming} pendingOf={pendingOf} onSet={setStep} onOpen={setOpenId} />
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

      {detail && <Panel t={detail} onClose={() => setOpenId(null)} onSet={setStep} onField={setField} />}
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
    <div className={'pcard' + (overdue ? ' late' : '')}>
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
              className={'seg ' + (s.status === 'done' ? 'done' : s.status === 'na' ? 'na'
                : s.status === 'progress' ? 'progress' : overdue ? 'late' : '')} />
          ))}
        </div>
      </div>

      <div className="pc-steps">
        {pending.length === 0
          ? <div className="allgood">All six steps complete</div>
          : pending.map(s => (
              <div key={s.id} className="pstep">
                <span className="pnum">{s.position}</span>
                <span className="plabel">{s.label}</span>
                <span className={'chip ' + (s.status === 'progress' ? 'amber' : 'grey')}>
                  {STATUS[s.status]}
                </span>
                <div className="pacts">
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
        <button className="mini" style={{ marginLeft: 'auto' }} onClick={() => onOpen(t.id)}>
          Open full ticket
        </button>
      </div>
    </div>
  );
}

function Panel({ t, onClose, onSet, onField }) {
  const chip = ageChip(t.doj);
  const overdue = t.status === 'open' && daysSince(t.doj) >= 7;
  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel">
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.3px' }}>
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
                <span className="chip purple">
                  Open · {t.ticket_steps.filter(s => ['done', 'na'].includes(s.status)).length} of {t.ticket_steps.length}
                </span>
                <span className={'chip ' + chip.cls}>{chip.text}</span>
              </>}
        </div>

        {t.ticket_steps.map(s => (
          <div key={s.id} className={'step' + (s.status === 'done' ? ' done' : '')
            + (overdue && !['done', 'na'].includes(s.status) ? ' late' : '')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="num">{s.position}</div>
              <div className="st">{s.label}</div>
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
            <input className="note" defaultValue={s.note || ''}
              placeholder="Note — asset tag, ticket ref, who is blocking"
              onBlur={e => { if (e.target.value !== (s.note || '')) onField(s, { note: e.target.value }); }} />
          </div>
        ))}

        <button className="btn ghost" style={{ marginTop: 16 }} onClick={onClose}>Close panel</button>
      </div>
    </div>
  );
}
