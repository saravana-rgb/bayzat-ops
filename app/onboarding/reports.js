'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../common/shared';

/* What "on time" means here. Nothing enforces these — they only decide
   what the report calls good, so change them if they are wrong for you. */
const TARGET_TOUCH = 1;   // someone should pick a step up within a day
const TARGET_DONE  = 3;   // and finish it within three

const REASONS = {
  it: 'Waiting on IT', vendor: 'Waiting on vendor', approval: 'Waiting on approval',
  employee: 'Waiting on employee', shipping: 'In transit', other: 'Something else'
};
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const SHORT  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Durations people can read. 0.2 days means nothing; 5 hours means something. */
function dur(d) {
  if (d == null || isNaN(d)) return '—';
  const n = Number(d);
  if (n < 0.02) return 'minutes';
  if (n < 1)    return Math.round(n * 24) + ' hrs';
  if (n < 2)    return '1 day';
  if (n < 10)   return (Math.round(n * 10) / 10) + ' days';
  return Math.round(n) + ' days';
}

export default function Reports() {
  const [rows, setRows] = useState(null);
  const [delays, setDelays] = useState([]);
  const [tix, setTix] = useState([]);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      supabase.from('v_step_response').select('*'),
      supabase.from('v_delay_reasons').select('*'),
      supabase.from('v_ticket_metrics').select('*')
    ]);
    if (a.error) { setError(a.error.message); return; }
    setRows(a.data || []); setDelays(b.data || []); setTix(c.data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const done = useMemo(() => (rows || []).filter(r => r.month), [rows]);
  const years = useMemo(
    () => [...new Set(done.map(r => r.month.slice(0, 4)))].sort().reverse(), [done]);
  useEffect(() => { if (!year && years.length) setYear(years[0]); }, [years, year]);

  if (error) return <div className="err">{error}</div>;
  if (!rows) return <p className="note-txt">Loading…</p>;
  if (!done.length) return (
    <div className="empty">
      <b>Nothing to report yet</b>
      <span>Once steps start being completed this fills in on its own, month by month.</span>
    </div>
  );

  const monthsInYear = [...new Set(done.filter(r => r.month.startsWith(year))
    .map(r => r.month.slice(5, 7)))].sort();
  const period = month ? `${year}-${month}` : null;
  const inRange = m => m && (period ? m === period : m.startsWith(year));

  const scope = done.filter(r => inRange(r.month));
  const scopeDelays = delays.filter(d => inRange(d.month));
  const scopeTix = tix.filter(t => inRange(t.month_closed));
  const label = period ? `${MONTHS[Number(month) - 1]} ${year}` : `All of ${year}`;

  /* ---- per step ---- */
  const steps = [];
  scope.forEach(r => {
    let g = steps.find(x => x.position === r.position);
    if (!g) { g = { position: r.position, label: r.label, items: [] }; steps.push(g); }
    g.items.push(r);
  });
  steps.sort((a, b) => a.position - b.position);

  const summary = steps.map(g => {
    const touch = g.items.filter(i => i.days_to_first_touch != null).map(i => +i.days_to_first_touch);
    const total = g.items.filter(i => i.days_to_done != null).map(i => +i.days_to_done);
    const onTime = total.filter(d => d <= TARGET_DONE).length;
    const t = touch.length ? avg(touch) : null;
    const d = total.length ? avg(total) : null;
    return {
      position: g.position, label: g.label, count: g.items.length,
      touch: t, total: d, waiting: (t != null && d != null) ? Math.max(d - t, 0) : null,
      worst: total.length ? Math.max(...total) : null,
      onTime: total.length ? Math.round((onTime / total.length) * 100) : null,
      delays: g.items.reduce((n, i) => n + (i.delays_logged || 0), 0)
    };
  });

  /* ---- monthly trend, always the full year ---- */
  const trend = monthsInYear.map(m => {
    const key = `${year}-${m}`;
    const closed = tix.filter(t => t.month_closed === key);
    const stepsDone = done.filter(r => r.month === key).length;
    return {
      m, name: SHORT[Number(m) - 1],
      joiners: closed.length,
      avg: closed.length ? avg(closed.map(t => +t.days_to_close)) : null,
      steps: stepsDone
    };
  });
  const trendMax = Math.max(...trend.map(t => t.avg || 0), 1);

  const ours = scopeDelays.filter(d => d.fault === 'Us').length;
  const theirs = scopeDelays.filter(d => d.fault === 'Outside').length;
  const allDone = scope.filter(r => r.days_to_done != null).map(r => +r.days_to_done);
  const onTimePct = allDone.length
    ? Math.round((allDone.filter(d => d <= TARGET_DONE).length / allDone.length) * 100) : null;
  const avgClose = scopeTix.length ? avg(scopeTix.map(t => +t.days_to_close)) : null;
  const slowestStep = summary.reduce((w, s) =>
    (s.total || 0) > (w?.total || 0) ? s : w, null);
  const widest = Math.max(...summary.map(s => s.total || 0), 1);

  return (
    <>
      <div className="filters">
        <div>
          <label>Year</label>
          <select value={year} onChange={e => { setYear(e.target.value); setMonth(''); }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label>Month</label>
          <select value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">Whole year</option>
            {monthsInYear.map(m => <option key={m} value={m}>{MONTHS[Number(m) - 1]}</option>)}
          </select>
        </div>
        <div className="dl">
          <button className="mini" onClick={() => window.print()}>Print / PDF</button>
          <button className="btn ghost" onClick={() => download(label, summary, scopeDelays, scopeTix)}>
            Download CSV
          </button>
        </div>
      </div>

      {/* ---------- plain-language headline ---------- */}
      <div className="headline">
        <p>
          In <b>{label.toLowerCase()}</b> you finished onboarding for <b>{scopeTix.length}</b>
          {scopeTix.length === 1 ? ' joiner' : ' joiners'}
          {avgClose != null && <> , taking <b>{dur(avgClose)}</b> on average from ticket to done</>}.
          {onTimePct != null && <> <b>{onTimePct}%</b> of steps were finished within {TARGET_DONE} days.</>}
          {slowestStep && slowestStep.total != null &&
            <> The slowest step was <b>{slowestStep.label}</b> at {dur(slowestStep.total)}.</>}
          {(ours + theirs) > 0 &&
            <> Of {ours + theirs} logged delays, <b>{ours}</b> were on us and <b>{theirs}</b> were outside our control.</>}
        </p>
      </div>

      <div className="stats">
        <Stat n={scopeTix.length} l="Joiners finished" c="good" />
        <Stat n={avgClose == null ? '—' : dur(avgClose)} l="Typical time" c="calm" />
        <Stat n={onTimePct == null ? '—' : onTimePct + '%'} l={`Within ${TARGET_DONE} days`}
              c={onTimePct != null && onTimePct < 70 ? 'hot' : 'good'} />
        <Stat n={ours} l="Delays on us" c={ours ? 'hot' : ''} />
        <Stat n={theirs} l="Delays outside" c="warm" />
      </div>

      {/* ---------- monthly trend ---------- */}
      <div className="sec">Time to finish onboarding, by month</div>
      <div className="panelbox">
        {trend.every(t => t.avg == null)
          ? <p className="note-txt">Nobody has finished onboarding yet this year.</p>
          : <>
              <div className="cols">
                {trend.map(t => (
                  <div key={t.m} className={'col' + (period === `${year}-${t.m}` ? ' on' : '')}
                       onClick={() => setMonth(period === `${year}-${t.m}` ? '' : t.m)}>
                    <span className="colv">{t.avg == null ? '' : dur(t.avg)}</span>
                    <span className="coltrack">
                      <span className="colbar" style={{
                        height: t.avg == null ? '2px' : Math.max((t.avg / trendMax) * 100, 3) + '%',
                        background: t.avg == null ? 'var(--line)'
                          : t.avg <= TARGET_DONE ? 'var(--emerald)'
                          : t.avg <= TARGET_DONE * 2 ? 'var(--amber)' : 'var(--rose)'
                      }} />
                    </span>
                    <span className="coll">{t.name}</span>
                    <span className="colc">{t.joiners || '—'}</span>
                  </div>
                ))}
              </div>
              <p className="foot-note">
                Height is the average days from ticket raised to fully onboarded. The number under
                each month is how many people finished. Green is inside {TARGET_DONE} days, amber up
                to {TARGET_DONE * 2}, red beyond. Click a month to filter the whole report.
              </p>
            </>}
      </div>

      {/* ---------- where the time goes ---------- */}
      <div className="sec">Where the time goes, step by step</div>
      <div className="panelbox">
        <div className="legend">
          <span><i className="k touch" /> Before anyone picked it up</span>
          <span><i className="k work" /> Being worked on or waiting</span>
          <span><i className="k target" /> {TARGET_DONE}-day target</span>
        </div>
        {summary.map(s => (
          <div key={s.position} className="srow">
            <span className="slabel">
              <span className={'pnum p' + s.position}>{s.position}</span>{s.label}
            </span>
            <span className="sbar">
              <span className="stouch" style={{ width: pctOf(s.touch, widest) }} />
              <span className={'swork p' + s.position} style={{ width: pctOf(s.waiting, widest) }} />
              <span className="starget" style={{ left: pctOf(TARGET_DONE, widest) }} />
            </span>
            <span className="stotal">{dur(s.total)}</span>
          </div>
        ))}
        <p className="foot-note">
          The pale part is how long the step sat before anyone touched it — that part is ours. The
          solid part is time spent working or waiting on someone else. The dashed line is the target.
        </p>
      </div>

      {/* ---------- on time ---------- */}
      <div className="sec">Finished on time</div>
      <div className="panelbox">
        {summary.map(s => (
          <div key={s.position} className="mrow">
            <span className="mlbl">{s.label}</span>
            <span className="mtrack">
              <span className="mfill" style={{
                width: (s.onTime ?? 0) + '%',
                background: s.onTime == null ? 'var(--line)'
                  : s.onTime >= 80 ? 'var(--emerald)'
                  : s.onTime >= 50 ? 'var(--amber)' : 'var(--rose)'
              }} />
            </span>
            <span className="mval">{s.onTime == null ? '—' : s.onTime + '%'}</span>
            <span className="msub">{s.count} done · worst {dur(s.worst)}</span>
          </div>
        ))}
      </div>

      {/* ---------- fault split ---------- */}
      <div className="sec">Who we were waiting on</div>
      <div className="panelbox">
        {scopeDelays.length === 0
          ? <p className="note-txt">
              Nothing was logged as delayed. Reasons appear here when someone comments on a step and
              picks why it is waiting — that is what separates our delays from a vendor&apos;s.
            </p>
          : <>
              <div className="donutwrap">
                <Donut ours={ours} theirs={theirs} />
                <div className="donutkey">
                  <div><i className="k us" /><b>{ours}</b> on us
                    <span> waiting on IT or an internal approval</span></div>
                  <div><i className="k them" /><b>{theirs}</b> outside
                    <span> vendor, shipping, or the employee</span></div>
                </div>
              </div>
              {scopeDelays.slice(0, 40).map((d, i) => (
                <div key={i} className="drow">
                  <span className={'chip ' + (d.fault === 'Us' ? 'red' : 'amber')}>
                    {REASONS[d.reason] || d.reason}
                  </span>
                  <span className="dtext"><b>{d.name}</b> · {d.label} — {d.comment}</span>
                  <span className="dwho">
                    {(d.actor || '').split('@')[0]} · {String(d.created_at).slice(0, 10)}
                  </span>
                </div>
              ))}
            </>}
      </div>

      {/* ---------- joiners ---------- */}
      <div className="sec">Joiners finished</div>
      <div className="panelbox">
        {scopeTix.length === 0
          ? <p className="note-txt">Nobody completed onboarding in this period.</p>
          : scopeTix.sort((a, b) => +b.days_to_close - +a.days_to_close).map(t => (
              <div key={t.ref} className="mrow">
                <span className="mlbl">{t.name}</span>
                <span className="chip grey">{t.location || 'no location'}</span>
                <span className={'tcell ' + (+t.days_to_close <= TARGET_DONE ? 'ok' : 'bad')}
                      style={{ marginLeft: 'auto' }}>{dur(t.days_to_close)}</span>
                <span className="msub">{t.ref}</span>
              </div>
            ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------- pieces */
function Donut({ ours, theirs }) {
  const total = ours + theirs || 1;
  const c = 2 * Math.PI * 34;
  const usLen = (ours / total) * c;
  return (
    <svg width="104" height="104" viewBox="0 0 104 104" role="img"
      aria-label={`${ours} delays on us, ${theirs} outside`}>
      <circle cx="52" cy="52" r="34" fill="none" stroke="var(--amber)" strokeWidth="16" />
      <circle cx="52" cy="52" r="34" fill="none" stroke="var(--rose)" strokeWidth="16"
        strokeDasharray={`${usLen} ${c - usLen}`} transform="rotate(-90 52 52)" />
      <text x="52" y="49" textAnchor="middle" fontSize="19" fontWeight="700"
        fill="var(--ink)">{total}</text>
      <text x="52" y="64" textAnchor="middle" fontSize="9.5" fontWeight="600"
        fill="var(--ink3)">delays</text>
    </svg>
  );
}

const avg = a => Math.round((a.reduce((n, x) => n + x, 0) / a.length) * 100) / 100;
const pctOf = (v, max) => v == null ? '0%' : Math.min((v / max) * 100, 100) + '%';
const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);

function download(label, summary, delays, tickets) {
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const lines = [];
  lines.push(['Onboarding report', label].map(q).join(','));
  lines.push('');
  lines.push(['Step', 'Completed', 'Days before pick-up', 'Days to complete', 'Worst',
              'On time %', 'Delays logged'].map(q).join(','));
  summary.forEach(s => lines.push([s.label, s.count, s.touch ?? '', s.total ?? '',
    s.worst ?? '', s.onTime ?? '', s.delays].map(q).join(',')));
  lines.push('');
  lines.push(['Delays'].map(q).join(','));
  lines.push(['Date', 'Ticket', 'Joiner', 'Step', 'Reason', 'On us or outside', 'Comment', 'Logged by']
    .map(q).join(','));
  delays.forEach(d => lines.push([String(d.created_at).slice(0, 10), d.ref, d.name, d.label,
    REASONS[d.reason] || d.reason, d.fault, d.comment, d.actor].map(q).join(',')));
  lines.push('');
  lines.push(['Joiners finished'].map(q).join(','));
  lines.push(['Ticket', 'Name', 'Location', 'Joining date', 'Days to finish'].map(q).join(','));
  tickets.forEach(t => lines.push([t.ref, t.name, t.location, t.doj, t.days_to_close]
    .map(q).join(',')));

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'onboarding-' + label.toLowerCase().replace(/\s+/g, '-') + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
