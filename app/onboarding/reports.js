'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../shared';

/* How quickly we expect a step to be picked up and finished, in days.
   Nothing enforces these — they only decide what counts as "on time"
   in this report, so change them if they are wrong for your team. */
const TARGET_TOUCH = 1;   // someone should have started it within a day
const TARGET_DONE  = 3;   // and finished within three

const REASONS = {
  it: 'Waiting on IT', vendor: 'Waiting on vendor', approval: 'Waiting on approval',
  employee: 'Waiting on employee', shipping: 'In transit', other: 'Something else'
};
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

export default function Reports() {
  const [rows, setRows] = useState(null);       // v_step_response
  const [delays, setDelays] = useState([]);     // v_delay_reasons
  const [tix, setTix] = useState([]);           // v_ticket_metrics
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
  const inRange = r => period ? r.month === period : r.month.startsWith(year);

  const scope = done.filter(inRange);
  const scopeDelays = delays.filter(d => period ? d.month === period : d.month.startsWith(year));
  const scopeTix = tix.filter(t => t.month_closed &&
    (period ? t.month_closed === period : t.month_closed.startsWith(year)));

  // per step
  const steps = [];
  scope.forEach(r => {
    let g = steps.find(x => x.position === r.position);
    if (!g) { g = { position: r.position, label: r.label, items: [] }; steps.push(g); }
    g.items.push(r);
  });
  steps.sort((a, b) => a.position - b.position);

  const summary = steps.map(g => {
    const touch = g.items.filter(i => i.days_to_first_touch != null)
      .map(i => Number(i.days_to_first_touch));
    const doneD = g.items.filter(i => i.days_to_done != null).map(i => Number(i.days_to_done));
    const onTime = doneD.filter(d => d <= TARGET_DONE).length;
    return {
      position: g.position, label: g.label, count: g.items.length,
      avgTouch: touch.length ? avg(touch) : null,
      avgDone: doneD.length ? avg(doneD) : null,
      worst: doneD.length ? Math.max(...doneD) : null,
      onTimePct: doneD.length ? Math.round((onTime / doneD.length) * 100) : null,
      delays: g.items.reduce((n, i) => n + (i.delays_logged || 0), 0)
    };
  });

  const slowest = Math.max(...summary.map(s => s.avgDone || 0), 1);
  const ourFault = scopeDelays.filter(d => d.fault === 'Us').length;
  const theirFault = scopeDelays.filter(d => d.fault === 'Outside').length;
  const allDone = scope.filter(r => r.days_to_done != null).map(r => Number(r.days_to_done));
  const overallOnTime = allDone.length
    ? Math.round((allDone.filter(d => d <= TARGET_DONE).length / allDone.length) * 100) : null;
  const avgClose = scopeTix.length
    ? avg(scopeTix.map(t => Number(t.days_to_close))) : null;

  const label = period ? `${MONTHS[Number(month) - 1]} ${year}` : `All of ${year}`;

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
            {monthsInYear.map(m => (
              <option key={m} value={m}>{MONTHS[Number(m) - 1]}</option>
            ))}
          </select>
        </div>
        <button className="btn ghost dl" onClick={() => download(label, summary, scopeDelays, scopeTix)}>
          Download CSV
        </button>
      </div>

      <div className="stats">
        <Stat n={scopeTix.length} l="Joiners finished" c="good" />
        <Stat n={avgClose == null ? '—' : avgClose + 'd'} l="Avg to finish" c="calm" />
        <Stat n={overallOnTime == null ? '—' : overallOnTime + '%'} l={`Done within ${TARGET_DONE}d`}
              c={overallOnTime != null && overallOnTime < 70 ? 'hot' : 'good'} />
        <Stat n={ourFault} l="Delays on us" c={ourFault ? 'hot' : ''} />
        <Stat n={theirFault} l="Delays outside" c="warm" />
      </div>

      <div className="sec">Each step, {label.toLowerCase()}</div>
      <div className="panelbox">
        <div className="thead">
          <span className="mlbl">Step</span>
          <span className="tcell">Done</span>
          <span className="tcell">Picked up</span>
          <span className="tcell">Completed</span>
          <span className="tcell">Worst</span>
          <span className="tcell">On time</span>
        </div>
        {summary.map(s => (
          <div key={s.position} className="mrow">
            <span className="mlbl">
              <span className={'pnum p' + s.position}>{s.position}</span> {s.label}
            </span>
            <span className="tcell">{s.count}</span>
            <span className={'tcell ' + tone(s.avgTouch, TARGET_TOUCH)}>
              {s.avgTouch == null ? '—' : s.avgTouch + 'd'}
            </span>
            <span className={'tcell ' + tone(s.avgDone, TARGET_DONE)}>
              {s.avgDone == null ? '—' : s.avgDone + 'd'}
            </span>
            <span className="tcell dim">{s.worst == null ? '—' : s.worst + 'd'}</span>
            <span className={'tcell ' + (s.onTimePct == null ? '' : s.onTimePct >= 70 ? 'ok' : 'bad')}>
              {s.onTimePct == null ? '—' : s.onTimePct + '%'}
            </span>
          </div>
        ))}
        <p className="foot-note">
          Picked up is how long before anyone touched the step — the fairest test of whether we
          acted. Completed includes time spent waiting on other people. On time means finished
          within {TARGET_DONE} days of the ticket being raised.
        </p>
      </div>

      <div className="sec">Average days to complete</div>
      <div className="panelbox">
        {summary.map(s => (
          <div key={s.position} className="mrow">
            <span className="mlbl">{s.label}</span>
            <span className="mtrack">
              <span className={'mfill p' + s.position} style={{
                width: Math.max(Math.round(((s.avgDone || 0) / slowest) * 100), 2) + '%'
              }} />
            </span>
            <span className="mval">{s.avgDone == null ? '—' : s.avgDone + 'd'}</span>
            <span className="msub">{s.count} completed</span>
          </div>
        ))}
      </div>

      <div className="sec">Why things were held up</div>
      <div className="panelbox">
        {scopeDelays.length === 0
          ? <p className="note-txt">
              Nothing was logged as delayed. Reasons appear here when someone comments on a step
              and picks why it is waiting — that is what separates our delays from a vendor&apos;s.
            </p>
          : <>
              <div className="split">
                <div className="splitbar">
                  <span className="sfill us" style={{ width: pct(ourFault, ourFault + theirFault) }} />
                  <span className="sfill them" style={{ width: pct(theirFault, ourFault + theirFault) }} />
                </div>
                <div className="splitkey">
                  <span><i className="k us" /> On us · {ourFault}</span>
                  <span><i className="k them" /> Outside · {theirFault}</span>
                </div>
              </div>
              {scopeDelays.slice(0, 40).map((d, i) => (
                <div key={i} className="drow">
                  <span className={'chip ' + (d.fault === 'Us' ? 'red' : 'amber')}>
                    {REASONS[d.reason] || d.reason}
                  </span>
                  <span className="dtext">
                    <b>{d.name}</b> · {d.label} — {d.comment}
                  </span>
                  <span className="dwho">
                    {(d.actor || '').split('@')[0]} · {String(d.created_at).slice(0, 10)}
                  </span>
                </div>
              ))}
            </>}
      </div>

      <div className="sec">Joiners finished</div>
      <div className="panelbox">
        {scopeTix.length === 0
          ? <p className="note-txt">Nobody completed onboarding in this period.</p>
          : scopeTix.sort((a, b) => Number(b.days_to_close) - Number(a.days_to_close)).map(t => (
              <div key={t.ref} className="mrow">
                <span className="mlbl">{t.name}</span>
                <span className="chip grey">{t.location || 'no location'}</span>
                <span className={'tcell ' + (Number(t.days_to_close) <= TARGET_DONE ? 'ok' : 'bad')}
                      style={{ marginLeft: 'auto' }}>
                  {Number(t.days_to_close).toFixed(1)}d
                </span>
                <span className="msub">{t.ref}</span>
              </div>
            ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------- helpers */
const avg = (a) => Math.round((a.reduce((n, x) => n + x, 0) / a.length) * 10) / 10;
const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0) + '%';
const tone = (v, target) => v == null ? '' : v <= target ? 'ok' : v <= target * 2 ? 'warn' : 'bad';
const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);

/** Everything in the current period, as one spreadsheet-friendly file. */
function download(label, summary, delays, tickets) {
  const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  const lines = [];

  lines.push(['Onboarding report', label].map(q).join(','));
  lines.push('');
  lines.push(['Step', 'Completed', 'Avg days to pick up', 'Avg days to complete',
              'Worst days', 'On time %', 'Delays logged'].map(q).join(','));
  summary.forEach(s => lines.push([s.label, s.count, s.avgTouch ?? '', s.avgDone ?? '',
    s.worst ?? '', s.onTimePct ?? '', s.delays].map(q).join(',')));

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
