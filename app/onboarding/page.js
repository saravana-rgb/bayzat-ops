'use client';
import { useCallback, useEffect, useState } from 'react';
import { AuthGate, Bar, STATUS, daysLeft, dueChip, pretty, supabase } from '../shared';

const ORDER = ['todo', 'progress', 'done', 'na'];
const DEVICES = ['Company laptop', 'Leasing device', 'Personal device', 'Not required'];

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
      <Bar
        title="Onboarding tracker"
        sub="Six steps per joiner, due five working days after the date of joining"
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

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, ticket_steps(*)')
      .order('due_date', { ascending: true });
    if (error) { setError(error.message); return; }
    setError('');
    setTickets((data || []).map(t => ({
      ...t,
      ticket_steps: [...(t.ticket_steps || [])].sort((a, b) => a.position - b.position)
    })));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // keep the board honest when two people work it at once
  useEffect(() => {
    const ch = supabase.channel('tracker')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_steps' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchAll]);

  async function setStep(step, status) {
    setTickets(ts => ts.map(t => ({
      ...t,
      ticket_steps: t.ticket_steps.map(s => s.id === step.id ? { ...s, status } : s)
    })));                                                    // optimistic
    const { error } = await supabase.from('ticket_steps')
      .update({ status, updated_at: new Date().toISOString(), updated_by: email })
      .eq('id', step.id);
    if (error) setError(error.message);
    fetchAll();                                              // the close trigger runs server-side
  }

  async function setField(step, patch) {
    await supabase.from('ticket_steps').update(patch).eq('id', step.id);
    fetchAll();
  }

  if (error) return <div className="err">{error}</div>;
  if (!tickets) return <p style={{ color: 'var(--ink3)', fontWeight: 600 }}>Loading tickets…</p>;

  const open   = tickets.filter(t => t.status === 'open');
  const closed = tickets.filter(t => t.status === 'closed');
  const pending = open.flatMap(t =>
    t.ticket_steps.filter(s => s.status !== 'done' && s.status !== 'na')
      .map(s => ({ t, s, d: daysLeft(t.due_date) })))
    .sort((a, b) => a.d - b.d || a.s.position - b.s.position);

  const late = pending.filter(p => p.d < 0);
  const now  = pending.filter(p => p.d === 0);
  const soon = pending.filter(p => p.d > 0);
  const detail = tickets.find(t => t.id === openId);

  return (
    <>
      <div className="stats">
        <Stat n={open.length} l="Open tickets" />
        <Stat n={late.length} l="Overdue" c="hot" />
        <Stat n={now.length}  l="Due today" c="warm" />
        <Stat n={closed.length} l="Closed" />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
        {[['today', `Today's follow-up${pending.length ? ' · ' + pending.length : ''}`],
          ['open', `Open tickets${open.length ? ' · ' + open.length : ''}`],
          ['closed', `Closed${closed.length ? ' · ' + closed.length : ''}`]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className="mini"
            style={tab === k ? { background: 'var(--grad)', color: '#fff', borderColor: 'transparent' } : {}}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        pending.length === 0
          ? <Empty b="Nothing waiting on you" s="New joiners land here automatically, five minutes after the row hits the sheet." />
          : <>
              <Bucket title="Overdue" cls="hot" list={late} onSet={setStep} onOpen={setOpenId} />
              <Bucket title="Due today" list={now} onSet={setStep} onOpen={setOpenId} />
              <Bucket title="Still in the window" list={soon} onSet={setStep} onOpen={setOpenId} />
            </>
      )}

      {tab === 'open' && <TicketList list={open} onOpen={setOpenId}
        empty={<Empty b="No open tickets" s="Every joiner is fully onboarded." />} />}
      {tab === 'closed' && <TicketList list={closed} onOpen={setOpenId}
        empty={<Empty b="Nothing closed yet" s="A ticket closes itself once all six steps are done." />} />}

      {detail && <Panel t={detail} onClose={() => setOpenId(null)} onSet={setStep} onField={setField} />}
    </>
  );
}

/* ---------------------------------------------------------- pieces */
const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c && n ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);

const Empty = ({ b, s }) => <div className="empty"><b>{b}</b><span>{s}</span></div>;

function Bucket({ title, cls, list, onSet, onOpen }) {
  if (!list.length) return null;
  return (
    <>
      <div className={'sec' + (cls ? ' ' + cls : '')}>{title} · {list.length}</div>
      <div className="grid">
        {list.map(({ t, s, d }) => {
          const chip = dueChip(t.due_date);
          return (
            <div key={s.id} className={'row' + (d < 0 ? ' late' : '')}>
              <div className="num">{s.position}</div>
              <div className="body">
                <div className="t">{s.label} <span className={'chip ' + (s.status === 'progress' ? 'amber' : 'grey')}>{STATUS[s.status]}</span></div>
                <div className="m">
                  {t.first_name} {t.last_name}{t.location ? ' · ' + t.location : ''} · joined {pretty(t.doj)} · due {pretty(t.due_date)}
                </div>
              </div>
              <span className={'chip ' + chip.cls}>{chip.text}</span>
              <div className="acts">
                {s.status !== 'progress' &&
                  <button className="mini" onClick={() => onSet(s, 'progress')}>Start</button>}
                <button className="mini go" onClick={() => onSet(s, 'done')}>Mark done</button>
                <button className="mini" onClick={() => onOpen(t.id)}>Open</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TicketList({ list, onOpen, empty }) {
  if (!list.length) return empty;
  return (
    <div className="grid" style={{ marginTop: 14 }}>
      {list.map(t => {
        const done = t.ticket_steps.filter(s => ['done', 'na'].includes(s.status)).length;
        const chip = t.status === 'closed'
          ? { cls: 'green', text: 'Closed ' + pretty((t.closed_at || '').slice(0, 10)) }
          : dueChip(t.due_date);
        const overdue = t.status === 'open' && daysLeft(t.due_date) < 0;
        return (
          <div key={t.id} className="tk" onClick={() => onOpen(t.id)}>
            <div className="head">
              <div className="name">{t.first_name} {t.last_name}</div>
              <div className="meta">{t.location || '—'} · joined {pretty(t.doj)} · {t.ref}</div>
              <div className="r">
                <span className={'chip ' + chip.cls}>{chip.text}</span>
                <span className="pct">{done}/{t.ticket_steps.length}</span>
              </div>
            </div>
            <div className="runway">
              {t.ticket_steps.map(s => (
                <div key={s.id} title={`${s.label}: ${STATUS[s.status]}`}
                  className={'seg ' + (s.status === 'done' ? 'done' : s.status === 'na' ? 'na'
                    : s.status === 'progress' ? 'progress' : overdue ? 'late' : '')} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Panel({ t, onClose, onSet, onField }) {
  const chip = dueChip(t.due_date);
  const overdue = t.status === 'open' && daysLeft(t.due_date) < 0;
  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel">
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.3px' }}>
              {t.first_name} {t.last_name}
            </h2>
            <div style={{ fontSize: 11.5, color: 'var(--ink3)', fontWeight: 500, marginTop: 3 }}>
              {t.location || '—'} · joined {pretty(t.doj)} · due {pretty(t.due_date)} · {t.ref}
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
