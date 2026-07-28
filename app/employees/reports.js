'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../common/shared';
import { FIELD, REQUIRED, fullName, initials, missingOf, pretty } from './shared';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [year, setYear] = useState('');
  const [drill, setDrill] = useState(null);   // { title, people }

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('employees').select('*');
    if (error) { setError(error.message); return; }
    setRows((data || []).map(e => ({ ...e, _missing: missingOf(e) })));
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setDrill(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  if (error) return <div className="err">{error}</div>;
  if (!rows) return <p className="note-txt">Loading…</p>;

  const active = rows.filter(e => e.status === 'active');
  const years = [...new Set(rows.map(e => (e.hiring_date || '').slice(0, 4)).filter(Boolean))]
    .sort().reverse();
  const yr = year || years[0] || String(new Date().getFullYear());

  const complete = active.filter(e => !e._missing.length);
  const pct = Math.round((complete.length / (active.length || 1)) * 100);

  /* every required field, worst first — the work queue */
  const fields = REQUIRED.map(k => {
    const absent = active.filter(e => !String(e[k] ?? '').trim());
    return { k, label: FIELD[k]?.l || k, absent, pct: Math.round(
      ((active.length - absent.length) / (active.length || 1)) * 100) };
  }).sort((a, b) => b.absent.length - a.absent.length);

  const joiners = MONTHS.map((name, i) => {
    const key = `${yr}-${String(i + 1).padStart(2, '0')}`;
    const people = rows.filter(e => (e.hiring_date || '').startsWith(key));
    return { name, key, people };
  });
  const joinMax = Math.max(...joiners.map(j => j.people.length), 1);
  const joinTotal = joiners.reduce((a, j) => a + j.people.length, 0);

  const groupBy = (k) => {
    const m = {};
    active.forEach(e => {
      const v = (e[k] || '').trim() || 'Not set';
      (m[v] = m[v] || []).push(e);
    });
    return Object.entries(m).sort((a, b) => b[1].length - a[1].length);
  };

  return (
    <>
      <div className="headline">
        <p>
          <b>{active.length}</b> people on the team. <b>{pct}%</b> of records are complete
          {fields[0]?.absent.length > 0 && <>
            {' '}— the biggest gap is <b>{fields[0].label.toLowerCase()}</b>, missing for{' '}
            <b>{fields[0].absent.length}</b> of them</>}
          . <b>{joinTotal}</b> people joined in {yr}.
          {' '}Everything below is clickable — pick any bar or block to see who is in it.
        </p>
      </div>

      <div className="stats">
        <Stat n={active.length} l="On the team" />
        <Stat n={complete.length} l="Complete records" c="good" />
        <Stat n={active.length - complete.length} l="Need attention" c="hot" />
        <Stat n={joinTotal} l={`Joined in ${yr}`} c="calm" />
      </div>

      {/* ---------------- data health ---------------- */}
      <div className="sec">Record health</div>
      <div className="panelbox">
        <div className="health">
          <Ring pct={pct} done={complete.length} total={active.length} />
          <div className="healthside">
            <p className="hlead">
              {complete.length} of {active.length} records have everything we need.
            </p>
            <p className="note-txt">
              Each block below is one required field. The number is how many people are
              missing it — click to see them.
            </p>
            <div className="fieldgrid">
              {fields.map(f => (
                <button key={f.k}
                  className={'fcard ' + (f.absent.length === 0 ? 'ok'
                    : f.absent.length > active.length * 0.25 ? 'bad' : 'warn')}
                  disabled={!f.absent.length}
                  onClick={() => setDrill({
                    title: `Missing ${f.label.toLowerCase()}`, people: f.absent })}>
                  <span className="fnum">{f.absent.length || '✓'}</span>
                  <span className="flabel">{f.label}</span>
                  <span className="fbar"><span style={{ width: f.pct + '%' }} /></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- joiners ---------------- */}
      <div className="sec">Joined by month</div>
      <div className="panelbox">
        <div className="filters" style={{ marginBottom: 6 }}>
          <div>
            <label>Year</label>
            <select value={yr} onChange={e => setYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <span className="note-txt" style={{ marginLeft: 'auto' }}>
            {joinTotal} joined · busiest month {
              joiners.reduce((w, j) => j.people.length > w.people.length ? j : w, joiners[0]).name
            }
          </span>
        </div>
        <div className="cols">
          {joiners.map(j => (
            <button key={j.name} className="col"
              disabled={!j.people.length}
              onClick={() => setDrill({
                title: `Joined ${j.name} ${yr}`, people: j.people })}>
              <span className="colv">{j.people.length || ''}</span>
              <span className="coltrack">
                <span className="colbar" style={{
                  height: j.people.length ? Math.max((j.people.length / joinMax) * 100, 5) + '%' : '2px',
                  background: j.people.length ? 'var(--s1)' : 'var(--line)'
                }} />
              </span>
              <span className="coll">{j.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- where everyone sits ---------------- */}
      <div className="sec">Where everyone sits</div>
      <div className="panelbox">
        <div className="splitcols">
          <Breakdown title="Department" data={groupBy('department')} tone="s1" onPick={setDrill} />
          <Breakdown title="Entity" data={groupBy('entity')} tone="s3" onPick={setDrill} />
          <Breakdown title="Location" data={groupBy('location')} tone="s4" onPick={setDrill} />
        </div>
      </div>

      {drill && <Drill title={drill.title} people={drill.people} onClose={() => setDrill(null)} />}
    </>
  );
}

/* ------------------------------------------------------------ pieces */
/** Completeness as a ring. One number, read in a glance. */
function Ring({ pct, done, total }) {
  const r = 62, c = 2 * Math.PI * r;
  const tone = pct >= 90 ? 'var(--emerald)' : pct >= 60 ? 'var(--amber)' : 'var(--rose)';
  return (
    <svg className="ring" width="160" height="160" viewBox="0 0 160 160" role="img"
      aria-label={`${pct} percent of records complete`}>
      <circle cx="80" cy="80" r={r} fill="none" stroke="var(--line2)" strokeWidth="16" />
      <circle cx="80" cy="80" r={r} fill="none" stroke={tone} strokeWidth="16"
        strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform="rotate(-90 80 80)" />
      <text x="80" y="76" textAnchor="middle" fontSize="30" fontWeight="600"
        fill="var(--ink)">{pct}%</text>
      <text x="80" y="97" textAnchor="middle" fontSize="11" fill="var(--ink3)">
        {done} of {total}
      </text>
    </svg>
  );
}

function Breakdown({ title, data, tone, onPick }) {
  const max = Math.max(...data.map(d => d[1].length), 1);
  const shown = data.slice(0, 10);
  return (
    <div>
      <h4 className="bt">{title}</h4>
      {shown.map(([name, people]) => (
        <button key={name} className="bar-row clickable"
          onClick={() => onPick({ title: `${title}: ${name}`, people })}>
          <span className="bar-lbl">{name}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{
              width: (people.length / max) * 100 + '%',
              background: name === 'Not set' ? 'var(--rose)' : `var(--${tone})`
            }} />
          </span>
          <span className="bar-n">{people.length}</span>
        </button>
      ))}
      {data.length > 10 && (
        <p className="note-txt" style={{ marginTop: 8 }}>and {data.length - 10} more</p>
      )}
    </div>
  );
}

/** Whoever is behind the number just clicked. */
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
          {people.slice(0, 200).map(p => (
            <div key={p.id} className="drillrow">
              <span className="ini">{initials(p)}</span>
              <span className="who">
                <span className="nm">{fullName(p)}</span>
                <span className="sub">
                  {p.title || 'no title'}{p.department ? ' · ' + p.department : ''}
                  {p.hiring_date ? ' · joined ' + pretty(p.hiring_date) : ''}
                </span>
              </span>
              {p._missing?.length
                ? <span className="chip red">{p._missing.length} missing</span>
                : <span className="chip green">Complete</span>}
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
