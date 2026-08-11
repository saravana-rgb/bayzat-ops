'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthGate, Bar, supabase } from '../common/shared';
import { ASSET_LABEL, ASSET_TYPES, FIELD, GROUPS, fullName, initials,
         missingOf, pretty, tenure } from './shared';
import Reports from './reports';

const PER_PAGE = 25;

/* Correct plurals for the facet "All ..." option -- a plain {k}s suffix
 * used to run here, which is why "entity" read as "All entitys". */
const FACET_LABEL = {
  department: 'departments',
  entity: 'entities',
  location: 'locations',
  leasing_company: 'leasing companies'
};

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
             nationality: pick('nationality'), gender: pick('gender'),
             leasing_company: pick('leasing_company') };
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
            e.title, e.department, e.reports_to, e.asset_serial, e.leasing_company]
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
                  'asset_type','asset_serial','asset_os','leasing_company','asset_note','status','onboarding_ref'];
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
        {['department', 'entity', 'location', 'leasing_company'].map(k => (
          <select key={k} className="facetsel"
            value={facet.key === k ? facet.value : ''}
            onChange={e => setFacet(e.target.value ? { key: k, value: e.target.value }
                                                   : { key: '', value: '' })}>
            <option value="">All {FACET_LABEL[k]}</option>
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

      {open && <Drawer e={open} facets={facets} email={email} onClose={() => setOpenId(null)} onSave={save}
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
          <li><b>An onboarding ticket still running for them is cancelled</b> — there is no point
            chasing six steps for a record that should not exist. A ticket already finished is
            left alone, and putting the person back reopens a cancelled one.</li>
          <li><b>They leave the master sheet</b> at the next refresh.</li>
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
/* Everything past the one device this record was built to hold lives in
 * the Assets register, not in a second set of columns bolted onto
 * employees. This reads and writes the real assets/asset_assignments
 * tables directly -- the same ones the Assets tile itself uses -- so an
 * asset added here is a real, tracked asset, not a duplicate the Assets
 * tile knows nothing about. */
/** Today, in the browser's own local time. toISOString() is UTC, which
 *  reads as yesterday for the first four hours of a Dubai day. */
function today() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

/* Which closures exist depends on who owns the thing -- matches the same
 * vocabulary already proven in the Assets tile. Duplicated rather than
 * imported across the tile boundary, same reasoning as everywhere else in
 * this app: each tile owns its own files, so a change to one tile's
 * internals can never silently break another. */
const CLOSURES = {
  bayzat: [
    ['collected',   'Collected',              true],
    ['reassigned',  'Passed to someone else', true],
    ['written_off', 'Written off',            false],
    ['missing',     'Not returned',           false]
  ],
  leasing: [
    ['collected',          'Collected', true],
    ['returned_to_lessor', 'Returned to lessor', false],
    ['missing',            'Not returned', false]
  ],
  personal: [
    ['access_removed', 'Access removed', false],
    ['missing',        'Unresolved',     false]
  ]
};

const assetHandle = a => a.tag || a.serial || (a.id ? a.id.slice(0, 8) : 'this device');

function OtherAssets({ employee, email }) {
  const [items, setItems] = useState(null);
  const [cats, setCats] = useState([]);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ category: 'laptop', ownership: 'bayzat', serial: '', tag: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [emailing, setEmailing] = useState(null);
  const [returning, setReturning] = useState(null);
  const [replacing, setReplacing] = useState(null);

  const load = useCallback(async () => {
    const [asn, cat] = await Promise.all([
      supabase.from('asset_assignments').select('*')
        .eq('employee_id', String(employee.id)).is('returned_on', null),
      supabase.from('asset_categories').select('*').eq('active', true).order('sort_order')
    ]);
    setCats(cat.data || []);
    const ids = (asn.data || []).map(a => a.asset_id);
    if (ids.length === 0) { setItems([]); return; }
    const { data: assetsData } = await supabase.from('assets').select('*').in('id', ids);
    const byId = Object.fromEntries((assetsData || []).map(a => [a.id, a]));
    setItems((asn.data || []).map(a => ({ ...a, asset: byId[a.asset_id] })).filter(x => x.asset));
  }, [employee.id]);
  useEffect(() => { load(); }, [load]);

  const catLabel = slug => (cats.find(c => c.slug === slug) || {}).label || slug;
  const ownLabel = v => ({ bayzat: 'Bayzat owned', leasing: 'Leased', personal: 'Personal device' })[v] || v;

  async function submitAsset() {
    setBusy(true); setErr('');
    const newId = crypto.randomUUID();
    const { error: aErr } = await supabase.from('assets').insert({
      id: newId, category: f.category, ownership: f.ownership,
      serial: f.serial.trim() || null, tag: f.tag.trim() || null,
      source: 'manual', created_by: email, updated_by: email, status: 'assigned'
    });
    if (aErr) { setErr(aErr.message); setBusy(false); return; }

    const { error: asErr } = await supabase.from('asset_assignments').insert({
      asset_id: newId, employee_id: String(employee.id),
      person: fullName(employee), work_email: employee.work_email,
      assigned_by: email, assign_note: 'Added from the employee record.'
    });
    setBusy(false);
    if (asErr) { setErr(asErr.message); return; }
    setF({ category: 'laptop', ownership: 'bayzat', serial: '', tag: '' });
    setAdding(false);
    load();
  }

  return (
    <div>
      <div className="sec">Other assets</div>

      {items === null ? (
        <p className="note-txt">Loading…</p>
      ) : items.length > 0 ? (
        <div className="fgrid" style={{ marginBottom: 14 }}>
          {items.map(it => (
            <div key={it.id} className="field">
              <label>{catLabel(it.asset.category)}</label>
              <div className="note-txt">
                {it.asset.tag || it.asset.serial || 'no tag'}
                {it.asset.serial && it.asset.tag ? ' · ' + it.asset.serial : ''}
                {' · ' + ownLabel(it.asset.ownership)}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <button className="mini" onClick={() => setEmailing(it)}>Email</button>
                <button className="mini" onClick={() => setReturning(it)}>
                  {it.asset.ownership === 'personal' ? 'Remove access' : 'Return'}
                </button>
                {it.asset.ownership !== 'personal' &&
                  <button className="mini" onClick={() => setReplacing(it)}>Replace</button>}
              </div>
            </div>
          ))}
        </div>
      ) : !adding && (
        <p className="note-txt" style={{ marginBottom: 14 }}>
          Nothing else recorded for them in the Assets register.
        </p>
      )}

      {!adding ? (
        <button className="mini" onClick={() => setAdding(true)}>+ Add another asset</button>
      ) : (
        <div className="fgrid">
          {err && <div className="err" style={{ gridColumn: '1 / -1' }}>{err}</div>}
          <div className="field">
            <label>Category</label>
            <select value={f.category} onChange={ev => setF(p => ({ ...p, category: ev.target.value }))}>
              {cats.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Owned by</label>
            <select value={f.ownership} onChange={ev => setF(p => ({ ...p, ownership: ev.target.value }))}>
              {ASSET_TYPES.filter(([v]) => v !== 'none').map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Serial</label>
            <input value={f.serial} onChange={ev => setF(p => ({ ...p, serial: ev.target.value }))} />
          </div>
          <div className="field">
            <label>Tag</label>
            <input value={f.tag} onChange={ev => setF(p => ({ ...p, tag: ev.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={() => { setAdding(false); setErr(''); }}>Cancel</button>
            <button className="btn" disabled={busy} onClick={submitAsset}>
              {busy ? 'Adding…' : 'Add it'}
            </button>
          </div>
        </div>
      )}

      {emailing && <EmpSendEmail item={emailing} employee={employee} me={email}
        onClose={() => setEmailing(null)} onSaved={load} />}

      {returning && <EmpReturn item={returning} me={email}
        onClose={() => setReturning(null)}
        onSaved={() => { setReturning(null); load(); }} />}

      {replacing && <EmpReplace item={replacing} employee={employee} cats={cats} me={email}
        onClose={() => setReplacing(null)}
        onSaved={() => { setReplacing(null); load(); }} />}
    </div>
  );
}

/* -------------------------------------------------------- send email
 * Same idea as the Assets tile's own version: nothing sends from here.
 * This generates a one-time link, saves it against the assignment, and
 * opens a pre-filled draft in Gmail -- the person using this tile sends
 * it from their own inbox. */
function EmpSendEmail({ item, employee, me, onClose, onSaved }) {
  const asset = item.asset;
  const [row, setRow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('asset_assignments')
      .select('ack_token, ack_sent_at, ack_sent_by, ack_acknowledged_at')
      .eq('id', item.id).single();
    if (error) { setErr(error.message); return; }
    setRow(data);
  }, [item.id]);
  useEffect(() => { load(); }, [load]);

  async function ensureToken() {
    if (row && row.ack_token) return row.ack_token;
    setBusy(true); setErr('');
    const newToken = crypto.randomUUID();
    const { error } = await supabase.from('asset_assignments').update({
      ack_token: newToken, ack_sent_at: new Date().toISOString(), ack_sent_by: me
    }).eq('id', item.id);
    setBusy(false);
    if (error) { setErr(error.message); return null; }
    await load();
    onSaved();
    return newToken;
  }

  function draft(token) {
    const url = window.location.origin + '/acknowledge/' + token;
    const firstName = (fullName(employee) || '').split(' ')[0] || 'there';
    const senderRaw = (me || '').split('@')[0].split('.')[0];
    const sender = senderRaw ? senderRaw.charAt(0).toUpperCase() + senderRaw.slice(1) : 'Bayzat IT';
    const deviceLine = [asset.make, asset.model].filter(Boolean).join(' ') || assetHandle(asset);
    return {
      subject: 'Your Bayzat equipment — please confirm receipt',
      body:
        'Hi ' + firstName + ',\n\n' +
        "You've been issued the following:\n\n" +
        '  Device: ' + deviceLine + '\n' +
        '  Serial: ' + (asset.serial || 'not recorded') + '\n\n' +
        "Please confirm you've received it by opening the link below:\n\n" +
        '  ' + url + '\n\n' +
        'This takes a few seconds and helps us keep accurate records of company equipment.\n\n' +
        'Thanks,\n' + sender + '\nBayzat IT'
    };
  }

  async function openInGmail() {
    const t = await ensureToken();
    if (!t) return;
    const { subject, body } = draft(t);
    const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1' +
      '&to=' + encodeURIComponent(employee.work_email || '') +
      '&su=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    window.open(gmailUrl, '_blank');
  }

  async function copyDraft() {
    const t = await ensureToken();
    if (!t) return;
    const { subject, body } = draft(t);
    navigator.clipboard.writeText('Subject: ' + subject + '\n\n' + body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel" onClick={ev => ev.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>Allocation email — {assetHandle(asset)}</h2>
            <p className="note-txt" style={{ marginTop: 5 }}>{fullName(employee)}</p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {err && <div className="err" style={{ marginTop: 16 }}>{err}</div>}

        {row && row.ack_acknowledged_at ? (
          <div className="headline" style={{ margin: '16px 0' }}>
            <p>Acknowledged on {pretty(row.ack_acknowledged_at.slice(0, 10))}. Nothing further to do.</p>
          </div>
        ) : row && row.ack_sent_at ? (
          <div className="headline" style={{ margin: '16px 0' }}>
            <p>Sent on {pretty(row.ack_sent_at.slice(0, 10))} by {(row.ack_sent_by || '').split('@')[0]},
              not yet acknowledged. You can send it again below.</p>
          </div>
        ) : (
          <p className="note-txt" style={{ marginTop: 16 }}>
            This opens a draft in Gmail — nothing sends from here directly.
          </p>
        )}

        {!(row && row.ack_acknowledged_at) && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn" disabled={busy} onClick={openInGmail}>
              {busy ? 'Preparing…' : 'Open in Gmail'}
            </button>
            <button className="btn ghost" disabled={busy} onClick={copyDraft}>
              {copied ? 'Copied' : 'Copy text instead'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------- return */
function EmpReturn({ item, me, onClose, onSaved }) {
  const asset = item.asset;
  const options = CLOSURES[asset.ownership] || CLOSURES.bayzat;
  const [closure, setClosure] = useState(options[0][0]);
  const [when, setWhen] = useState(today());
  const [condition, setCondition] = useState('');
  const [wiped, setWiped] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const chosen = options.find(o => o[0] === closure);
  const needsCondition = chosen ? chosen[2] : false;
  const personal = asset.ownership === 'personal';

  async function save() {
    if (needsCondition && !condition.trim()) {
      setErr('What condition did it come back in? The database refuses without it.');
      return;
    }
    if (wiped && !evidence.trim()) {
      setErr('A wipe needs evidence behind it — a ticket, a link, or who witnessed it.');
      return;
    }
    setBusy(true); setErr('');
    const patch = { returned_on: when, returned_by: me, closure, return_condition: condition.trim() || null };
    if (wiped) { patch.wiped_at = new Date().toISOString(); patch.wipe_evidence = evidence.trim(); }
    if (personal) patch.access_removed_at = new Date().toISOString();
    const { error } = await supabase.from('asset_assignments').update(patch).eq('id', item.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel" onClick={ev => ev.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>
              {personal ? 'Remove access from ' : 'Close out '}{assetHandle(asset)}
            </h2>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {err && <div className="err" style={{ marginTop: 16 }}>{err}</div>}

        <div className="fgrid" style={{ marginTop: 18 }}>
          <div>
            <label>How it ended</label>
            <select value={closure} onChange={ev => { setClosure(ev.target.value); setErr(''); }}>
              {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label>On</label><input type="date" value={when} onChange={ev => setWhen(ev.target.value)} /></div>
        </div>

        {needsCondition && (
          <div className="fgrid">
            <div style={{ flex: '1 1 100%' }}>
              <label>Condition it came back in <span className="req">*</span></label>
              <input value={condition} onChange={ev => setCondition(ev.target.value)} />
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--line2)', marginTop: 18, paddingTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9,
            marginBottom: wiped ? 12 : 0, fontSize: 13.5, fontWeight: 400, color: 'var(--ink)' }}>
            <input type="checkbox" checked={wiped}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              onChange={ev => setWiped(ev.target.checked)} />
            {personal ? 'Bayzat account wiped from the device' : 'Device wiped'}
          </label>
          {wiped && (
            <div>
              <label>Evidence <span className="req">*</span></label>
              <textarea rows={2} value={evidence} onChange={ev => setEvidence(ev.target.value)} />
            </div>
          )}
        </div>

        <button className="btn" disabled={busy} onClick={save} style={{ width: '100%', marginTop: 18 }}>
          {busy ? 'Saving…' : personal ? 'Record it' : 'Close it out'}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- replace */
function EmpReplace({ item, employee, cats, me, onClose, onSaved }) {
  const asset = item.asset;
  const [when, setWhen] = useState(today());
  const [condition, setCondition] = useState('');
  const [wiped, setWiped] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [newCat, setNewCat] = useState(asset.category);
  const [newSerial, setNewSerial] = useState('');
  const [newTag, setNewTag] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function save() {
    if (!condition.trim()) {
      setErr('What condition did the old one come back in? The database refuses without it.');
      return;
    }
    if (wiped && !evidence.trim()) { setErr('A wipe needs evidence behind it.'); return; }
    if (!newSerial.trim() && !newTag.trim()) {
      setErr('Give the replacement a serial or a tag so the two can be told apart in history.');
      return;
    }
    setBusy(true); setErr('');

    const newId = crypto.randomUUID();
    const { error: aErr } = await supabase.from('assets').insert({
      id: newId, category: newCat, ownership: asset.ownership,
      serial: newSerial.trim() || null, tag: newTag.trim() || null,
      source: 'manual', created_by: me, updated_by: me, status: 'assigned',
      notes: 'Replaces ' + assetHandle(asset)
    });
    if (aErr) { setErr(aErr.message); setBusy(false); return; }

    const closePatch = {
      returned_on: when, returned_by: me, closure: 'replaced', return_condition: condition.trim()
    };
    if (wiped) { closePatch.wiped_at = new Date().toISOString(); closePatch.wipe_evidence = evidence.trim(); }
    const { error: cErr } = await supabase.from('asset_assignments').update(closePatch).eq('id', item.id);
    if (cErr) { setErr(cErr.message); setBusy(false); return; }

    const { error: nErr } = await supabase.from('asset_assignments').insert({
      asset_id: newId, employee_id: String(employee.id), person: fullName(employee),
      work_email: employee.work_email, assigned_on: when, assigned_by: me,
      assign_note: 'Replacement for ' + assetHandle(asset) + '.',
      replaces_asset_id: asset.id
    });
    setBusy(false);
    if (nErr) { setErr(nErr.message); return; }
    onSaved();
  }

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel" onClick={ev => ev.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>Replace {assetHandle(asset)}</h2>
            <p className="note-txt" style={{ marginTop: 5 }}>
              {fullName(employee)} keeps the same holder — only the device changes
            </p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {err && <div className="err" style={{ marginTop: 16 }}>{err}</div>}

        <div className="bt" style={{ marginTop: 18 }}>The old one</div>
        <div className="fgrid">
          <div>
            <label>Condition it came back in <span className="req">*</span></label>
            <input value={condition} onChange={ev => setCondition(ev.target.value)} />
          </div>
          <div><label>On</label><input type="date" value={when} onChange={ev => setWhen(ev.target.value)} /></div>
        </div>

        <div style={{ borderTop: '1px solid var(--line2)', marginTop: 4, paddingTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9,
            marginBottom: wiped ? 12 : 0, fontSize: 13.5, fontWeight: 400, color: 'var(--ink)' }}>
            <input type="checkbox" checked={wiped}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              onChange={ev => setWiped(ev.target.checked)} />
            Old device wiped
          </label>
          {wiped && (
            <div>
              <label>Evidence <span className="req">*</span></label>
              <textarea rows={2} value={evidence} onChange={ev => setEvidence(ev.target.value)} />
            </div>
          )}
        </div>

        <div className="bt" style={{ marginTop: 20 }}>The new one</div>
        <div className="fgrid">
          <div>
            <label>Category</label>
            <select value={newCat} onChange={ev => setNewCat(ev.target.value)}>
              {cats.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div><label>Tag</label><input value={newTag} onChange={ev => setNewTag(ev.target.value)} /></div>
        </div>
        <div className="fgrid">
          <div style={{ flex: '1 1 100%' }}>
            <label>Serial</label>
            <input value={newSerial} onChange={ev => setNewSerial(ev.target.value)} />
          </div>
        </div>

        <button className="btn" disabled={busy} onClick={save} style={{ width: '100%', marginTop: 14 }}>
          {busy ? 'Saving…' : 'Replace it'}
        </button>
      </div>
    </div>
  );
}

function Drawer({ e, facets, email, onClose, onSave, onDelete, onRestore }) {
  const [form, setForm] = useState(e);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setForm(e); }, [e]);

  const missing = missingOf(form);
  const dirty = Object.keys(form).some(k => form[k] !== e[k]);

  function set(k, v) {
    setForm(f => {
      const next = { ...f, [k]: v };
      /* the leasing company only means something while the device type is
       * leasing -- switch away and the old value would otherwise sit there
       * unseen, since the field stops rendering but the data does not
       * clear itself */
      if (k === 'asset_type' && v !== 'leasing') next.leasing_company = '';
      return next;
    });
  }

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
                if (f.showIf && !f.showIf(form)) return null;
                const required = f.req || (f.reqIf && f.reqIf(form));
                const empty = required && !String(form[f.k] ?? '').trim();
                return (
                  <div key={f.k} className={'field' + (f.wide ? ' wide' : '')}>
                    <label>{f.l}{required && <i className="req" title="Required">*</i>}</label>
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

        <OtherAssets employee={e} email={email} />

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
