'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthGate, Bar, supabase, OWNERSHIP, OWNERSHIP_LABEL, STATUS_LABEL,
         CLOSURES, statusClass, today, pretty, describe, handle, fullName,
         usePanelKeys, CategoryIcon, categoryTone, nameInitials }
  from './shared';
import ByEmployee from './by-employee';
import Reports from './reports';

export default function AssetsPage() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  const [view, setView] = useState('register');
  const [assets, setAssets] = useState(null);
  const [cats, setCats] = useState([]);
  const [error, setError] = useState('');
  const [me, setMe] = useState('');

  const load = useCallback(async () => {
    const [a, c, u] = await Promise.all([
      supabase.from('v_assets').select('*').order('updated_at', { ascending: false }),
      supabase.from('asset_categories').select('*').eq('active', true).order('sort_order'),
      supabase.auth.getUser()
    ]);
    if (a.error) { setError(a.error.message); return; }
    setError('');
    setAssets(a.data || []);
    setCats(c.data || []);
    setMe(u.data.user?.email || '');
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="wrap">
      <Bar
        title="Assets"
        sub={view === 'register'
          ? 'Every device, who has it, and what came back'
          : view === 'employees'
          ? 'Who is holding what, right now'
          : 'What we hold, who owns it, and what needs attention'}
        right={<a className="back" href="/">← All tiles</a>}
      />
      <div className="viewswitch">
        <button data-on={view === 'register' ? '1' : '0'}
          onClick={() => setView('register')}>Register</button>
        <button data-on={view === 'employees' ? '1' : '0'}
          onClick={() => setView('employees')}>By employee</button>
        <button data-on={view === 'reports' ? '1' : '0'}
          onClick={() => setView('reports')}>Reports</button>
      </div>

      {error && <div className="err">{error}</div>}

      {assets === null ? <p className="note-txt">Loading…</p> : (
        view === 'register'
          ? <Register assets={assets} cats={cats} me={me} onReload={load} />
        : view === 'employees'
          ? <ByEmployee assets={assets} />
        : <Reports assets={assets} />
      )}
    </div>
  );
}

/* ============================================================= register */

function Register({ assets, cats, me, onReload }) {
  const [tab, setTab] = useState('all');
  const [own, setOwn] = useState('');
  const [q, setQ] = useState('');
  const [flash, setFlash] = useState('');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [returning, setReturning] = useState(null);
  const [replacing, setReplacing] = useState(null);
  const [sending, setSending] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [settingStatus, setSettingStatus] = useState(null);
  const [history, setHistory] = useState(null);

  function flashIt(msg) {
    setFlash(msg);
    setTimeout(() => setFlash(''), 1800);
  }
  function saved(msg) {
    onReload();
    flashIt(msg);
  }

  async function restore(a) {
    const { error } = await supabase.from('assets')
      .update({ deleted_at: null, deleted_by: null, delete_reason: null, updated_by: me })
      .eq('id', a.id);
    if (error) { flashIt(error.message); return; }
    saved('Restored.');
  }

  /* trash is a separate world from everything else -- a deleted asset is
   * never mixed into the live counts, the tabs, or the search, the same
   * way a removed employee record disappears from every count elsewhere
   * in this app rather than lingering as a zero-weight row */
  const notDeleted = assets.filter(a => !a.deleted_at);
  const trashed = assets.filter(a => a.deleted_at);

  const live = notDeleted.filter(a => a.status !== 'retired' && a.status !== 'released'
                                && a.status !== 'returned_to_lessor');
  const inUse   = notDeleted.filter(a => a.status === 'assigned');
  const missing = notDeleted.filter(a => a.status === 'missing');
  const warranty = notDeleted.filter(a =>
    a.warranty_days !== null && a.warranty_days !== undefined && a.warranty_days <= 60
    && live.includes(a));

  const groups = [
    ['all',      'All',       notDeleted.length],
    ['assigned', 'In use',    inUse.length],
    ['in_stock', 'In stock',  notDeleted.filter(a => a.status === 'in_stock').length],
    ['repair',   'Repair',    notDeleted.filter(a => a.status === 'repair').length],
    ['missing',  'Missing',   missing.length],
    ['gone',     'Gone',      notDeleted.filter(a => ['returned_to_lessor', 'released'].includes(a.status)).length],
    ['retired',  'Retired',   notDeleted.filter(a => a.status === 'retired').length],
    ['trash',    'Trash',     trashed.length]
  ];

  const needle = q.trim().toLowerCase();
  const pool = tab === 'trash' ? trashed : notDeleted;
  const shown = pool.filter(a => {
    if (tab === 'trash') { /* no further status filter -- trash is its own world */ }
    else if (tab === 'gone') { if (!['returned_to_lessor', 'released'].includes(a.status)) return false; }
    else if (tab !== 'all' && a.status !== tab) return false;
    if (own && a.ownership !== own) return false;
    if (!needle) return true;
    return [a.tag, a.serial, a.make, a.model, a.category_label, a.holder,
            a.holder_email, a.location].filter(Boolean).join(' ')
      .toLowerCase().includes(needle);
  });

  return (
    <>
      {flash && <div className="busy">{flash}</div>}
      <div className="stats">
        <Stat n={live.length} l="Live assets" icon="inventory" />
        <Stat n={inUse.length} l="In use" c="calm" icon="in_use"
          onClick={() => setTab('assigned')} />
        <Stat n={warranty.length} l="Warranty ending" c={warranty.length ? 'warm' : ''} icon="warranty" />
        <Stat n={missing.length} l="Missing" c={missing.length ? 'hot' : ''} icon="missing"
          onClick={() => setTab('missing')} />
      </div>

      <div className="toolbar">
        <input className="search" value={q} placeholder="Tag, serial, model or holder"
          onChange={e => setQ(e.target.value)} />
        <select style={{ width: 'auto', minWidth: 160 }} value={own}
          onChange={e => setOwn(e.target.value)}>
          <option value="">Any owner</option>
          {OWNERSHIP.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className="btn" style={{ marginLeft: 'auto' }}
          onClick={() => setAdding(true)}>Add an asset</button>
      </div>

      <div className="tabset" style={{ marginBottom: 18 }}>
        {groups.map(([k, l, n]) => (
          <button key={k} data-on={tab === k ? '1' : '0'} onClick={() => setTab(k)}>
            {l}{n ? ` · ${n}` : ''}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <div className="empty-ico">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v16H4z" /><path d="M9 9h6v6H9z" />
            </svg>
          </div>
          <b>{pool.length ? 'Nothing matches' : tab === 'trash' ? 'Nothing in the trash' : 'Nothing in the register yet'}</b>
          <span>{pool.length ? 'Try a different search or filter.'
            : tab === 'trash' ? 'Deleted assets show up here, never gone for good.'
            : 'Add the first one above.'}</span>
        </div>
      ) : (
        <div className="assets">
          {shown.map(a => (
            <Row key={a.id} a={a} inTrash={tab === 'trash'}
              onEdit={() => setEditing(a)}
              onAssign={() => setAssigning(a)}
              onReturn={() => setReturning(a)}
              onReplace={() => setReplacing(a)}
              onSend={() => setSending(a)}
              onDelete={() => setDeleting(a)}
              onSetStatus={() => setSettingStatus(a)}
              onRestore={() => restore(a)}
              onHistory={() => setHistory(a)} />
          ))}
        </div>
      )}

      {adding && <Add cats={cats} me={me}
        onClose={() => setAdding(false)}
        onSaved={() => { setAdding(false); saved('Added to the register.'); }} />}

      {editing && <EditAsset asset={editing} cats={cats} me={me}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); saved('Changes saved.'); }} />}

      {assigning && <Assign asset={assigning} me={me}
        onClose={() => setAssigning(null)}
        onSaved={() => { setAssigning(null); saved('Assigned.'); }} />}

      {returning && <Return asset={returning} me={me}
        onClose={() => setReturning(null)}
        onSaved={() => { setReturning(null); saved('Closed out.'); }} />}

      {replacing && <Replace asset={replacing} cats={cats} me={me}
        onClose={() => setReplacing(null)}
        onSaved={() => { setReplacing(null); saved('Replaced.'); }} />}

      {sending && <SendEmail asset={sending} me={me}
        onClose={() => setSending(null)}
        onSaved={() => { setSending(null); flashIt('Marked as sent.'); }} />}

      {deleting && <DeleteAsset asset={deleting} me={me}
        onClose={() => setDeleting(null)}
        onSaved={() => { setDeleting(null); saved('Moved to trash.'); }} />}

      {settingStatus && <SetStatus asset={settingStatus} me={me}
        onClose={() => setSettingStatus(null)}
        onSaved={() => { setSettingStatus(null); saved('Status updated.'); }} />}

      {history && <History asset={history} onClose={() => setHistory(null)} />}
    </>
  );
}

const STAT_ICON_PATH = {
  inventory: 'M4 4h16v16H4z M9 9h6v6H9z',
  in_use:    'M4 12l5 5L20 6',
  warranty:  'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01',
  missing:   'M18 6L6 18 M6 6l12 12'
};
const STAT_TONE = { inventory: 'a2', in_use: 'a1', warranty: 'a5', missing: 'a2' };

const Stat = ({ n, l, c, icon, onClick }) => (
  <div className={'stat' + (c ? ' ' + c : '') + (onClick ? ' tappable' : '')}
    onClick={onClick} role={onClick ? 'button' : undefined}>
    {icon && (
      <div className={'stat-ico tone-' + (STAT_TONE[icon] || 'muted')}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {(STAT_ICON_PATH[icon] || '').split(' M').map((seg, i) =>
            <path key={i} d={(i ? 'M' : '') + seg} />)}
        </svg>
      </div>
    )}
    <b>{n}</b><span>{l}</span>
  </div>
);

function Row({ a, inTrash, onEdit, onAssign, onReturn, onReplace, onSend,
               onDelete, onSetStatus, onRestore, onHistory }) {
  const open = !!a.assignment_id;
  const gone = ['retired', 'released', 'returned_to_lessor'].includes(a.status);

  let clock = null;
  if (!gone && a.warranty_days !== null && a.warranty_days !== undefined) {
    if (a.warranty_days < 0) clock = <span className="a-alarm">Warranty ended {pretty(a.warranty_until)}</span>;
    else if (a.warranty_days <= 60) clock = <span className="a-warn">Warranty ends in {a.warranty_days}d</span>;
  }

  return (
    <button className={'assetrow ' + statusClass(a.status)} onClick={onHistory}>
      <span className={'a-ico tone-' + categoryTone(a.category)}>
        <CategoryIcon slug={a.category} />
      </span>
      <span className="a-who">
        <span className="nm">
          {/* whoever holds it is the headline -- a serial only means
           * something once you already know which device it is */}
          {open ? (
            <>
              <span className="avatar">{nameInitials(a.holder)}</span>
              {a.holder || a.holder_email}
            </>
          ) : describe(a)}
          <span className={'chip ' + statusClass(a.status)}>{STATUS_LABEL[a.status]}</span>
          <span className={'chip a-' + a.ownership}>{OWNERSHIP_LABEL[a.ownership]}</span>
        </span>
        <span className="sub">
          <span className="a-ref">{handle(a)}</span>
          {' · ' + (open ? describe(a) : a.category_label)}
          {a.serial ? ' · ' + a.serial : ''}
          {a.location ? ' · ' + a.location : ''}
          {open ? ' · held since ' + pretty(a.assigned_on) : ''}
          {inTrash && a.delete_reason ? ' · ' + a.delete_reason : ''}
          {clock ? <> · {clock}</> : ''}
        </span>
      </span>
      <span className="a-acts">
        {inTrash ? (
          <span className="mini" onClick={e => { e.stopPropagation(); onRestore(); }}>Restore</span>
        ) : (
          <>
            <span className="mini" onClick={e => { e.stopPropagation(); onEdit(); }}>Edit</span>
            {open ? (
              <>
                <span className="mini" onClick={e => { e.stopPropagation(); onReturn(); }}>
                  {a.ownership === 'personal' ? 'Remove access' : 'Return'}
                </span>
                {a.ownership !== 'personal' &&
                  <span className="mini" onClick={e => { e.stopPropagation(); onReplace(); }}>Replace</span>}
                <span className="mini" onClick={e => { e.stopPropagation(); onSend(); }}>Email</span>
              </>
            ) : (
              <>
                {!gone && <span className="mini" onClick={e => { e.stopPropagation(); onAssign(); }}>Assign</span>}
                {a.ownership !== 'personal' &&
                  <span className="mini" onClick={e => { e.stopPropagation(); onSetStatus(); }}>Status</span>}
                <span className="mini" onClick={e => { e.stopPropagation(); onDelete(); }}>Delete</span>
              </>
            )}
          </>
        )}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------- add */

function Add({ cats, me, onClose, onSaved }) {
  const [f, setF] = useState({
    category: 'laptop', ownership: 'bayzat', make: '', model: '', serial: '',
    tag: '', location: '', lessor: '', lease_until: '',
    purchased_on: '', warranty_until: '', notes: ''
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const firstRef = useRef(null);
  usePanelKeys(onClose, firstRef);
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  async function save() {
    setBusy(true); setErr('');
    const row = {
      category: f.category, ownership: f.ownership, source: 'manual',
      created_by: me, updated_by: me,
      status: f.ownership === 'personal' ? 'assigned' : 'in_stock'
    };
    ['make', 'model', 'serial', 'tag', 'location', 'lessor', 'notes']
      .forEach(k => { if (f[k].trim()) row[k] = f[k].trim(); });
    ['lease_until', 'purchased_on', 'warranty_until']
      .forEach(k => { if (f[k]) row[k] = f[k]; });

    const { error } = await supabase.from('assets').insert(row);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel mood-add" onClick={e => e.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>Add an asset</h2>
            <p className="note-txt" style={{ marginTop: 5 }}>
              Created here, and the employee record follows.
            </p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {err && <div className="err" style={{ marginTop: 16 }}>{err}</div>}

        <div className="frow" style={{ marginTop: 18 }}>
          <div>
            <label>Category</label>
            <select ref={firstRef} value={f.category} onChange={set('category')}>
              {cats.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label>Owned by</label>
            <select value={f.ownership} onChange={set('ownership')}>
              {OWNERSHIP.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        {f.ownership === 'personal' && (
          <div className="headline appear" style={{ margin: '4px 0 18px' }}>
            <p>A personal device cannot be collected or retired. At exit the
              only ending is that access is removed from it.</p>
          </div>
        )}

        <div className="frow">
          <div><label>Make</label><input value={f.make} onChange={set('make')} /></div>
          <div><label>Model</label><input value={f.model} onChange={set('model')} /></div>
        </div>

        <div className="frow">
          <div>
            <label>Serial</label>
            <input value={f.serial} onChange={set('serial')} placeholder="Unique if given" />
          </div>
          <div>
            <label>Tag</label>
            <input value={f.tag} onChange={set('tag')} placeholder="BZ-LT-047" />
          </div>
        </div>

        <div className="frow">
          <div><label>Location</label><input value={f.location} onChange={set('location')} /></div>
        </div>

        {f.ownership === 'leasing' && (
          <div className="frow">
            <div><label>Lessor</label><input value={f.lessor} onChange={set('lessor')} /></div>
            <div>
              <label>Lease ends</label>
              <input type="date" value={f.lease_until} onChange={set('lease_until')} />
            </div>
          </div>
        )}

        {f.ownership === 'bayzat' && (
          <div className="frow">
            <div>
              <label>Bought on</label>
              <input type="date" value={f.purchased_on} onChange={set('purchased_on')} />
            </div>
            <div>
              <label>Warranty ends</label>
              <input type="date" value={f.warranty_until} onChange={set('warranty_until')} />
            </div>
          </div>
        )}

        <div className="frow">
          <div style={{ flex: '1 1 100%' }}>
            <label>Notes</label>
            <textarea rows={3} value={f.notes} onChange={set('notes')} />
          </div>
        </div>

        <button className="btn" disabled={busy} onClick={save} style={{ width: '100%' }}>
          {busy ? 'Saving…' : 'Add it'}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- edit
 * Fixes a typo, corrects a warranty date, changes who owns it. Any
 * synced field saved here (ownership, serial, category, tag, notes)
 * re-reaches the employee record automatically while the asset is on
 * open assignment -- that is the sync-on-asset-edit trigger, not this
 * component; this only writes to assets. */

function EditAsset({ asset, cats, me, onClose, onSaved }) {
  const [f, setF] = useState({
    category: asset.category, ownership: asset.ownership,
    make: asset.make || '', model: asset.model || '', serial: asset.serial || '',
    tag: asset.tag || '', location: asset.location || '',
    lessor: asset.lessor || '', lease_until: asset.lease_until || '',
    purchased_on: asset.purchased_on || '', warranty_until: asset.warranty_until || '',
    notes: asset.notes || ''
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const firstRef = useRef(null);
  usePanelKeys(onClose, firstRef);
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const ownershipChanged = f.ownership !== asset.ownership;

  async function save() {
    setBusy(true); setErr('');
    const patch = { category: f.category, ownership: f.ownership, updated_by: me };
    ['make', 'model', 'serial', 'tag', 'location', 'lessor', 'notes']
      .forEach(k => { patch[k] = f[k].trim() || null; });
    ['lease_until', 'purchased_on', 'warranty_until']
      .forEach(k => { patch[k] = f[k] || null; });

    const { error } = await supabase.from('assets').update(patch).eq('id', asset.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel mood-edit" onClick={e => e.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>Edit {handle(asset)}</h2>
            <p className="note-txt" style={{ marginTop: 5 }}>
              Changes here reach the employee record on their own if this is
              currently assigned.
            </p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {err && <div className="err" style={{ marginTop: 16 }}>{err}</div>}

        <div className="frow" style={{ marginTop: 18 }}>
          <div>
            <label>Category</label>
            <select ref={firstRef} value={f.category} onChange={set('category')}>
              {cats.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label>Owned by</label>
            <select value={f.ownership} onChange={set('ownership')}>
              {OWNERSHIP.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        {ownershipChanged && (
          <div className="headline appear" style={{ margin: '4px 0 18px' }}>
            <p>Some ownership and status combinations do not make sense
              together -- a personal device cannot sit in stock, for one.
              If this save is refused, that is why.</p>
          </div>
        )}

        <div className="frow">
          <div><label>Make</label><input value={f.make} onChange={set('make')} /></div>
          <div><label>Model</label><input value={f.model} onChange={set('model')} /></div>
        </div>

        <div className="frow">
          <div><label>Serial</label><input value={f.serial} onChange={set('serial')} /></div>
          <div><label>Tag</label><input value={f.tag} onChange={set('tag')} /></div>
        </div>

        <div className="frow">
          <div><label>Location</label><input value={f.location} onChange={set('location')} /></div>
        </div>

        {f.ownership === 'leasing' && (
          <div className="frow">
            <div><label>Lessor</label><input value={f.lessor} onChange={set('lessor')} /></div>
            <div>
              <label>Lease ends</label>
              <input type="date" value={f.lease_until} onChange={set('lease_until')} />
            </div>
          </div>
        )}

        {f.ownership === 'bayzat' && (
          <div className="frow">
            <div>
              <label>Bought on</label>
              <input type="date" value={f.purchased_on} onChange={set('purchased_on')} />
            </div>
            <div>
              <label>Warranty ends</label>
              <input type="date" value={f.warranty_until} onChange={set('warranty_until')} />
            </div>
          </div>
        )}

        <div className="frow">
          <div style={{ flex: '1 1 100%' }}>
            <label>Notes</label>
            <textarea rows={3} value={f.notes} onChange={set('notes')} />
          </div>
        </div>

        <button className="btn" disabled={busy} onClick={save} style={{ width: '100%' }}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- assign */

function Assign({ asset, me, onClose, onSaved }) {
  const [q, setQ] = useState('');
  const [people, setPeople] = useState([]);
  const [picked, setPicked] = useState(null);
  const [when, setWhen] = useState(today());
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const firstRef = useRef(null);
  usePanelKeys(onClose, firstRef);

  useEffect(() => {
    const needle = q.trim();
    if (needle.length < 2) { setPeople([]); return; }
    let live = true;
    const t = setTimeout(async () => {
      const { data } = await supabase.from('employees')
        .select('id,first_name,last_name,preferred_name,work_email,department,title')
        .eq('status', 'active')
        .or(`first_name.ilike.%${needle}%,last_name.ilike.%${needle}%,work_email.ilike.%${needle}%`)
        .limit(8);
      if (live) setPeople(data || []);
    }, 220);
    return () => { live = false; clearTimeout(t); };
  }, [q]);

  async function save() {
    if (!picked) { setErr('Pick who is holding it.'); return; }
    setBusy(true); setErr('');
    /* employee_id here is employees.id — the same row leavers.employee_id
     * points at — not the business employee_id text Master fills in. */
    const { error } = await supabase.from('asset_assignments').insert({
      asset_id: asset.id, employee_id: String(picked.id),
      person: fullName(picked), work_email: picked.work_email,
      assigned_on: when, assigned_by: me, assign_note: note.trim() || null
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel mood-assign" onClick={e => e.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>Assign {handle(asset)}</h2>
            <p className="note-txt" style={{ marginTop: 5 }}>
              {describe(asset)} · {OWNERSHIP_LABEL[asset.ownership]}
            </p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {err && <div className="err" style={{ marginTop: 16 }}>{err}</div>}

        <div className="frow" style={{ marginTop: 18 }}>
          <div style={{ flex: '1 1 100%' }}>
            <label>Who has it</label>
            <input ref={firstRef} value={picked ? fullName(picked) : q} placeholder="Name or work email"
              onChange={e => { setPicked(null); setQ(e.target.value); }} />
          </div>
        </div>

        {!picked && people.length > 0 && (
          <div style={{ marginBottom: 14, display: 'grid', gap: 6 }}>
            {people.map(p => (
              <button key={p.id} className="mini" style={{ textAlign: 'left' }}
                onClick={() => { setPicked(p); setPeople([]); }}>
                {fullName(p)}
                <span className="note-txt" style={{ marginLeft: 8 }}>
                  {[p.title, p.department].filter(Boolean).join(', ')}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="frow">
          <div><label>From</label><input type="date" value={when} onChange={e => setWhen(e.target.value)} /></div>
        </div>
        <div className="frow">
          <div style={{ flex: '1 1 100%' }}>
            <label>Note</label>
            <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>

        <button className="btn" disabled={busy} onClick={save} style={{ width: '100%' }}>
          {busy ? 'Saving…' : 'Assign it'}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- return */

function Return({ asset, me, onClose, onSaved }) {
  const options = CLOSURES[asset.ownership] || CLOSURES.bayzat;
  const [closure, setClosure] = useState(options[0][0]);
  const [when, setWhen] = useState(today());
  const [condition, setCondition] = useState('');
  const [wiped, setWiped] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const firstRef = useRef(null);
  usePanelKeys(onClose, firstRef);

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
    const patch = {
      returned_on: when, returned_by: me, closure,
      return_condition: condition.trim() || null
    };
    if (wiped) { patch.wiped_at = new Date().toISOString(); patch.wipe_evidence = evidence.trim(); }
    if (personal) patch.access_removed_at = new Date().toISOString();

    const { error } = await supabase.from('asset_assignments')
      .update(patch).eq('id', asset.assignment_id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  function onConditionKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
  }

  /* Says out loud what pressing the button is about to do, so the form
   * reflects the choices already made rather than staying silent until
   * after they are submitted. */
  const closureLabel = (chosen ? chosen[1] : closure).toLowerCase();
  const summary = personal
    ? `This removes access on ${pretty(when)}` + (wiped ? ', with the account wiped from the device.' : '.')
    : `This marks it ${closureLabel} on ${pretty(when)}` + (wiped ? ', with the device wiped.' : '.');

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel mood-return" onClick={e => e.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>
              {personal ? 'Remove access from ' + handle(asset) : 'Close out ' + handle(asset)}
            </h2>
            <p className="note-txt" style={{ marginTop: 5 }}>
              {asset.holder || asset.holder_email || 'held'} · {OWNERSHIP_LABEL[asset.ownership]}
            </p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {err && <div className="err" style={{ marginTop: 16 }}>{err}</div>}

        {personal && (
          <div className="headline" style={{ margin: '16px 0 4px' }}>
            <p>This device belongs to {asset.holder || 'the employee'}, so there is
              nothing to collect. Record that access was removed and, where it
              applies, that the Bayzat account was wiped from it.</p>
          </div>
        )}

        <div className="frow" style={{ marginTop: 18 }}>
          <div>
            <label>How it ended</label>
            <select ref={firstRef} value={closure}
              onChange={e => { setClosure(e.target.value); setErr(''); }}>
              {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label>On</label><input type="date" value={when} onChange={e => setWhen(e.target.value)} /></div>
        </div>

        {needsCondition && (
          <div className="frow appear">
            <div style={{ flex: '1 1 100%' }}>
              <label>Condition it came back in <span className="req">*</span></label>
              <input value={condition} onChange={e => setCondition(e.target.value)}
                onKeyDown={onConditionKey} placeholder="e.g. good, minor scuff on the lid" />
            </div>
          </div>
        )}

        {/* the wipe question and its evidence live in one grouped block, so
         * the two read as a single connected decision rather than a
         * checkbox that happens to sit near an unrelated text box */}
        <div style={{ borderTop: '1px solid var(--line2)', marginTop: 18, paddingTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9,
            marginBottom: wiped ? 12 : 0, fontSize: 13.5, fontWeight: 400, color: 'var(--ink)' }}>
            <input type="checkbox" checked={wiped}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              onChange={e => setWiped(e.target.checked)} />
            {personal ? 'Bayzat account wiped from the device' : 'Device wiped'}
          </label>

          {wiped && (
            <div className="appear">
              <label>Evidence — ticket, link, or who witnessed it <span className="req">*</span></label>
              <textarea rows={2} value={evidence} onChange={e => setEvidence(e.target.value)}
                placeholder="e.g. INC-4821, or witnessed by Aishwarya on the erase call" />
            </div>
          )}
        </div>

        <div className="headline" style={{ margin: '18px 0 0' }}>
          <p>{summary}</p>
        </div>

        <button className="btn" disabled={busy} onClick={save} style={{ width: '100%', marginTop: 18 }}>
          {busy ? 'Saving…' : personal ? 'Record it' : 'Close it out'}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- replace
 * Closing the old assignment and creating the new one as two separate
 * actions would leave history reading as two unrelated events -- one
 * asset quietly returned, an unrelated one showing up later. This does
 * both in one step and records which replaced which, so v_asset_history
 * can show the connection from either side of the swap. */

function Replace({ asset, cats, me, onClose, onSaved }) {
  const [when, setWhen] = useState(today());
  const [condition, setCondition] = useState('');
  const [wiped, setWiped] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [newCat, setNewCat] = useState(asset.category);
  const [newSerial, setNewSerial] = useState('');
  const [newTag, setNewTag] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const firstRef = useRef(null);
  usePanelKeys(onClose, firstRef);

  async function save() {
    if (!condition.trim()) {
      setErr('What condition did the old one come back in? The database refuses without it.');
      return;
    }
    if (wiped && !evidence.trim()) {
      setErr('A wipe needs evidence behind it — a ticket, a link, or who witnessed it.');
      return;
    }
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
      notes: 'Replaces ' + handle(asset)
    });
    if (aErr) { setErr(aErr.message); setBusy(false); return; }

    const closePatch = {
      returned_on: when, returned_by: me, closure: 'replaced',
      return_condition: condition.trim()
    };
    if (wiped) { closePatch.wiped_at = new Date().toISOString(); closePatch.wipe_evidence = evidence.trim(); }
    const { error: cErr } = await supabase.from('asset_assignments')
      .update(closePatch).eq('id', asset.assignment_id);
    if (cErr) { setErr(cErr.message); setBusy(false); return; }

    const { error: nErr } = await supabase.from('asset_assignments').insert({
      asset_id: newId, employee_id: asset.holder_id, person: asset.holder,
      work_email: asset.holder_email, assigned_on: when, assigned_by: me,
      assign_note: 'Replacement for ' + handle(asset) + '.',
      replaces_asset_id: asset.id
    });
    setBusy(false);
    if (nErr) { setErr(nErr.message); return; }
    onSaved();
  }

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel mood-edit" onClick={e => e.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>Replace {handle(asset)}</h2>
            <p className="note-txt" style={{ marginTop: 5 }}>
              {asset.holder || asset.holder_email} keeps the same holder — only the device changes
            </p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {err && <div className="err" style={{ marginTop: 16 }}>{err}</div>}

        <div className="bt" style={{ marginTop: 18 }}>The old one</div>
        <div className="frow">
          <div>
            <label>Condition it came back in <span className="req">*</span></label>
            <input ref={firstRef} value={condition} onChange={e => setCondition(e.target.value)}
              placeholder="e.g. good, screen cracked" />
          </div>
          <div><label>On</label><input type="date" value={when} onChange={e => setWhen(e.target.value)} /></div>
        </div>

        <div style={{ borderTop: '1px solid var(--line2)', marginTop: 4, paddingTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9,
            marginBottom: wiped ? 12 : 0, fontSize: 13.5, fontWeight: 400, color: 'var(--ink)' }}>
            <input type="checkbox" checked={wiped}
              style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              onChange={e => setWiped(e.target.checked)} />
            Old device wiped
          </label>
          {wiped && (
            <div className="appear">
              <label>Evidence — ticket, link, or who witnessed it <span className="req">*</span></label>
              <textarea rows={2} value={evidence} onChange={e => setEvidence(e.target.value)} />
            </div>
          )}
        </div>

        <div className="bt" style={{ marginTop: 20 }}>The new one</div>
        <div className="frow">
          <div>
            <label>Category</label>
            <select value={newCat} onChange={e => setNewCat(e.target.value)}>
              {cats.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>
          <div><label>Tag</label><input value={newTag} onChange={e => setNewTag(e.target.value)} /></div>
        </div>
        <div className="frow">
          <div style={{ flex: '1 1 100%' }}>
            <label>Serial</label>
            <input value={newSerial} onChange={e => setNewSerial(e.target.value)} />
          </div>
        </div>
        <p className="note-txt" style={{ marginBottom: 4 }}>
          Ownership carries over as {OWNERSHIP_LABEL[asset.ownership]} — a replacement stays under the
          same arrangement as the device it's replacing.
        </p>

        <button className="btn" disabled={busy} onClick={save} style={{ width: '100%', marginTop: 14 }}>
          {busy ? 'Saving…' : 'Replace it'}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- send email
 * Nothing is sent from here. This generates a one-time random link, saves
 * it against the assignment, and hands back a ready-to-send draft -- the
 * person using this tile sends it from their own inbox. The link is the
 * only thing that lets a click be recorded: it is a long random value,
 * not tied to any login, and the two functions it calls on the other end
 * (ack_lookup, ack_confirm) can each only ever act on the one row that
 * exact value points at. */

function draftText(asset, token, me) {
  const url = window.location.origin + '/acknowledge/' + token;
  const firstName = (asset.holder || '').split(' ')[0] || 'there';
  const senderRaw = (me || '').split('@')[0].split('.')[0];
  const sender = senderRaw ? senderRaw.charAt(0).toUpperCase() + senderRaw.slice(1) : 'Bayzat IT';
  const deviceLine = [asset.make, asset.model].filter(Boolean).join(' ') || describe(asset);
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

function SendEmail({ asset, me, onClose, onSaved }) {
  const [row, setRow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  usePanelKeys(onClose, null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('asset_assignments')
      .select('ack_token, ack_sent_at, ack_sent_by, ack_acknowledged_at')
      .eq('id', asset.assignment_id).single();
    if (error) { setErr(error.message); return; }
    setRow(data);
  }, [asset.assignment_id]);
  useEffect(() => { load(); }, [load]);

  async function ensureToken() {
    if (row && row.ack_token) return row.ack_token;
    setBusy(true); setErr('');
    const newToken = crypto.randomUUID();
    const { error } = await supabase.from('asset_assignments').update({
      ack_token: newToken, ack_sent_at: new Date().toISOString(), ack_sent_by: me
    }).eq('id', asset.assignment_id);
    setBusy(false);
    if (error) { setErr(error.message); return null; }
    await load();
    onSaved();
    return newToken;
  }

  async function openDraft() {
    const t = await ensureToken();
    if (!t) return;
    const { subject, body } = draftText(asset, t, me);
    /* mailto: hands off to whatever the OS has registered as the default
     * mail app -- often nothing, and rarely Gmail specifically even when
     * that is what someone actually uses. Gmail's own compose URL opens
     * its web interface directly, pre-filled, in a new tab. */
    const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1' +
      '&to=' + encodeURIComponent(asset.holder_email || '') +
      '&su=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    window.open(gmailUrl, '_blank');
  }

  async function copyDraft() {
    const t = await ensureToken();
    if (!t) return;
    const { subject, body } = draftText(asset, t, me);
    navigator.clipboard.writeText('Subject: ' + subject + '\n\n' + body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel mood-assign" onClick={e => e.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>Allocation email — {handle(asset)}</h2>
            <p className="note-txt" style={{ marginTop: 5 }}>
              {asset.holder || asset.holder_email}
            </p>
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
            <button className="btn" disabled={busy} onClick={openDraft}>
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

/* -------------------------------------------------------- delete
 * Never actually gone -- moves to Trash, same as removing an employee
 * record moves them out of the directory rather than destroying anything.
 * Blocked by a database trigger while the asset is assigned, so this
 * button only ever appears on something already unassigned; nothing to
 * enforce here that the database does not already refuse on its own. */
function DeleteAsset({ asset, me, onClose, onSaved }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const firstRef = useRef(null);
  usePanelKeys(onClose, firstRef);

  async function save() {
    if (!reason.trim()) {
      setErr('Say why — the record keeps this alongside who did it.');
      return;
    }
    setBusy(true); setErr('');
    const { error } = await supabase.from('assets').update({
      deleted_at: new Date().toISOString(), deleted_by: me,
      delete_reason: reason.trim(), updated_by: me
    }).eq('id', asset.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>Delete {handle(asset)}</h2>
            <p className="note-txt" style={{ marginTop: 5 }}>{describe(asset)}</p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        <div className="headline" style={{ margin: '16px 0' }}>
          <p>This moves it to Trash, not gone for good — it stays there until someone
            restores it, and the reason travels with it.</p>
        </div>

        {err && <div className="err" style={{ marginBottom: 14 }}>{err}</div>}

        <div className="frow">
          <div style={{ flex: '1 1 100%' }}>
            <label>Reason <span className="req">*</span></label>
            <textarea ref={firstRef} rows={2} value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. duplicate entry, added by mistake" />
          </div>
        </div>

        <button className="btn" disabled={busy} onClick={save} style={{ width: '100%' }}>
          {busy ? 'Moving…' : 'Move to trash'}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- set status
 * For anything not currently assigned. An assigned asset changes status
 * only through Return or Replace, where the change carries evidence with
 * it -- this is for the plain cases: something sitting in stock needs
 * repair, or turns out to be missing, with nobody to return it from. */
function SetStatus({ asset, me, onClose, onSaved }) {
  const options = asset.ownership === 'leasing'
    ? [['in_stock', 'In stock'], ['repair', 'Repair'], ['missing', 'Missing'],
       ['returned_to_lessor', 'Returned to lessor']]
    : [['in_stock', 'In stock'], ['repair', 'Repair'], ['missing', 'Missing'],
       ['retired', 'Retired']];
  const [status, setStatusVal] = useState(
    options.some(([v]) => v === asset.status) ? asset.status : options[0][0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const firstRef = useRef(null);
  usePanelKeys(onClose, firstRef);

  async function save() {
    setBusy(true); setErr('');
    const { error } = await supabase.from('assets')
      .update({ status, updated_by: me }).eq('id', asset.id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>Status — {handle(asset)}</h2>
            <p className="note-txt" style={{ marginTop: 5 }}>{describe(asset)}</p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {err && <div className="err" style={{ marginTop: 16 }}>{err}</div>}

        <div className="frow" style={{ marginTop: 18 }}>
          <div style={{ flex: '1 1 100%' }}>
            <label>New status</label>
            <select ref={firstRef} value={status} onChange={e => setStatusVal(e.target.value)}>
              {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <button className="btn" disabled={busy} onClick={save} style={{ width: '100%' }}>
          {busy ? 'Saving…' : 'Update status'}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- history */

function History({ asset, onClose }) {
  const [rows, setRows] = useState(null);
  usePanelKeys(onClose, null);

  useEffect(() => {
    let live = true;
    supabase.from('v_asset_history').select('*')
      .eq('asset_id', asset.id).order('at', { ascending: false })
      .then(({ data }) => { if (live) setRows(data || []); });
    return () => { live = false; };
  }, [asset.id]);

  return (
    <div className="veil" onClick={onClose}>
      <div className="panel wide mood-history" onClick={e => e.stopPropagation()}>
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>{handle(asset)}</h2>
            <p className="note-txt" style={{ marginTop: 5 }}>
              {describe(asset)} · every hand it passed through
            </p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {rows === null ? (
          <p className="note-txt" style={{ marginTop: 16 }}>Reading the trail…</p>
        ) : rows.length === 0 ? (
          <div className="empty" style={{ marginTop: 16 }}>
            <b>Nothing recorded yet</b>
          </div>
        ) : (
          <div className="trail">
            {rows.map(e => (
              <div key={e.id} className="tr">
                <span className={'dot' + (['closed', 'wiped'].includes(e.kind) ? ' done' : '')} />
                <span>
                  <b>{e.kind}</b>{e.detail ? ' — ' + e.detail : ''}
                  {e.replaces_asset_id &&
                    <> — replaces <span className="a-ref">
                      {e.replaces_tag || e.replaces_serial || 'a previous device'}</span></>}
                  <span className="who"> · {pretty(e.at.slice(0, 10))} · {e.actor}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
