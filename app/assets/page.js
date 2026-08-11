'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { S, C, STATUS_COLOUR } from './styles';
import Reports from './reports';
import {
  supabase, AuthGate, Pill, StatusPill, Count, Field, Panel, Empty,
  OWNERSHIP, STATUS_LABEL, CLOSURES, ownershipLabel,
  today, pretty, describe, handle
} from './shared';

const LANES = [
  { key: 'assigned',   label: 'In use' },
  { key: 'in_stock',   label: 'In stock' },
  { key: 'repair',     label: 'Repair' },
  { key: 'missing',    label: 'Missing' },
  { key: 'released',   label: 'Released' },
  { key: 'retired',    label: 'Retired' }
];

export default function AssetsPage() {
  return <AuthGate><Board /></AuthGate>;
}

function Board() {
  const [view, setView]         = useState('board');
  const [assets, setAssets]     = useState([]);
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [me, setMe]             = useState('');

  const [lane, setLane]         = useState('');
  const [own, setOwn]           = useState('');
  const [q, setQ]               = useState('');

  const [adding, setAdding]     = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [returning, setReturning] = useState(null);
  const [history, setHistory]   = useState(null);

  const load = useCallback(async function () {
    setLoading(true);
    setError('');
    const [a, c, s] = await Promise.all([
      supabase.from('v_assets').select('*').order('updated_at', { ascending: false }),
      supabase.from('asset_categories').select('*').eq('active', true).order('sort_order'),
      supabase.auth.getSession()
    ]);
    if (a.error) setError(a.error.message);
    setAssets(a.data || []);
    setCats(c.data || []);
    setMe(s.data && s.data.session && s.data.session.user
      ? s.data.session.user.email : '');
    setLoading(false);
  }, []);

  useEffect(function () { load(); }, [load]);

  const counts = useMemo(function () {
    const out = {};
    LANES.forEach(function (l) { out[l.key] = 0; });
    assets.forEach(function (a) {
      if (a.status === 'returned_to_lessor') { out.released += 1; return; }
      if (out[a.status] !== undefined) out[a.status] += 1;
    });
    return out;
  }, [assets]);

  const shown = useMemo(function () {
    const needle = q.trim().toLowerCase();
    return assets.filter(function (a) {
      if (lane === 'released') {
        if (a.status !== 'released' && a.status !== 'returned_to_lessor') return false;
      } else if (lane && a.status !== lane) return false;
      if (own && a.ownership !== own) return false;
      if (!needle) return true;
      return [a.tag, a.serial, a.make, a.model, a.category_label,
              a.holder, a.holder_email, a.location]
        .filter(Boolean).join(' ').toLowerCase().includes(needle);
    });
  }, [assets, lane, own, q]);

  return (
    <div style={S.shell}>
      <div style={S.inner}>

        <div style={S.head}>
          <div style={S.title}>Assets</div>
          <div style={S.subtitle}>
            Every device, who has it, and what came back.
          </div>
        </div>

        <div style={S.switcher}>
          <button style={view === 'board' ? S.tabOn : S.tab}
                  onClick={function () { setView('board'); }}>Register</button>
          <button style={view === 'reports' ? S.tabOn : S.tab}
                  onClick={function () { setView('reports'); }}>Reports</button>
        </div>

        {error ? <div style={S.error}>{error}</div> : null}

        {view === 'reports' ? <Reports assets={assets} /> : (
          <>
            <div style={S.counts}>
              {LANES.map(function (l) {
                return <Count key={l.key} label={l.label} value={counts[l.key]}
                              tone={STATUS_COLOUR[l.key] || C.steel}
                              active={lane === l.key}
                              onClick={function () {
                                setLane(lane === l.key ? '' : l.key);
                              }} />;
              })}
            </div>

            <div style={S.bar}>
              <input style={S.search} value={q} placeholder="Tag, serial, model or holder"
                     onChange={function (e) { setQ(e.target.value); }} />
              <select style={S.select} value={own}
                      onChange={function (e) { setOwn(e.target.value); }}>
                <option value="">Any owner</option>
                {OWNERSHIP.map(function (o) {
                  return <option key={o.value} value={o.value}>{o.label}</option>;
                })}
              </select>
              <button style={S.primary} onClick={function () { setAdding(true); }}>
                Add an asset
              </button>
            </div>

            {loading ? <Empty>Loading the register…</Empty> : (
              shown.length > 0 ? (
                <div style={S.list}>
                  {shown.map(function (a) {
                    return <Row key={a.id} a={a}
                                onAssign={function () { setAssigning(a); }}
                                onReturn={function () { setReturning(a); }}
                                onHistory={function () { setHistory(a); }} />;
                  })}
                </div>
              ) : (
                <Empty>
                  {assets.length > 0
                    ? 'Nothing matches that.'
                    : 'Nothing in the register yet. Add the first one.'}
                </Empty>
              )
            )}
          </>
        )}

        {adding ? <AddPanel cats={cats} me={me}
                            onClose={function () { setAdding(false); }}
                            onSaved={function () { setAdding(false); load(); }} /> : null}

        {assigning ? <AssignPanel asset={assigning} me={me}
                            onClose={function () { setAssigning(null); }}
                            onSaved={function () { setAssigning(null); load(); }} /> : null}

        {returning ? <ReturnPanel asset={returning} me={me}
                            onClose={function () { setReturning(null); }}
                            onSaved={function () { setReturning(null); load(); }} /> : null}

        {history ? <HistoryPanel asset={history}
                            onClose={function () { setHistory(null); }} /> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ row */

function Row({ a, onAssign, onReturn, onHistory }) {
  const colour = STATUS_COLOUR[a.status] || C.steel;
  const open   = !!a.assignment_id;
  const gone   = ['retired', 'released', 'returned_to_lessor'].indexOf(a.status) > -1;

  let clock = null;
  if (a.warranty_days !== null && a.warranty_days !== undefined && !gone) {
    if (a.warranty_days < 0) {
      clock = <span style={S.alarm}>Warranty ended {pretty(a.warranty_until)}</span>;
    } else if (a.warranty_days <= 60) {
      clock = <span style={S.warn}>Warranty ends in {a.warranty_days} days</span>;
    }
  }

  return (
    <div style={S.item}>
      <div style={{ ...S.rule, background: colour }} />
      <div style={S.itemBody}>
        <div style={S.itemTop}>
          <span style={S.handle}>{handle(a)}</span>
          <span style={S.what}>{describe(a)}</span>
          <StatusPill status={a.status} />
          <Pill subtle tone={a.ownership === 'byod' ? C.ochre
                           : a.ownership === 'leased' ? C.aubergine : C.muted}>
            {ownershipLabel(a.ownership)}
          </Pill>
        </div>
        <div style={S.meta}>
          {a.category_label}
          {a.serial ? ' · ' + a.serial : ''}
          {a.location ? ' · ' + a.location : ''}
          {open ? <> · <span style={S.holder}>{a.holder || a.holder_email}</span>
                      {' since ' + pretty(a.assigned_on)}</> : null}
        </div>
        {clock ? <div style={{ marginTop: 4 }}>{clock}</div> : null}
      </div>
      <div style={S.actions}>
        {open
          ? <button style={S.ghost} onClick={onReturn}>
              {a.ownership === 'byod' ? 'Remove access' : 'Return'}
            </button>
          : (gone ? null : <button style={S.ghost} onClick={onAssign}>Assign</button>)}
        <button style={S.ghost} onClick={onHistory}>History</button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- adding */

function AddPanel({ cats, me, onClose, onSaved }) {
  const [f, setF] = useState({
    category: 'laptop', ownership: 'bayzat', make: '', model: '', serial: '',
    tag: '', location: '', lessor: '', lease_ref: '', lease_until: '',
    purchased_on: '', warranty_until: '', notes: ''
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');

  const set = function (k) {
    return function (e) {
      const v = e.target.value;
      setF(function (p) { return { ...p, [k]: v }; });
    };
  };

  const save = async function () {
    setBusy(true);
    setErr('');
    const row = {
      category: f.category, ownership: f.ownership, source: 'manual',
      created_by: me, updated_by: me,
      status: f.ownership === 'byod' ? 'assigned' : 'in_stock'
    };
    ['make', 'model', 'serial', 'tag', 'location', 'lessor', 'lease_ref', 'notes']
      .forEach(function (k) { if (f[k].trim()) row[k] = f[k].trim(); });
    ['lease_until', 'purchased_on', 'warranty_until']
      .forEach(function (k) { if (f[k]) row[k] = f[k]; });

    /* A BYOD device is never in stock — it arrives already with its owner,
       so it is created assigned and needs a holder straight away. */
    const { error } = await supabase.from('assets').insert(row);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  };

  return (
    <Panel title="Add an asset"
           sub="Created here, and the employee record follows."
           onClose={onClose}>
      {err ? <div style={S.error}>{err}</div> : null}

      <div style={S.row2}>
        <Field label="Category">
          <select style={S.input} value={f.category} onChange={set('category')}>
            {cats.map(function (c) {
              return <option key={c.slug} value={c.slug}>{c.label}</option>;
            })}
          </select>
        </Field>
        <Field label="Owned by">
          <select style={S.input} value={f.ownership} onChange={set('ownership')}>
            {OWNERSHIP.map(function (o) {
              return <option key={o.value} value={o.value}>{o.label}</option>;
            })}
          </select>
        </Field>
      </div>

      {f.ownership === 'byod' ? (
        <div style={S.note}>
          An employee-owned device cannot be collected or retired. At exit the
          only ending is that we remove our access from it.
        </div>
      ) : null}

      <div style={S.row2}>
        <Field label="Make"><input style={S.input} value={f.make} onChange={set('make')} /></Field>
        <Field label="Model"><input style={S.input} value={f.model} onChange={set('model')} /></Field>
      </div>

      <div style={S.row2}>
        <Field label="Serial" hint="Unique when given. Leave blank if there isn't one.">
          <input style={S.input} value={f.serial} onChange={set('serial')} />
        </Field>
        <Field label="Tag" hint="Your own reference, e.g. BZ-LT-047.">
          <input style={S.input} value={f.tag} onChange={set('tag')} />
        </Field>
      </div>

      <Field label="Location" hint="Office, store room, or the city it sits in.">
        <input style={S.input} value={f.location} onChange={set('location')} />
      </Field>

      {f.ownership === 'leased' ? (
        <div style={S.row2}>
          <Field label="Lessor">
            <input style={S.input} value={f.lessor} onChange={set('lessor')} />
          </Field>
          <Field label="Lease ends">
            <input type="date" style={S.input} value={f.lease_until}
                   onChange={set('lease_until')} />
          </Field>
        </div>
      ) : null}

      {f.ownership === 'bayzat' ? (
        <div style={S.row2}>
          <Field label="Bought on">
            <input type="date" style={S.input} value={f.purchased_on}
                   onChange={set('purchased_on')} />
          </Field>
          <Field label="Warranty ends">
            <input type="date" style={S.input} value={f.warranty_until}
                   onChange={set('warranty_until')} />
          </Field>
        </div>
      ) : null}

      <Field label="Notes">
        <textarea style={S.textarea} value={f.notes} onChange={set('notes')} />
      </Field>

      <button style={S.primary} disabled={busy} onClick={save}>
        {busy ? 'Saving…' : 'Add it'}
      </button>
    </Panel>
  );
}

/* ------------------------------------------------------------ assigning */

function AssignPanel({ asset, me, onClose, onSaved }) {
  const [q, setQ]       = useState('');
  const [people, setPeople] = useState([]);
  const [picked, setPicked] = useState(null);
  const [when, setWhen] = useState(today());
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');

  useEffect(function () {
    const needle = q.trim();
    if (needle.length < 2) { setPeople([]); return; }
    let live = true;
    const t = setTimeout(async function () {
      const { data } = await supabase
        .from('v_employees')
        .select('employee_id,full_name,work_email,department,title')
        .or('full_name.ilike.%' + needle + '%,work_email.ilike.%' + needle + '%')
        .limit(8);
      if (live) setPeople(data || []);
    }, 220);
    return function () { live = false; clearTimeout(t); };
  }, [q]);

  const save = async function () {
    if (!picked) { setErr('Pick who is holding it.'); return; }
    setBusy(true);
    setErr('');
    const { error } = await supabase.from('asset_assignments').insert({
      asset_id   : asset.id,
      employee_id: picked.employee_id,
      person     : picked.full_name,
      work_email : picked.work_email,
      assigned_on: when,
      assigned_by: me,
      assign_note: note.trim() || null
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  };

  return (
    <Panel title={'Assign ' + handle(asset)}
           sub={describe(asset) + ' · ' + ownershipLabel(asset.ownership)}
           onClose={onClose}>
      {err ? <div style={S.error}>{err}</div> : null}

      <Field label="Who has it" hint="Two letters or more searches the directory.">
        <input style={S.input} value={picked ? picked.full_name : q}
               placeholder="Name or work email"
               onChange={function (e) { setPicked(null); setQ(e.target.value); }} />
      </Field>

      {!picked && people.length > 0 ? (
        <div style={{ marginBottom: 14 }}>
          {people.map(function (p) {
            return (
              <button key={p.employee_id} style={{ ...S.ghost, display: 'block',
                        width: '100%', textAlign: 'left', marginBottom: 5 }}
                      onClick={function () { setPicked(p); setPeople([]); }}>
                {p.full_name}
                <span style={S.eventWho}>
                  {' — ' + (p.title || '') + (p.department ? ', ' + p.department : '')}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <Field label="From">
        <input type="date" style={S.input} value={when}
               onChange={function (e) { setWhen(e.target.value); }} />
      </Field>

      <Field label="Note">
        <textarea style={S.textarea} value={note}
                  onChange={function (e) { setNote(e.target.value); }} />
      </Field>

      <button style={S.primary} disabled={busy} onClick={save}>
        {busy ? 'Saving…' : 'Assign it'}
      </button>
    </Panel>
  );
}

/* ------------------------------------------------------------ returning */

function ReturnPanel({ asset, me, onClose, onSaved }) {
  const options = CLOSURES[asset.ownership] || CLOSURES.bayzat;
  const [closure, setClosure]   = useState(options[0].value);
  const [when, setWhen]         = useState(today());
  const [condition, setCondition] = useState('');
  const [wiped, setWiped]       = useState(false);
  const [evidence, setEvidence] = useState('');
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState('');

  const chosen = options.find(function (o) { return o.value === closure; });
  const byod   = asset.ownership === 'byod';

  const save = async function () {
    if (chosen && chosen.needsCondition && !condition.trim()) {
      setErr('What condition did it come back in? The database will refuse without it.');
      return;
    }
    if (wiped && !evidence.trim()) {
      setErr('A wipe needs evidence behind it — a ticket, a link, or who witnessed it.');
      return;
    }
    setBusy(true);
    setErr('');
    const patch = {
      returned_on: when,
      returned_by: me,
      closure    : closure,
      return_condition: condition.trim() || null
    };
    if (wiped) {
      patch.wiped_at = new Date().toISOString();
      patch.wipe_evidence = evidence.trim();
    }
    if (byod) patch.access_removed_at = new Date().toISOString();

    const { error } = await supabase.from('asset_assignments')
      .update(patch).eq('id', asset.assignment_id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  };

  return (
    <Panel title={byod ? 'Remove access from ' + handle(asset)
                       : 'Close out ' + handle(asset)}
           sub={(asset.holder || asset.holder_email || 'held') + ' · ' +
                ownershipLabel(asset.ownership)}
           onClose={onClose}>
      {err ? <div style={S.error}>{err}</div> : null}

      {byod ? (
        <div style={S.note}>
          This device belongs to {asset.holder || 'the employee'}, so there is
          nothing to collect. Record that our access was removed and, where it
          applies, that the Bayzat account was wiped from it.
        </div>
      ) : null}

      <Field label="How it ended">
        <select style={S.input} value={closure}
                onChange={function (e) { setClosure(e.target.value); setErr(''); }}>
          {options.map(function (o) {
            return <option key={o.value} value={o.value}>{o.label}</option>;
          })}
        </select>
      </Field>

      <Field label="On">
        <input type="date" style={S.input} value={when}
               onChange={function (e) { setWhen(e.target.value); }} />
      </Field>

      {chosen && chosen.needsCondition ? (
        <Field label="Condition it came back in"
               hint="Required — the check constraint refuses a collection without it.">
          <input style={S.input} value={condition}
                 onChange={function (e) { setCondition(e.target.value); }} />
        </Field>
      ) : null}

      <Field label={byod ? 'Bayzat account wiped from the device' : 'Device wiped'}>
        <label style={{ ...S.fieldHint, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={wiped}
                 onChange={function (e) { setWiped(e.target.checked); }} />
          {byod ? 'Selective wipe done' : 'Wiped and confirmed'}
        </label>
      </Field>

      {wiped ? (
        <Field label="Evidence"
               hint="Ticket number, recording link, or who witnessed it. Enforced.">
          <textarea style={S.textarea} value={evidence}
                    onChange={function (e) { setEvidence(e.target.value); }} />
        </Field>
      ) : null}

      <button style={S.primary} disabled={busy} onClick={save}>
        {busy ? 'Saving…' : byod ? 'Record it' : 'Close it out'}
      </button>
    </Panel>
  );
}

/* -------------------------------------------------------------- history */

function HistoryPanel({ asset, onClose }) {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(function () {
    let live = true;
    supabase.from('v_asset_history').select('*')
      .eq('asset_id', asset.id).order('at', { ascending: false })
      .then(function ({ data }) {
        if (!live) return;
        setRows(data || []);
        setBusy(false);
      });
    return function () { live = false; };
  }, [asset.id]);

  return (
    <Panel wide title={handle(asset)}
           sub={describe(asset) + ' · every hand it passed through'}
           onClose={onClose}>
      {busy ? <Empty>Reading the trail…</Empty> : (
        rows.length > 0 ? (
          <div>
            {rows.map(function (e) {
              return (
                <div key={e.id} style={S.event}>
                  <div style={S.eventWhen}>{pretty(e.at)}</div>
                  <div style={S.eventWhat}>
                    <b>{e.kind}</b>{e.detail ? ' — ' + e.detail : ''}
                    <div style={S.eventWho}>{e.actor}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <Empty>Nothing recorded yet.</Empty>
      )}
    </Panel>
  );
}
