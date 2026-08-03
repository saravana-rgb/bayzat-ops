'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthGate, Bar, supabase } from '../common/shared';
import Documents from './documents';
import { GROUPS, PRIVATE_FIELDS, expiryChip, fullName, initials, insuranceGap,
         money, pretty, warningsFor } from './shared';

const PER_PAGE = 25;

export default function MasterPage() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  const [view, setView] = useState('people');
  const [email, setEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);
  return (
    <div className="wrap">
      <Bar
        title="Master employees"
        sub={view === 'people'
          ? 'The full HR record, synced from the Master sheet'
          : 'Documents that have lapsed or are about to, and what is missing'}
        right={<a className="back" href="/">← All tiles</a>}
      />
      <div className="viewswitch">
        <button data-on={view === 'people' ? '1' : '0'}
          onClick={() => setView('people')}>People</button>
        <button data-on={view === 'docs' ? '1' : '0'}
          onClick={() => setView('docs')}>Documents</button>
      </div>
      {view === 'people' ? <Directory /> : <Documents actor={email} />}
    </div>
  );
}

function Directory() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [scope, setScope] = useState('active');
  const [facet, setFacet] = useState({ key: '', value: '' });
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [synced, setSynced] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('employees').select('*')
      .order('first_name');
    if (error) { setError(error.message); return; }
    setError(''); setRows(data || []);
    const last = (data || []).map(r => r.master_synced_at).filter(Boolean).sort().pop();
    setSynced(last || null);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [q, scope, facet]);

  const facets = useMemo(() => {
    const pick = k => [...new Set((rows || [])
      .map(e => (e[k] || '').trim()).filter(Boolean))].sort();
    return { department: pick('department'), legal_entity: pick('legal_entity'),
             location: pick('location'), employee_group: pick('employee_group'),
             team: pick('team') };
  }, [rows]);

  if (!rows) return <p className="note-txt">Loading the master record…</p>;

  const term = q.trim().toLowerCase();
  const list = rows.filter(e => {
    if (scope === 'active' && e.status !== 'active') return false;
    if (scope === 'leavers' && e.status !== 'leaver') return false;
    if (scope === 'probation' && !(e.probation_end &&
        new Date(e.probation_end) > new Date(Date.now() - 7 * 864e5))) return false;
    if (scope === 'visa' && !e.visa_expiry) return false;
    if (e.status === 'deleted') return false;
    if (facet.key && (e[facet.key] || '') !== facet.value) return false;
    if (!term) return true;
    return [e.first_name, e.last_name, e.full_name, e.work_email, e.employee_id,
            e.title, e.department, e.reports_to, e.mol_id, e.team]
      .some(v => (v || '').toLowerCase().includes(term));
  });

  if (scope === 'visa') {
    list.sort((a, b) => String(a.visa_expiry).localeCompare(String(b.visa_expiry)));
  }

  const active = rows.filter(e => e.status === 'active');
  const visaSoon = active.filter(e => {
    const d = e.visa_expiry
      ? Math.round((new Date(e.visa_expiry) - Date.now()) / 864e5) : null;
    return d !== null && d <= 60;
  });
  const onProbation = active.filter(e => e.probation_end &&
    new Date(e.probation_end) > new Date());
  const open = rows.find(e => e.id === openId);

  function exportCsv() {
    const cols = ['employee_id','full_name','work_email','title','department','team',
                  'reports_to','legal_entity','location','employee_status','hiring_date',
                  'probation_end','visa_expiry','contract_type','notice_period'];
    const q2 = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    const lines = [cols.map(q2).join(',')];
    list.forEach(e => lines.push(cols.map(c => q2(e[c])).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'master-employees.csv';
    a.click(); URL.revokeObjectURL(a.href);
  }

  return (
    <>
      {error && <div className="err">{error}</div>}

      <div className="stats">
        <Stat n={active.length} l="Active" />
        <Stat n={rows.filter(e => e.status === 'leaver').length} l="Left" />
        <Stat n={onProbation.length} l="On probation" c="calm" />
        <Stat n={visaSoon.length} l="Visa within 60d" c={visaSoon.length ? 'hot' : ''} />
        <Stat n={facets.department.length} l="Departments" />
      </div>

      <div className="toolbar">
        <div className="tabset">
          {[['active', 'Active', active.length],
            ['probation', 'On probation', onProbation.length],
            ['visa', 'Visa expiry', rows.filter(e => e.visa_expiry).length],
            ['leavers', 'Left', rows.filter(e => e.status === 'leaver').length]]
            .map(([k, l, n]) => (
            <button key={k} data-on={scope === k ? '1' : '0'}
              onClick={() => { setScope(k); setFacet({ key: '', value: '' }); }}>
              {l}{n ? ` · ${n}` : ''}
            </button>
          ))}
        </div>
        <input className="search" value={q} placeholder="Search name, email, ID, title, manager"
          onChange={e => setQ(e.target.value)} />
      </div>

      <div className="facets">
        {['department', 'legal_entity', 'location', 'team'].map(k => (
          <select key={k} className="facetsel"
            value={facet.key === k ? facet.value : ''}
            onChange={e => setFacet(e.target.value ? { key: k, value: e.target.value }
                                                   : { key: '', value: '' })}>
            <option value="">All {k.replace('_', ' ')}s</option>
            {facets[k].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        ))}
        {facet.key && (
          <button className="mini" onClick={() => setFacet({ key: '', value: '' })}>Clear</button>
        )}
        <span className="count">{list.length} shown</span>
        <button className="mini" onClick={load}>Refresh</button>
        <button className="mini" onClick={exportCsv}>Export</button>
      </div>

      {list.length === 0
        ? <div className="empty"><b>Nobody matches</b>
            <span>Try a different search, or clear the filters.</span></div>
        : <div className="people">
            {list.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).map(e => {
              const warns = warningsFor(e, null);
              const ins = insuranceGap(e);
              return (
                <button key={e.id} className="person" onClick={() => setOpenId(e.id)}>
                  <span className={'ini' + (e.status === 'leaver' ? ' left' : '')}>
                    {initials(e)}
                  </span>
                  <span className="who">
                    <span className="nm">
                      {fullName(e)}
                      {e.employee_id && <span className="pc-ref">{e.employee_id}</span>}
                      {e.status === 'leaver' && <span className="chip grey">Left</span>}
                    </span>
                    <span className="sub">
                      {e.title || 'no title'} · {e.department || 'no department'}
                      {e.reports_to ? ' · reports to ' + e.reports_to : ''}
                    </span>
                  </span>
                  <span className="col hide-sm">{e.legal_entity || '—'}</span>
                  <span className="col hide-sm">{e.location || '—'}</span>
                  <span className="flags">
                    {warns.slice(0, 2).map(w =>
                      <span key={w.key} className={'chip ' + w.cls}>{w.text}</span>)}
                    {ins && !warns.length && <span className={'chip ' + ins.cls}>{ins.text}</span>}
                  </span>
                </button>
              );
            })}
          </div>}

      {list.length > PER_PAGE && (
        <Pager page={page} perPage={PER_PAGE} total={list.length} onPage={setPage} />
      )}

      {synced && (
        <p className="note-txt" style={{ marginTop: 18 }}>
          Last synced from the Master sheet {pretty(String(synced).slice(0, 10))} at{' '}
          {new Date(synced).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}.
          Edits belong in the sheet — this is a view of it.
        </p>
      )}

      {open && <Record e={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

/* ------------------------------------------------------------ pieces */
const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);

function Pager({ page, perPage, total, onPage }) {
  const pages = Math.ceil(total / perPage);
  const start = Math.max(0, Math.min(page - 2, pages - 5));
  const win = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
  return (
    <div className="pager">
      <span className="pinfo">
        {page * perPage + 1}–{Math.min((page + 1) * perPage, total)} of {total}
      </span>
      <div className="pbtns">
        <button className="mini" disabled={page === 0} onClick={() => onPage(page - 1)}>
          Previous</button>
        {win.map(i => (
          <button key={i} className="mini" data-on={i === page ? '1' : '0'}
            onClick={() => onPage(i)}>{i + 1}</button>
        ))}
        <button className="mini" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
          Next</button>
      </div>
    </div>
  );
}

/** The whole record. Confidential fields are fetched separately and the
 *  database returns nulls unless the person asking is an HR admin. */
function Record({ e, onClose }) {
  const [priv, setPriv] = useState(null);
  const [tab, setTab] = useState(GROUPS[0].name);

  useEffect(() => {
    supabase.from('v_employee_private').select('*').eq('employee_id', e.id).maybeSingle()
      .then(({ data }) => setPriv(data || { may_view: false }));
  }, [e.id]);

  const warns = warningsFor(e, priv);
  const ins = insuranceGap(e);
  const group = GROUPS.find(g => g.name === tab);

  const show = (v, type) => {
    if (v === null || v === undefined || v === '' || v === 'N/A')
      return <span className="none">—</span>;
    if (type === 'date') return pretty(v);
    if (type === 'money') return money(v, priv?.currency);
    return String(v);
  };

  /* how many fields in a group actually have something in them — shown on
     the tab, so an empty section is obvious before you open it */
  const filled = (g) => g.fields.filter(([k]) => {
    const v = e[k];
    return v !== null && v !== undefined && v !== '' && v !== 'N/A';
  }).length;

  return (
    <div className="veil" onClick={ev => { if (ev.target === ev.currentTarget) onClose(); }}>
      <div className="panel wide">
        <div className="rechead">
          <span className="ini big">{initials(e)}</span>
          <div className="recwho">
            <h2>{fullName(e)}</h2>
            <p>{e.title || 'no title'}{e.department ? ' · ' + e.department : ''}</p>
            <p className="recmeta">
              {e.employee_id && <span>ID {e.employee_id}</span>}
              {e.work_email && <span>{e.work_email}</span>}
              {e.location && <span>{e.location}</span>}
            </p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {(warns.length > 0 || ins) && (
          <div className="recwarn">
            {warns.map(w => (
              <span key={w.key} className={'warnpill ' + w.cls}>
                <b>{w.text}</b>
                {w.date && <span>{pretty(w.date)}</span>}
              </span>
            ))}
            {ins && <span className={'warnpill ' + ins.cls}><b>{ins.text}</b></span>}
          </div>
        )}

        <div className="recfacts">
          <Fact label="Status" value={e.employee_status || e.status} />
          <Fact label="Joined" value={e.hiring_date ? pretty(e.hiring_date) : '—'} />
          <Fact label="Tenure" value={e.tenure ? e.tenure + ' years' : '—'} />
          <Fact label="Manager" value={e.reports_to || '—'} />
          <Fact label="Entity" value={e.legal_entity || '—'} />
        </div>

        <div className="rtabs">
          {GROUPS.map(g => {
            const n = filled(g);
            return (
              <button key={g.name} data-on={tab === g.name ? '1' : '0'}
                className={n ? '' : 'thin'} onClick={() => setTab(g.name)}>
                {g.name}<span className="tabn">{n}</span>
              </button>
            );
          })}
          <button data-on={tab === 'Confidential' ? '1' : '0'} className="conf"
            onClick={() => setTab('Confidential')}>Confidential</button>
        </div>

        {tab === 'Confidential' ? (
          priv?.may_view ? (
            <>
              <p className="confnote">
                Pay and identity documents. You can see these because your address is listed
                as an HR admin.
              </p>
              <div className="pairs">
                {PRIVATE_FIELDS.map(([k, label, type]) => (
                  <div key={k} className="pair">
                    <span className="pk">{label}</span>
                    <span className="pv">{show(priv?.[k], type)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="locked">
              <span className="lockmark">Restricted</span>
              <b>Not authorised</b>
              <p>
                Pay, passport, Emirates ID, date of birth and home address are held for this
                person. Only named HR admins can see them, and the restriction is enforced by
                the database rather than hidden in this page.
              </p>
              <p className="lockwho">Ask Saravana if you need access.</p>
            </div>
          )
        ) : (
          <div className="pairs">
            {group.fields.map(([k, label, type]) => (
              <div key={k} className="pair">
                <span className="pk">{label}</span>
                <span className="pv">{show(e[k], type)}</span>
              </div>
            ))}
          </div>
        )}

        <button className="btn ghost" style={{ marginTop: 20 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const Fact = ({ label, value }) => (
  <div className="fact"><span>{label}</span><b>{value}</b></div>
);
