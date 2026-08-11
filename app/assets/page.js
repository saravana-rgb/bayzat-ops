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
  const [history, setHistory] = useState(null);

  function flashIt(msg) {
    setFlash(msg);
    setTimeout(() => setFlash(''), 1800);
  }
  function saved(msg) {
    onReload();
    flashIt(msg);
  }

  const live = assets.filter(a => a.status !== 'retired' && a.status !== 'released'
                                && a.status !== 'returned_to_lessor');
  const inUse   = assets.filter(a => a.status === 'assigned');
  const missing = assets.filter(a => a.status === 'missing');
  const warranty = assets.filter(a =>
    a.warranty_days !== null && a.warranty_days !== undefined && a.warranty_days <= 60
    && live.includes(a));

  const groups = [
    ['all',      'All',       assets.length],
    ['assigned', 'In use',    inUse.length],
    ['in_stock', 'In stock',  assets.filter(a => a.status === 'in_stock').length],
    ['repair',   'Repair',    assets.filter(a => a.status === 'repair').length],
    ['missing',  'Missing',   missing.length],
    ['gone',     'Gone',      assets.filter(a => ['returned_to_lessor', 'released'].includes(a.status)).length],
    ['retired',  'Retired',   assets.filter(a => a.status === 'retired').length]
  ];

  const needle = q.trim().toLowerCase();
  const shown = assets.filter(a => {
    if (tab === 'gone') { if (!['returned_to_lessor', 'released'].includes(a.status)) return false; }
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
        <Stat n={live.length} l="Live assets" icon="a2" />
        <Stat n={inUse.length} l="In use" c="calm" icon="a1"
          onClick={() => setTab('assigned')} />
        <Stat n={warranty.length} l="Warranty ending" c={warranty.length ? 'warm' : ''} icon="a5" />
        <Stat n={missing.length} l="Missing" c={missing.length ? 'hot' : ''} icon="a2"
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
          <b>{assets.length ? 'Nothing matches' : 'Nothing in the register yet'}</b>
          <span>{assets.length ? 'Try a different search or filter.' : 'Add the first one above.'}</span>
        </div>
      ) : (
        <div className="assets">
          {shown.map(a => (
            <Row key={a.id} a={a}
              onEdit={() => setEditing(a)}
              onAssign={() => setAssigning(a)}
              onReturn={() => setReturning(a)}
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

      {history && <History asset={history} onClose={() => setHistory(null)} />}
    </>
  );
}

const Stat = ({ n, l, c, icon, onClick }) => (
  <div className={'stat' + (c ? ' ' + c : '') + (onClick ? ' tappable' : '')}
    onClick={onClick} role={onClick ? 'button' : undefined}>
    {icon && <div className={'stat-ico tone-' + icon}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="6" /></svg>
    </div>}
    <b>{n}</b><span>{l}</span>
  </div>
);

function Row({ a, onEdit, onAssign, onReturn, onHistory }) {
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
          <span className="a-ref">{handle(a)}</span>
          {describe(a)}
          <span className={'chip ' + statusClass(a.status)}>{STATUS_LABEL[a.status]}</span>
          <span className={'chip a-' + a.ownership}>{OWNERSHIP_LABEL[a.ownership]}</span>
        </span>
        <span className="sub">
          {a.category_label}
          {a.serial ? ' · ' + a.serial : ''}
          {a.location ? ' · ' + a.location : ''}
          {open ? <> · <span className="avatar">{nameInitials(a.holder)}</span>
                      {a.holder || a.holder_email} since {pretty(a.assigned_on)}</> : ''}
          {clock ? <> · {clock}</> : ''}
        </span>
      </span>
      <span className="a-acts">
        <span className="mini" onClick={e => { e.stopPropagation(); onEdit(); }}>Edit</span>
        {open
          ? <span className="mini" onClick={e => { e.stopPropagation(); onReturn(); }}>
              {a.ownership === 'personal' ? 'Remove access' : 'Return'}
            </span>
          : gone ? null
          : <span className="mini" onClick={e => { e.stopPropagation(); onAssign(); }}>Assign</span>}
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
      <div className="panel" onClick={e => e.stopPropagation()}>
        <div className="ph mood mood-add">
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
      <div className="panel" onClick={e => e.stopPropagation()}>
        <div className="ph mood mood-edit">
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
      <div className="panel" onClick={e => e.stopPropagation()}>
        <div className="ph mood mood-assign">
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
      <div className="panel" onClick={e => e.stopPropagation()}>
        <div className="ph mood mood-return">
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
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: wiped ? 12 : 0 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={wiped}
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
      <div className="panel wide" onClick={e => e.stopPropagation()}>
        <div className="ph mood mood-history">
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
