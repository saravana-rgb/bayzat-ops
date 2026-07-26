'use client';
import { useCallback, useEffect, useState } from 'react';
import { AuthGate, Bar, supabase } from '../shared';

const REASON_LABEL = {
  it: 'Waiting on IT', vendor: 'Waiting on vendor', approval: 'Waiting on approval',
  employee: 'Waiting on employee', shipping: 'In transit', other: 'Something else'
};

export default function ReportsPage() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  return (
    <div className="wrap">
      <Bar
        title="Reports"
        sub="How long each step takes, and what holds it up"
        right={<a className="back" href="/">← All tiles</a>}
      />
      <Report />
    </div>
  );
}

function Report() {
  const [steps, setSteps] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [month, setMonth] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      supabase.from('v_step_metrics').select('*'),
      supabase.from('v_delay_reasons').select('*'),
      supabase.from('v_ticket_metrics').select('*')
    ]);
    if (a.error) { setError(a.error.message); return; }
    setSteps(a.data || []);
    setReasons(b.data || []);
    setTickets(c.data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="err">{error}</div>;
  if (!steps) return <p style={{ color: 'var(--ink3)', fontWeight: 500 }}>Loading…</p>;

  const months = [...new Set(steps.map(s => s.month))].sort().reverse();
  const active = month || months[0];

  if (!months.length) {
    return <div className="empty">
      <b>Nothing to report yet</b>
      <span>Once steps start being completed, this fills in on its own — one row per month.</span>
    </div>;
  }

  const rows = steps.filter(s => s.month === active).sort((a, b) => a.position - b.position);
  const slowest = rows.reduce((m, r) => Math.max(m, Number(r.avg_days)), 0) || 1;
  const closed = tickets.filter(t => t.month_closed === active && t.days_to_close != null);
  const avgClose = closed.length
    ? (closed.reduce((n, t) => n + Number(t.days_to_close), 0) / closed.length).toFixed(1) : '—';
  const monthReasons = reasons.filter(r => r.month === active)
    .sort((a, b) => b.mentions - a.mentions);
  const totalMentions = monthReasons.reduce((n, r) => n + r.mentions, 0) || 1;

  return (
    <>
      <div className="months">
        {months.map(m => (
          <button key={m} className="stepchip" data-on={m === active ? '1' : '0'}
            onClick={() => setMonth(m)}>{prettyMonth(m)}</button>
        ))}
      </div>

      <div className="stats">
        <Stat n={closed.length} l="Joiners completed" c="good" />
        <Stat n={avgClose} l="Avg days to finish" c="calm" />
        <Stat n={rows.reduce((n, r) => n + r.completed, 0)} l="Steps completed" />
        <Stat n={monthReasons.length ? totalMentions : 0} l="Delays logged" c="warm" />
      </div>

      <div className="sec">Average days to complete each step</div>
      <div className="panelbox">
        {rows.length === 0
          ? <p className="note-txt">No steps completed this month.</p>
          : rows.map(r => (
              <div key={r.position} className="mrow">
                <span className="mlbl">{r.label}</span>
                <span className="mtrack">
                  <span className="mfill" style={{
                    width: Math.max(Math.round((Number(r.avg_days) / slowest) * 100), 3) + '%',
                    background: Number(r.avg_days) >= 7 ? 'var(--rose)'
                      : Number(r.avg_days) >= 3 ? 'var(--amber)' : 'var(--emerald)'
                  }} />
                </span>
                <span className="mval">{Number(r.avg_days).toFixed(1)}d</span>
                <span className="msub">{r.completed} done · worst {Number(r.slowest_days).toFixed(0)}d</span>
              </div>
            ))}
      </div>

      <div className="sec">What held things up</div>
      <div className="panelbox">
        {monthReasons.length === 0
          ? <p className="note-txt">
              No delays were logged this month. Reasons appear here when someone adds a comment
              to a step and picks why it is waiting.
            </p>
          : monthReasons.map(r => (
              <div key={r.reason + r.position} className="mrow">
                <span className="mlbl">{REASON_LABEL[r.reason] || r.reason}</span>
                <span className="mtrack">
                  <span className="mfill" style={{
                    width: Math.max(Math.round((r.mentions / totalMentions) * 100), 4) + '%',
                    background: r.reason === 'vendor' || r.reason === 'shipping'
                      ? 'var(--violet)' : 'var(--amber)'
                  }} />
                </span>
                <span className="mval">{r.mentions}×</span>
                <span className="msub">{r.label}</span>
              </div>
            ))}
      </div>

      <div className="sec">Joiners finished this month</div>
      <div className="panelbox">
        {closed.length === 0
          ? <p className="note-txt">Nobody finished onboarding in this month yet.</p>
          : closed.sort((a, b) => Number(b.days_to_close) - Number(a.days_to_close)).map(t => (
              <div key={t.ref} className="mrow">
                <span className="mlbl">{t.name}</span>
                <span className="chip grey">{t.location || 'no location'}</span>
                <span className="mval" style={{ marginLeft: 'auto' }}>
                  {Number(t.days_to_close).toFixed(1)}d
                </span>
                <span className="msub">{t.ref}</span>
              </div>
            ))}
      </div>
    </>
  );
}

const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);

function prettyMonth(m) {
  const [y, mo] = m.split('-');
  return new Date(Number(y), Number(mo) - 1, 1)
    .toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}
