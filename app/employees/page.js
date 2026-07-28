'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthGate, Bar, supabase } from '../common/shared';
import { ASSET_LABEL, ASSET_TYPES, FIELD, GROUPS, fullName, initials,
         missingOf, pretty, tenure } from './shared';

export default function EmployeesPage() {
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
        title="Employees"
        sub="Everyone who works here, and what we still need to know about them"
        right={<a className="back" href="/">← All tiles</a>}
      />
      <Directory email={email} />
    </div>
  );
}

function Directory({ email }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [scope, setScope] = useState('active');     // active | gaps | leavers | all
  const [facet, setFacet] = useState({ key: '', value: '' });
  const [sort, setSort] = useState('name');
  const [openId, setOpenId] = useState(null);
  const [saved, setSaved] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('employees').select('*');
    if (error) { setError(error.message); return; }
    setError(''); setRows(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  // keyboard: / focuses search, Escape closes the drawer
  useEffect(() => {
    const onKey = e => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault(); document.getElementById('emp-search')?.focus();
      }
      if (e.key === 'Escape') setOpenId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  async function save(id, patch) {
    const { error } = await supabase.from('employees')
      .update({ ...patch, updated_by: email }).eq('id', id);
    if (error) { setError(error.message); return false; }
    setSaved('Saved'); setTimeout(() => setSaved(''), 1600);
    await load();
    return true;
  }

  const withMissing = useMemo(
    () => (rows || []).map(e => ({ ...e, _missing: missingOf(e) })), [rows]);

  /* the values that actually occur, for the filter menus and the datalists */
  const facets = useMemo(() => {
    const pick = k => [...new Set(withMissing.map(e => (e[k] || '').trim()).filter(Boolean))].sort();
    return { department: pick('department'), entity: pick('entity'),
             location: pick('location'), office: pick('office'),
             nationality: pick('nationality'), gender: pick('gender') };
  }, [withMissing]);

  if (!rows) return <p className="note-txt">Loading the directory…</p>;

  const term = q.trim().toLowerCase();
  let list = withMissing.filter(e => {
    if (scope === 'active'  && e.status !== 'active') return false;
    if (scope === 'leavers' && e.status !== 'leaver') return false;
    if (scope === 'gaps'    && (e.status !== 'active' || !e._missing.length)) return false;
    if (facet.key && (e[facet.key] || '') !== facet.value) return false;
    if (!term) return true;
    return [e.first_name, e.last_name, e.preferred_name, e.work_email, e.employee_id,
            e.title, e.department, e.reports_to, e.asset_serial]
      .some(v => (v || '').toLowerCase().includes(term));
  });

  list.sort((a, b) =>
    sort === 'gaps'   ? b._missing.length - a._missing.length
  : sort === 'newest' ? String(b.hiring_date || '').localeCompare(String(a.hiring_date || ''))
  : fullName(a).localeCompare(fullName(b)));

  const active = withMissing.filter(e => e.status === 'active');
  const gaps = active.filter(e => e._missing.length);
  const noAsset = active.filter(e => !e.asset_type);
  const open = withMissing.find(e => e.id === openId);

  return (
    <>
      {error && <div className="err">{error}</div>}
      {saved && <div className="busy">{saved}</div>}

      <div className="stats">
        <Stat n={active.length} l="On the team" />
        <Stat n={active.length - gaps.length} l="Complete records" c="good" />
        <Stat n={gaps.length} l="Need attention" c={gaps.length ? 'hot' : ''} />
        <Stat n={noAsset.length} l="No device recorded" c="warm" />
        <Stat n={facets.department.length} l="Departments" />
      </div>

      <div className="toolbar">
        <div className="tabset">
          {[['active', 'Everyone', active.length],
            ['gaps', 'Needs attention', gaps.length],
            ['leavers', 'Leavers', withMissing.filter(e => e.status === 'leaver').length],
            ['all', 'All records', withMissing.length]].map(([k, l, n]) => (
            <button key={k} data-on={scope === k ? '1' : '0'}
              onClick={() => { setScope(k); setFacet({ key: '', value: '' }); }}>
              {l}{n ? ` · ${n}` : ''}
            </button>
          ))}
        </div>
        <input id="emp-search" className="search" value={q} placeholder="Search name, email, number, title  ( / )"
          onChange={e => setQ(e.target.value)} />
        <div className="sync">
          <select value={sort} onChange={e => setSort(e.target.value)} className="sortsel">
            <option value="name">A to Z</option>
            <option value="newest">Newest first</option>
            <option value="gaps">Most gaps first</option>
          </select>
        </div>
      </div>

      <div className="facets">
        {['department', 'entity', 'location'].map(k => (
          <select key={k} className="facetsel"
            value={facet.key === k ? facet.value : ''}
            onChange={e => setFacet(e.target.value ? { key: k, value: e.target.value }
                                                   : { key: '', value: '' })}>
            <option value="">All {k}s</option>
            {facets[k].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        ))}
        {facet.key && (
          <button className="mini" onClick={() => setFacet({ key: '', value: '' })}>
            Clear {facet.value}
          </button>
        )}
        <span className="count">{list.length} shown</span>
      </div>

      {list.length === 0
        ? <div className="empty">
            <b>Nobody matches</b>
            <span>Try a different search, or clear the filters.</span>
          </div>
        : <div className="people">
            {list.map(e => (
              <button key={e.id} className={'person' + (e._missing.length ? ' gap' : '')}
                onClick={() => setOpenId(e.id)}>
                <span className={'ini ' + (e.status === 'leaver' ? 'left' : '')}>{initials(e)}</span>
                <span className="who">
                  <span className="nm">
                    {fullName(e)}
                    {e.status === 'leaver' && <span className="chip grey">Left</span>}
                  </span>
                  <span className="sub">{e.title || 'no title'} · {e.department || 'no department'}</span>
                </span>
                <span className="col hide-sm">{e.entity || '—'}</span>
                <span className="col hide-sm">{e.location || '—'}</span>
                <span className="asset">
                  {e.asset_type
                    ? <span className={'chip a-' + e.asset_type}>{ASSET_LABEL[e.asset_type]}</span>
                    : <span className="chip red">No device</span>}
                </span>
                <span className="gapcount">
                  {e._missing.length
                    ? <span className="chip red">{e._missing.length} missing</span>
                    : <span className="chip green">Complete</span>}
                </span>
              </button>
            ))}
          </div>}

      {open && <Drawer e={open} facets={facets} onClose={() => setOpenId(null)} onSave={save} />}
    </>
  );
}

/* ------------------------------------------------------------ pieces */
const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);

/** Everything about one person, editable in place. Required fields that are
 *  empty are outlined red, so what needs doing is visible without reading. */
function Drawer({ e, facets, onClose, onSave }) {
  const [form, setForm] = useState(e);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setForm(e); }, [e]);

  const missing = missingOf(form);
  const dirty = Object.keys(form).some(k => form[k] !== e[k]);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit() {
    setBusy(true);
    const patch = {};
    Object.keys(form).forEach(k => { if (form[k] !== e[k]) patch[k] = form[k]; });
    const ok = await onSave(e.id, patch);
    setBusy(false);
    if (ok) onClose();
  }

  return (
    <div className="veil" onClick={ev => { if (ev.target === ev.currentTarget) onClose(); }}>
      <div className="panel wide">
        <div className="ph">
          <span className="ini big">{initials(form)}</span>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>{fullName(form)}</h2>
            <div className="drawer-sub">
              {form.title || 'no title'}{form.department ? ' · ' + form.department : ''}
              {form.hiring_date ? ' · ' + tenure(form.hiring_date) : ''}
            </div>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-flags">
          {missing.length
            ? <span className="chip red">{missing.length} field{missing.length > 1 ? 's' : ''} still needed</span>
            : <span className="chip green">Record complete</span>}
          {form.onboarding_ref && <span className="chip accent">From {form.onboarding_ref}</span>}
          {form.source === 'sheet' && <span className="chip grey">Imported</span>}
          {form.status === 'leaver' && <span className="chip grey">Left {pretty(form.left_on)}</span>}
        </div>

        {GROUPS.map(g => (
          <div key={g.name}>
            <div className="sec">{g.name}</div>
            <div className="fgrid">
              {g.fields.map(f => {
                const empty = f.req && !String(form[f.k] ?? '').trim();
                return (
                  <div key={f.k} className={'field' + (f.wide ? ' wide' : '')}>
                    <label>{f.l}{f.req && <i className="req">required</i>}</label>
                    {f.type === 'select'
                      ? <select className={empty ? 'gap' : ''} value={form[f.k] || ''}
                          onChange={ev => set(f.k, ev.target.value)}>
                          <option value="">Not set</option>
                          {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      : <>
                          <input className={empty ? 'gap' : ''} type={f.type || 'text'}
                            list={f.list ? 'dl-' + f.k : undefined}
                            value={form[f.k] || ''} onChange={ev => set(f.k, ev.target.value)} />
                          {f.list && (
                            <datalist id={'dl-' + f.k}>
                              {(facets[f.k] || []).map(v => <option key={v} value={v} />)}
                            </datalist>
                          )}
                        </>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="drawer-acts">
          <button className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn" disabled={!dirty || busy} onClick={submit}>
            {busy ? 'Saving…' : dirty ? 'Save changes' : 'Nothing to save'}
          </button>
        </div>
      </div>
    </div>
  );
}
