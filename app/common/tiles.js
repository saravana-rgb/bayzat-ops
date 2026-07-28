'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../common/shared';
import { ASSET_LABEL, ASSET_TYPES, REQUIRED, FIELD, missingOf, pretty } from './shared';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [year, setYear] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('employees').select('*');
    if (error) { setError(error.message); return; }
    setRows((data || []).map(e => ({ ...e, _missing: missingOf(e) })));
  }, []);
  useEffect(() => { load(); }, [load]);

  if (error) return <div className="err">{error}</div>;
  if (!rows) return <p className="note-txt">Loading…</p>;

  const active = rows.filter(e => e.status === 'active');
  const years = [...new Set(rows.map(e => (e.hiring_date || '').slice(0, 4)).filter(Boolean))]
    .sort().reverse();
  const yr = year || years[0] || String(new Date().getFullYear());

  const by = (k) => {
    const m = {};
    active.forEach(e => { const v = (e[k] || '').trim() || 'Not set'; m[v] = (m[v] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };

  const dept = by('department');
  const entity = by('entity');
  const location = by('location');

  const joiners = MONTHS.map((name, i) => ({
    name,
    n: rows.filter(e => (e.hiring_date || '').startsWith(`${yr}-${String(i + 1).padStart(2, '0')}`)).length
  }));
  const joinMax = Math.max(...joiners.map(j => j.n), 1);

  // how complete each field is across the team
  const fields = REQUIRED.map(k => {
    const filled = active.filter(e => String(e[k] ?? '').trim()).length;
    return { k, label: FIELD[k]?.l || k, filled, pct: Math.round((filled / (active.length || 1)) * 100) };
  }).sort((a, b) => a.pct - b.pct);

  const devices = ASSET_TYPES.map(([v, l]) => ({
    v, l, n: active.filter(e => e.asset_type === v).length
  })).concat([{ v: '', l: 'Not recorded', n: active.filter(e => !e.asset_type).length }])
    .filter(d => d.n > 0);
  const devMax = Math.max(...devices.map(d => d.n), 1);

  const tenures = [
    ['Under 6 months', 0, 0.5], ['6 to 12 months', 0.5, 1],
    ['1 to 2 years', 1, 2], ['2 to 5 years', 2, 5], ['Over 5 years', 5, 99]
  ].map(([label, lo, hi]) => ({
    label,
    n: active.filter(e => {
      if (!e.hiring_date) return false;
      const y = (Date.now() - new Date(e.hiring_date + 'T00:00:00')) / 31557600000;
      return y >= lo && y < hi;
    }).length
  })).filter(t => t.n > 0);
  const tenMax = Math.max(...tenures.map(t => t.n), 1);

  const complete = active.filter(e => !e._missing.length).length;
  const pctComplete = Math.round((complete / (active.length || 1)) * 100);

  return (
    <>
      <div className="headline">
        <p>
          <b>{active.length}</b> people across <b>{entity.length}</b> entities and
          <b> {dept.length}</b> departments. <b>{pctComplete}%</b> of records are complete;
          the field most often missing is <b>{fields[0]?.label.toLowerCase()}</b>, absent for{' '}
          <b>{active.length - (fields[0]?.filled || 0)}</b> people.
          {' '}<b>{active.filter(e => !e.asset_type).length}</b> have no device recorded.
        </p>
      </div>

      <div className="stats">
        <Stat n={active.length} l="On the team" />
        <Stat n={complete} l="Complete records" c="good" />
        <Stat n={active.length - complete} l="Need attention" c="hot" />
        <Stat n={joiners.reduce((a, j) => a + j.n, 0)} l={`Joined in ${yr}`} c="calm" />
        <Stat n={active.filter(e => e.asset_type === 'bayzat').length} l="Bayzat devices" />
      </div>

      <div className="sec">How complete the records are</div>
      <div className="panelbox">
        {fields.map(f => (
          <div key={f.k} className="mrow">
            <span className="mlbl">{f.label}</span>
            <span className="mtrack">
              <span className="mfill" style={{
                width: f.pct + '%',
                background: f.pct >= 95 ? 'var(--emerald)'
                  : f.pct >= 80 ? 'var(--amber)' : 'var(--rose)'
              }} />
            </span>
            <span className="mval">{f.pct}%</span>
            <span className="msub">{active.length - f.filled} missing</span>
          </div>
        ))}
        <p className="foot-note">
          Ordered worst first, so the top row is the field worth chasing. A record counts as
          complete only when every one of these is filled in.
        </p>
      </div>

      <div className="sec">Joiners by month</div>
      <div className="panelbox">
        <div className="filters" style={{ marginBottom: 10 }}>
          <div>
            <label>Year</label>
            <select value={yr} onChange={e => setYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="cols">
          {joiners.map(j => (
            <div key={j.name} className="col">
              <span className="colv">{j.n || ''}</span>
              <span className="coltrack">
                <span className="colbar" style={{
                  height: j.n ? Math.max((j.n / joinMax) * 100, 4) + '%' : '2px',
                  background: j.n ? 'var(--s1)' : 'var(--line)'
                }} />
              </span>
              <span className="coll">{j.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sec">Where everyone sits</div>
      <div className="panelbox">
        <div className="splitcols">
          <Breakdown title="Department" data={dept} tone="s1" />
          <Breakdown title="Entity" data={entity} tone="s3" />
          <Breakdown title="Location" data={location} tone="s4" />
        </div>
      </div>

      <div className="sec">Devices and tenure</div>
      <div className="panelbox">
        <div className="splitcols">
          <div>
            <h4 className="bt">Device type</h4>
            {devices.map(d => (
              <div key={d.v || 'none'} className="bar-row">
                <span className="bar-lbl">{d.l}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{
                    width: (d.n / devMax) * 100 + '%',
                    background: d.v ? 'var(--s2)' : 'var(--rose)'
                  }} />
                </span>
                <span className="bar-n">{d.n}</span>
              </div>
            ))}
          </div>
          <div>
            <h4 className="bt">How long they have been here</h4>
            {tenures.map(t => (
              <div key={t.label} className="bar-row">
                <span className="bar-lbl">{t.label}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{
                    width: (t.n / tenMax) * 100 + '%', background: 'var(--s6)'
                  }} />
                </span>
                <span className="bar-n">{t.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Breakdown({ title, data, tone }) {
  const max = Math.max(...data.map(d => d[1]), 1);
  return (
    <div>
      <h4 className="bt">{title}</h4>
      {data.slice(0, 12).map(([name, n]) => (
        <div key={name} className="bar-row">
          <span className="bar-lbl">{name}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{
              width: (n / max) * 100 + '%',
              background: name === 'Not set' ? 'var(--rose)' : `var(--${tone})`
            }} />
          </span>
          <span className="bar-n">{n}</span>
        </div>
      ))}
      {data.length > 12 && <p className="note-txt">and {data.length - 12} more</p>}
    </div>
  );
}

const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);
