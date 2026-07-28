'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthGate, Bar, supabase } from '../common/shared';
import { ASSET_LABEL, ASSET_TYPES, FIELD, GROUPS, fullName, initials,
         missingOf, pretty, tenure } from './shared';
import Reports from './reports';

const PER_PAGE = 25;

export default function EmployeesPage() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  const [email, setEmail] = useState('');
  const [view, setView] = useState('directory');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);
  return (
    <div className="wrap">
      <Bar
        title="Employees"
        sub={view === 'directory'
          ? 'Everyone who works here, and what we still need to know about them'
          : 'Headcount, joiners, devices and how complete the records are'}
        right={<a className="back" href="/">← All tiles</a>}
      />
      <div className="viewswitch">
        <button data-on={view === 'directory' ? '1' : '0'}
          onClick={() => setView('directory')}>Directory</button>
        <button data-on={view === 'reports' ? '1' : '0'}
          onClick={() => setView('reports')}>Reports</button>
      </div>
      {view === 'directory' ? <Directory email={email} /> : <Reports />}
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
  const [gapFilter, setGapFilter] = useState('');   // '', '1', '2', '3', 'any', 'none'
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [saved, setSaved] = useState('');
  const [deleting, setDeleting] = useState(null);

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

  useEffect(() => { setPage(0); }, [q, scope, facet, sort, gapFilter]);

  async function remove(person, reason) {
    const { data, error } = await supabase.rpc('delete_employee', {
      p_id: person.id, p_actor: email, p_reason: reason });
    if (error) { setError(error.message); return; }
    if (data && data.ok === false) { setError(data.reason || 'Could not delete'); return; }
    setDeleting(null); setOpenId(null); setSaved('Removed');
    setTimeout(() => setSaved(''), 1600);
    load();
  }

  async function restore(person) {
    const { error } = await supabase.rpc('restore_employee', {
      p_id: person.id, p_actor: email });
    if (error) setError(error.message);
    else { setSaved('Restored'); setTimeout(() => setSaved(''), 1600); }
    load();
  }

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
    if (scope === 'bin'     && e.status !== 'deleted') return false;
    if (scope !== 'bin'     && e.status === 'deleted') return false;
    if (scope === 'gaps'    && (e.status !== 'active' || !e._missing.length)) return false;
    if (facet.key && (e[facet.key] || '') !== facet.value) return false;
    const m = e._missing.length;
    if (gapFilter === 'none' && m !== 0) return false;
    if (gapFilter === 'any'  && m === 0) return false;
    if (gapFilter === '1' && m !== 1) return false;
    if (gapFilter === '2' && m !== 2) return false;
    if (gapFilter === '3' && m < 3)   return false;
    if (!term) return true;
    return [e.first_name, e.last_name, e.preferred_name, e.work_email, e.employee_id,
            e.title, e.department, e.reports_to, e.asset_serial]
      .some(v => (v || '').toLowerCase().includes(term));
  });

  list.sort((a, b) =>
    sort === 'gaps'   ? b._missing.length - a._missing.length
  : sort === 'newest' ? String(b.hiring_date || '').localeCompare(String(a.hiring_date || ''))
  : fullName(a).localeCompare(fullName(b)));

  function exportCsv(rowsToWrite) {
    const cols = ['employee_id','first_name','last_name','preferred_name','work_email',
                  'personal_email','mobile_no','work_no','title','department','reports_to',
                  'entity','location','office','hiring_date','nationality','gender',
                  'asset_type','asset_serial','asset_note','status','onboarding_ref'];
    const q = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = [cols.concat(['missing_fields']).map(q).join(',')];
    rowsToWrite.forEach(e => lines.push(
      cols.map(c => q(e[c])).concat([q(e._missing.join(' '))]).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'employees-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

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
            ['bin', 'Removed', withMissing.filter(e => e.status === 'deleted').length]]
            .map(([k, l, n]) => (
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
        <select className="facetsel" value={gapFilter}
          onChange={ev => setGapFilter(ev.target.value)}>
          <option value="">Any completeness</option>
          <option value="none">Nothing missing</option>
          <option value="any">Anything missing</option>
          <option value="1">Exactly 1 missing</option>
          <option value="2">Exactly 2 missing</option>
          <option value="3">3 or more missing</option>
        </select>
        {(facet.key || gapFilter) && (
          <button className="mini" onClick={() => { setFacet({ key: '', value: '' }); setGapFilter(''); }}>
            Clear filters
          </button>
        )}
        <span className="count">{list.length} shown</span>
        <button className="mini" onClick={() => exportCsv(list)}>Export this view</button>
      </div>

      {list.length === 0
        ? <div className="empty">
            <b>Nobody matches</b>
            <span>Try a different search, or clear the filters.</span>
          </div>
        : <div className="people">
            {list.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).map(e => (
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
                  {e.status === 'deleted'
                    ? <span className="chip grey">Removed</span>
                    : e._missing.length
                    ? <span className="chip red">{e._missing.length} missing</span>
                    : <span className="chip green">Complete</span>}
                </span>
              </button>
            ))}
          </div>}

      {list.length > PER_PAGE && (
        <Pager page={page} perPage={PER_PAGE} total={list.length} onPage={setPage} />
      )}

      {open && <Drawer e={open} facets={facets} onClose={() => setOpenId(null)} onSave={save}
                       onDelete={() => setDeleting(open)} onRestore={() => restore(open)} />}

      {deleting && <ConfirmRemove person={deleting} onCancel={() => setDeleting(null)}
                                  onConfirm={reason => remove(deleting, reason)} />}
    </>
  );
}

/* ------------------------------------------------------------ pieces */
/** Removing someone is rare, so the dialog spends its words on making sure
 *  it is the right action rather than hurrying you through it. */
function ConfirmRemove({ person, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const REASONS = [
    'Duplicate record',
    'Created by mistake',
    'They never joined',
    'Test entry',
    'Something else'
  ];
  const full = reason + (note.trim() ? ' — ' + note.trim() : '');

  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="panel confirm">
        <div className="confirm-head">
          <span className="ini big">{initials(person)}</span>
          <div>
            <h2>Remove {fullName(person)}?</h2>
            <p>{person.title || 'no title'}{person.department ? ' · ' + person.department : ''}</p>
          </div>
        </div>

        <ul className="confirm-facts">
          <li><b>If they have left the company, do not use this.</b> Mark them as a leaver
            instead — offboarding, payroll and asset return all need the record.</li>
          <li><b>Nothing is destroyed.</b> The record moves to Removed and can be put back.</li>
          <li><b>Your name is recorded</b> against the removal, along with the reason.</li>
        </ul>

        <label>Why is this record being removed?</label>
        <div className="reasons">
          {REASONS.map(r => (
            <button key={r} className="reason" data-on={reason === r ? '1' : '0'}
              onClick={() => setReason(r)}>{r}</button>
          ))}
        </div>
        <input className="note" value={note} placeholder="Anything worth adding (optional)"
          onChange={e => setNote(e.target.value)} />

        <div className="confirm-acts">
          <button className="btn ghost" onClick={onCancel}>Keep it</button>
          <button className="btn danger" disabled={!reason} onClick={() => onConfirm(full)}>
            {reason ? 'Remove record' : 'Pick a reason first'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Pages of 25. Shows a window of five page numbers so 240 people do not
 *  produce a row of ten buttons. */
function Pager({ page, perPage, total, onPage }) {
  const pages = Math.ceil(total / perPage);
  const from = page * perPage + 1;
  const to = Math.min((page + 1) * perPage, total);
  const start = Math.max(0, Math.min(page - 2, pages - 5));
  const window = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);

  return (
    <div className="pager">
      <span className="pinfo">{from}–{to} of {total}</span>
      <div className="pbtns">
        <button className="mini" disabled={page === 0} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        {start > 0 && <button className="mini" onClick={() => onPage(0)}>1</button>}
        {start > 1 && <span className="pdots">…</span>}
        {window.map(i => (
          <button key={i} className="mini" data-on={i === page ? '1' : '0'}
            onClick={() => onPage(i)}>{i + 1}</button>
        ))}
        {start + 5 < pages - 1 && <span className="pdots">…</span>}
        {start + 5 < pages && (
          <button className="mini" onClick={() => onPage(pages - 1)}>{pages}</button>
        )}
        <button className="mini" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);

/** Everything about one person, editable in place. Required fields that are
 *  empty are outlined red, so what needs doing is visible without reading. */
function Drawer({ e, facets, onClose, onSave, onDelete, onRestore }) {
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
                    <label>{f.l}{f.req && <i className="req" title="Required">*</i>}</label>
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

        {e.status === 'deleted'
          ? <>
              <div className="sec">This record was removed</div>
              <div className="danger-zone">
                <div>
                  <b>Removed by {(e.deleted_by || 'someone').split('@')[0]}</b>
                  <span>{e.delete_reason || 'No reason recorded'} — it is hidden from the
                    directory and every count, but nothing has been destroyed.</span>
                </div>
                <button className="mini go" onClick={onRestore}>Put it back</button>
              </div>
            </>
          : <>
              <div className="sec">Removing this record</div>
              <div className="danger-zone">
                <div>
                  <b>Remove this record</b>
                  <span>
                    For duplicates, test entries and people who never joined — not for
                    someone who has left. Mark a leaver as a leaver instead, so offboarding
                    and payroll still have their record. Removing hides the record and keeps
                    a note of who did it and why.
                  </span>
                </div>
                <button className="mini danger" onClick={onDelete}>Remove…</button>
              </div>
            </>}

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
