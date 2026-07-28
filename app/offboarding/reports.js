'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../common/shared';
import { BLOCKERS, fullName, initials, pretty } from './shared';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports() {
  const [leavers, setLeavers] = useState(null);
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState('');
  const [year, setYear] = useState('');
  const [drill, setDrill] = useState(null);

  const load = useCallback(async () => {
    const [l, s] = await Promise.all([
      supabase.from('leavers').select('*'),
      supabase.from('leaver_steps').select('*')
    ]);
    if (l.error) { setError(l.error.message); return; }
    setLeavers(l.data || []); setSteps(s.data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setDrill(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (error) return <div className="err">{error}</div>;
  if (!leavers) return <p className="note-txt">Loading…</p>;
  if (!leavers.length) return (
    <div className="empty">
      <b>Nothing to report yet</b>
      <span>Once people have been offboarded this fills in on its own.</span>
    </div>
  );

  const years = [...new Set(leavers.map(l => (l.last_working_day || '').slice(0, 4)).filter(Boolean))]
    .sort().reverse();
  const yr = year || years[0];

  const inYear = leavers.filter(l => (l.last_working_day || '').startsWith(yr));
  const done = inYear.filter(l => l.status === 'completed');
  const openOnes = leavers.filter(l => l.status === 'pending');

  /* how long from last working day to everything finished */
  const durations = done
    .filter(l => l.completed_at && l.last_working_day)
    .map(l => Math.round(
      (new Date(l.completed_at) - new Date(l.last_working_day + 'T00:00:00')) / 864e5));
  const avgDays = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;
  const onTime = durations.filter(d => d <= 3).length;

  /* per step: how often it is the thing still open */
  const stepStats = [];
  steps.forEach(s => {
    let g = stepStats.find(x => x.position === s.position);
    if (!g) { g = { position: s.position, label: s.label, open: [], blocked: [], done: 0 };
      stepStats.push(g); }
    const leaver = leavers.find(l => l.id === s.leaver_id);
    if (!leaver || leaver.status !== 'pending') {
      if (['done', 'na'].includes(s.status)) g.done++;
      return;
    }
    if (s.status === 'blocked') g.blocked.push({ ...s, leaver });
    if (!['done', 'na'].includes(s.status)) g.open.push({ ...s, leaver });
  });
  stepStats.sort((a, b) => a.position - b.position);
  const stepMax = Math.max(...stepStats.map(s => s.open.length), 1);

  /* why things stall */
  const blockCounts = {};
  steps.filter(s => s.status === 'blocked').forEach(s => {
    const key = BLOCKERS.find(b => (s.blocker || '').startsWith(b)) || 'Something else';
    (blockCounts[key] = blockCounts[key] || []).push({
      ...s, leaver: leavers.find(l => l.id === s.leaver_id) });
  });
  const blockList = Object.entries(blockCounts).sort((a, b) => b[1].length - a[1].length);
  const blockMax = Math.max(...blockList.map(b => b[1].length), 1);

  const byMonth = MONTHS.map((name, i) => {
    const key = `${yr}-${String(i + 1).padStart(2, '0')}`;
    const people = leavers.filter(l => (l.last_working_day || '').startsWith(key));
    return { name, people };
  });
  const monthMax = Math.max(...byMonth.map(m => m.people.length), 1);

  /* devices we have not got back */
  const deviceOpen = steps.filter(s => s.position === 5 && !['done', 'na'].includes(s.status))
    .map(s => ({ ...s, leaver: leavers.find(l => l.id === s.leaver_id) }))
    .filter(s => s.leaver && s.leaver.status === 'pending');

  return (
    <>
      <div className="headline">
        <p>
          <b>{inYear.length}</b> people left in {yr}, <b>{done.length}</b> fully offboarded.
          {avgDays !== null && <> It takes <b>{avgDays} days</b> on average from someone's last
            day to closing everything off{durations.length > 1 && <>, and{' '}
            <b>{Math.round((onTime / durations.length) * 100)}%</b> are done within three</>}.</>}
          {deviceOpen.length > 0 && <> <b>{deviceOpen.length}</b> device
            {deviceOpen.length > 1 ? 's have' : ' has'} not come back yet.</>}
          {' '}Everything here is clickable.
        </p>
      </div>

      <div className="stats">
        <Stat n={openOnes.length} l="In progress" />
        <Stat n={done.length} l={`Completed in ${yr}`} c="good" />
        <Stat n={avgDays === null ? '—' : avgDays + 'd'} l="Average to close" c="calm" />
        <Stat n={deviceOpen.length} l="Devices not returned" c={deviceOpen.length ? 'hot' : ''} />
        <Stat n={steps.filter(s => s.status === 'blocked').length} l="Blocked steps" c="warm" />
      </div>

      <div className="sec">What is still open, by step</div>
      <div className="panelbox">
        {stepStats.map(s => (
          <button key={s.position} className="bar-row clickable" disabled={!s.open.length}
            onClick={() => setDrill({ title: s.label + ' — still open',
              people: s.open.map(x => x.leaver) })}>
            <span className="bar-lbl">{s.label}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{
                width: (s.open.length / stepMax) * 100 + '%',
                background: s.blocked.length ? 'var(--rose)'
                  : s.open.length ? 'var(--amber)' : 'var(--line)'
              }} />
            </span>
            <span className="bar-n">{s.open.length}</span>
          </button>
        ))}
        <p className="foot-note">
          Counted across everyone still being offboarded. Red means at least one is blocked
          rather than simply not done yet — the step to look at first.
        </p>
      </div>

      <div className="sec">Why things stall</div>
      <div className="panelbox">
        {blockList.length === 0
          ? <p className="note-txt">
              Nothing is recorded as blocked. When a step is marked blocked, the reason lands
              here — that is what turns "the laptop never came back" into something you can
              show a pattern for.
            </p>
          : blockList.map(([reason, list]) => (
              <button key={reason} className="bar-row clickable"
                onClick={() => setDrill({ title: reason, people: list.map(x => x.leaver) })}>
                <span className="bar-lbl">{reason}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{
                    width: (list.length / blockMax) * 100 + '%', background: 'var(--rose)' }} />
                </span>
                <span className="bar-n">{list.length}</span>
              </button>
            ))}
      </div>

      <div className="sec">Leavers by month</div>
      <div className="panelbox">
        <div className="filters" style={{ marginBottom: 6 }}>
          <div>
            <label>Year</label>
            <select value={yr} onChange={e => setYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="cols">
          {byMonth.map(m => (
            <button key={m.name} className="col" disabled={!m.people.length}
              onClick={() => setDrill({ title: `Left in ${m.name} ${yr}`, people: m.people })}>
              <span className="colv">{m.people.length || ''}</span>
              <span className="coltrack">
                <span className="colbar" style={{
                  height: m.people.length ? Math.max((m.people.length / monthMax) * 100, 5) + '%' : '2px',
                  background: m.people.length ? 'var(--s5)' : 'var(--line)'
                }} />
              </span>
              <span className="coll">{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {deviceOpen.length > 0 && (
        <>
          <div className="sec hot">Devices still out</div>
          <div className="panelbox">
            {deviceOpen.map(s => (
              <div key={s.id} className="mrow">
                <span className="mlbl">{fullName(s.leaver)}</span>
                <span className="chip grey">{s.leaver.asset_serial || 'no serial'}</span>
                <span className="note-txt" style={{ flex: 1, minWidth: 140 }}>
                  {s.blocker || 'not yet collected'}
                </span>
                <span className="tcell bad">
                  {Math.max(0, Math.round(
                    (Date.now() - new Date(s.leaver.last_working_day + 'T00:00:00')) / 864e5))}d
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {drill && <Drill title={drill.title} people={drill.people}
                       onClose={() => setDrill(null)} />}
    </>
  );
}

function Drill({ title, people, onClose }) {
  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel">
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>{title}</h2>
            <div className="drawer-sub">{people.length} {people.length === 1 ? 'person' : 'people'}</div>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="drilllist">
          {people.filter(Boolean).map(p => (
            <div key={p.id} className="drillrow">
              <span className="ini">{initials(p)}</span>
              <span className="who">
                <span className="nm">{fullName(p)} <span className="pc-ref">{p.ref}</span></span>
                <span className="sub">
                  {p.department || 'no department'} · last day {pretty(p.last_working_day)}
                </span>
              </span>
            </div>
          ))}
        </div>
        <button className="btn ghost" style={{ marginTop: 18 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);
