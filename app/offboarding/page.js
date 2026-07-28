'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthGate, Bar, supabase } from '../common/shared';
import { ASSET_LABEL, BLOCKERS, EVIDENCE_REQUIRED, GUIDES, ORDER, STATUS,
         dayChip, daysSince, fullName, initials, pretty, today } from './shared';
import Reports from './reports';
import Handover from './handover';

export default function OffboardingPage() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  const [email, setEmail] = useState('');
  const [view, setView] = useState('board');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);
  return (
    <div className="wrap">
      <Bar
        title="Offboarding"
        sub={view === 'board'
          ? 'Who is leaving, what we need back, and what is still open'
          : 'How long offboarding takes, and what holds it up'}
        right={<a className="back" href="/">← All tiles</a>}
      />
      <div className="viewswitch">
        <button data-on={view === 'board' ? '1' : '0'} onClick={() => setView('board')}>Board</button>
        <button data-on={view === 'reports' ? '1' : '0'} onClick={() => setView('reports')}>Reports</button>
      </div>
      {view === 'board' ? <Board email={email} /> : <Reports />}
    </div>
  );
}

function Board({ email }) {
  const [leavers, setLeavers] = useState(null);
  const [steps, setSteps] = useState([]);
  const [staff, setStaff] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [tab, setTab] = useState('open');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const [starting, setStarting] = useState(null);   // the employee being offboarded
  const [blocking, setBlocking] = useState(null);   // the step being blocked
  const [evidence, setEvidence] = useState([]);
  const [handover, setHandover] = useState(null);

  const load = useCallback(async () => {
    const [l, s, e, ev, evd] = await Promise.all([
      supabase.from('leavers').select('*').order('last_working_day', { ascending: true }),
      supabase.from('leaver_steps').select('*').order('position'),
      supabase.from('employees').select('*').eq('status', 'active').order('first_name'),
      supabase.from('leaver_events').select('*').order('created_at', { ascending: false }).limit(80),
      supabase.from('leaver_evidence').select('*').order('created_at', { ascending: false })
    ]);
    if (l.error) { setError(l.error.message); return; }
    setError('');
    setLeavers(l.data || []); setSteps(s.data || []);
    setStaff(e.data || []); setEvents(ev.data || []); setEvidence(evd.data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  function note(msg) { setSaved(msg); setTimeout(() => setSaved(''), 1800); }

  async function begin(employee, lastDay, reason) {
    const { data, error } = await supabase.rpc('start_offboarding', {
      p_employee_id: employee.id, p_last_working_day: lastDay,
      p_reason: reason, p_actor: email, p_source: 'manual' });
    if (error) { setError(error.message); return; }
    if (data && data.ok === false) { setError(data.reason || 'Could not start'); return; }
    setStarting(null); setTab('open'); note('Offboarding started · ' + (data?.ref || ''));
    load();
  }

  async function setStep(step, status) {
    if (status === 'blocked') { setBlocking(step); return; }
    setSteps(all => all.map(s => s.id === step.id ? { ...s, status } : s));
    const { error } = await supabase.from('leaver_steps')
      .update({ status, updated_by: email }).eq('id', step.id);
    if (error) {
      setError(error.message.indexOf('ATTACH_EVIDENCE') > -1
        ? `${step.label} needs evidence attached before it can be marked done — open the ` +
          `person and add the signed form, a photo, or a note of what was done.`
        : error.message);
    }
    load();
  }

  async function block(step, reason) {
    const { data, error } = await supabase.rpc('block_leaver_step', {
      p_step_id: step.id, p_reason: reason, p_actor: email });
    if (error) { setError(error.message); return; }
    if (data && data.ok === false) { setError(data.reason); return; }
    setBlocking(null); note('Recorded as blocked');
    load();
  }

  /** A file, a link or a note against a step. Files go to a private bucket;
   *  downloads are short-lived signed links, never public URLs. */
  async function addEvidence(step, { file, url, note: text }) {
    let path = '', name = '', mime = '', size = null;
    if (file) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      path = `${step.leaver_id}/${step.position}-${Date.now()}-${safe}`;
      const up = await supabase.storage.from('offboarding-evidence').upload(path, file);
      if (up.error) { setError(up.error.message); return; }
      name = file.name; mime = file.type || ''; size = file.size;
    }
    const { error } = await supabase.rpc('add_leaver_evidence', {
      p_step_id: step.id, p_kind: file ? 'file' : url ? 'link' : 'note',
      p_file_path: path, p_file_name: name, p_mime: mime, p_size: size,
      p_url: url || '', p_note: text || '', p_actor: email });
    if (error) setError(error.message); else note('Evidence added');
    load();
  }

  async function openEvidence(item) {
    if (item.url) { window.open(item.url, '_blank'); return; }
    const { data, error } = await supabase.storage.from('offboarding-evidence')
      .createSignedUrl(item.file_path, 60);
    if (error) setError(error.message); else window.open(data.signedUrl, '_blank');
  }

  async function setNote(step, text) {
    await supabase.from('leaver_steps').update({ note: text, updated_by: email }).eq('id', step.id);
    load();
  }

  async function cancel(leaver, reason) {
    const { data, error } = await supabase.rpc('cancel_offboarding', {
      p_id: leaver.id, p_reason: reason, p_actor: email });
    if (error) { setError(error.message); return; }
    if (data && data.ok === false) { setError(data.reason); return; }
    setOpenId(null); note('Offboarding cancelled'); load();
  }

  const stepsOf = useCallback(
    (id) => steps.filter(s => s.leaver_id === id).sort((a, b) => a.position - b.position),
    [steps]);

  if (!leavers) return <p className="note-txt">Loading…</p>;

  const withProgress = leavers.map(l => {
    const mine = stepsOf(l.id);
    return {
      ...l, steps: mine,
      done: mine.filter(s => ['done', 'na'].includes(s.status)).length,
      blocked: mine.filter(s => s.status === 'blocked').length,
      open: mine.filter(s => !['done', 'na'].includes(s.status)).length
    };
  });

  const openOnes = withProgress.filter(l => l.status === 'pending');
  const dueNow = openOnes.filter(l => daysSince(l.last_working_day) >= 0);
  const blockedOnes = openOnes.filter(l => l.blocked);
  const doneOnes = withProgress.filter(l => l.status === 'completed');
  const cancelled = withProgress.filter(l => l.status === 'cancelled');

  const term = q.trim().toLowerCase();
  const match = p => !term ||
    [p.first_name, p.last_name, p.work_email, p.ref, p.department, p.title]
      .some(v => (v || '').toLowerCase().includes(term));

  const shown = (tab === 'open' ? openOnes
    : tab === 'due' ? dueNow
    : tab === 'done' ? doneOnes
    : tab === 'cancelled' ? cancelled : openOnes).filter(match);

  const detail = withProgress.find(l => l.id === openId);
  const beingOffboarded = new Set(openOnes.map(l => l.employee_id));

  return (
    <>
      {error && <div className="err">{error}</div>}
      {saved && <div className="busy">{saved}</div>}

      <div className="stats">
        <Stat n={openOnes.length} l="In progress" />
        <Stat n={dueNow.length} l="Last day passed" c={dueNow.length ? 'hot' : ''} />
        <Stat n={blockedOnes.length} l="Blocked" c="warm" />
        <Stat n={openOnes.reduce((a, l) => a + l.open, 0)} l="Steps outstanding" />
        <Stat n={doneOnes.length} l="Completed" c="good" />
      </div>

      <div className="toolbar">
        <div className="tabset">
          {[['open', 'In progress', openOnes.length],
            ['due', 'Overdue', dueNow.length],
            ['done', 'Completed', doneOnes.length],
            ['cancelled', 'Cancelled', cancelled.length],
            ['start', 'Start one', null]].map(([k, l, n]) => (
            <button key={k} data-on={tab === k ? '1' : '0'} onClick={() => setTab(k)}>
              {l}{n ? ` · ${n}` : ''}
            </button>
          ))}
        </div>
        <input className="search" value={q} placeholder="Search name, email or reference"
          onChange={e => setQ(e.target.value)} />
      </div>

      {tab === 'start'
        ? <StartList staff={staff} already={beingOffboarded} term={term}
                     onPick={setStarting} />
        : shown.length === 0
          ? <div className="empty">
              <b>{tab === 'due' ? 'Nothing overdue' : tab === 'done'
                ? 'Nothing completed yet' : 'Nobody is being offboarded'}</b>
              <span>{tab === 'open'
                ? 'Start one from the Start one tab, or add a row to the Leavers sheet.'
                : 'This list fills itself as offboardings move along.'}</span>
            </div>
          : <div className="grid">
              {shown.map(l => (
                <LeaverCard key={l.id} l={l} onOpen={() => setOpenId(l.id)} onSet={setStep} />
              ))}
            </div>}

      {starting && <StartDialog employee={starting} onCancel={() => setStarting(null)}
                                onConfirm={begin} />}
      {blocking && <BlockDialog step={blocking} onCancel={() => setBlocking(null)}
                                onConfirm={block} />}
      {detail && <Detail l={detail} events={events.filter(e => e.leaver_id === detail.id)}
                         evidence={evidence.filter(e => e.leaver_id === detail.id)} actor={email}
                         onClose={() => setOpenId(null)} onSet={setStep} onNote={setNote}
                         onCancel={cancel} onEvidence={addEvidence} onOpenEvidence={openEvidence} />}
    </>
  );
}

/* ------------------------------------------------------------ pieces */
const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);

/** Everyone still active, with a button each. This is the manual route in. */
function StartList({ staff, already, term, onPick }) {
  const list = staff.filter(e => !term ||
    [e.first_name, e.last_name, e.work_email, e.department, e.title]
      .some(v => (v || '').toLowerCase().includes(term)));

  if (!list.length) return (
    <div className="empty"><b>Nobody matches</b><span>Try a different search.</span></div>
  );

  return (
    <div className="people">
      {list.slice(0, 60).map(e => {
        const running = already.has(e.id);
        return (
          <div key={e.id} className="person">
            <span className="ini">{initials(e)}</span>
            <span className="who">
              <span className="nm">{fullName(e)}</span>
              <span className="sub">
                {e.title || 'no title'} · {e.department || 'no department'}
                {e.work_email ? ' · ' + e.work_email : ''}
              </span>
            </span>
            <span className="col hide-sm">
              {e.asset_type
                ? <span className="chip grey">{ASSET_LABEL[e.asset_type]}
                    {e.asset_serial ? ' · ' + e.asset_serial : ''}</span>
                : <span className="chip red">No device recorded</span>}
            </span>
            {running
              ? <span className="chip amber">Already offboarding</span>
              : <button className="mini danger" onClick={() => onPick(e)}>Offboard</button>}
          </div>
        );
      })}
      {list.length > 60 && (
        <div className="person"><span className="note-txt">
          {list.length - 60} more — narrow it down with the search.
        </span></div>
      )}
    </div>
  );
}

function LeaverCard({ l, onOpen, onSet }) {
  const chip = dayChip(l.last_working_day, l.status);
  const late = l.status === 'pending' && daysSince(l.last_working_day) > 0;
  const pending = l.steps.filter(s => !['done', 'na'].includes(s.status));

  return (
    <div className={'pcard' + (late ? ' late' : '')}>
      <div className="pc-top" onClick={onOpen} style={{ cursor: 'pointer' }}>
        <div>
          <div className="pc-name">
            {fullName(l)}
            <span className="pc-ref">{l.ref}</span>
            {l.blocked > 0 && <span className="chip red">{l.blocked} blocked</span>}
          </div>
          <div className="pc-meta">
            {l.title || 'no title'}{l.department ? ' · ' + l.department : ''} ·
            last day {pretty(l.last_working_day)}
            {l.asset_serial ? ' · ' + l.asset_serial : ''}
          </div>
        </div>
        <div className="pc-right">
          <span className={'chip ' + chip.cls}>{chip.text}</span>
          <span className="pc-count">{l.done}/{l.steps.length}</span>
        </div>
      </div>

      <div className="pc-bar">
        <div className="runway">
          {l.steps.map(s => (
            <div key={s.id} title={`${s.label}: ${STATUS[s.status]}`}
              className={'seg ofb' + (s.status === 'done' ? ' done'
                : s.status === 'na' ? ' na'
                : s.status === 'blocked' ? ' blocked'
                : s.status === 'progress' ? ' progress' : '')} />
          ))}
        </div>
      </div>

      <div className="pc-steps">
        {pending.length === 0
          ? <div className="allgood">Everything done — the record is now inactive</div>
          : pending.map(s => (
              <div key={s.id} className="pstep">
                <span className={'pnum p' + s.position}>{s.position}</span>
                <span className="plabel">{s.label}</span>
                {s.status === 'blocked'
                  ? <span className="chip red">Blocked · {s.blocker}</span>
                  : <span className={'chip ' + (s.status === 'progress' ? 'amber' : 'grey')}>
                      {STATUS[s.status]}</span>}
                <div className="pacts">
                  {s.status !== 'blocked' &&
                    <button className="mini" onClick={() => onSet(s, 'blocked')}>Blocked</button>}
                  <button className="mini go" onClick={() => onSet(s, 'done')}>Done</button>
                </div>
              </div>
            ))}
      </div>

      <div className="pfoot">
        <span className="note-txt">
          {l.open ? `${l.open} of ${l.steps.length} still to do` : 'Nothing outstanding'}
        </span>
        <button className="mini" style={{ marginLeft: 'auto' }} onClick={onOpen}>Open</button>
      </div>
    </div>
  );
}

function StartDialog({ employee, onCancel, onConfirm }) {
  const [day, setDay] = useState(today());
  const [reason, setReason] = useState('');
  const REASONS = ['Resigned', 'Contract ended', 'Let go', 'Retired', 'Something else'];
  const hasDevice = employee.asset_type && !['personal', 'none'].includes(employee.asset_type);

  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="panel confirm">
        <div className="confirm-head">
          <span className="ini big">{initials(employee)}</span>
          <div>
            <h2>Offboard {fullName(employee)}?</h2>
            <p>{employee.title || 'no title'}
              {employee.department ? ' · ' + employee.department : ''}</p>
          </div>
        </div>

        <ul className="confirm-facts">
          <li><b>{hasDevice
            ? `They have a ${ASSET_LABEL[employee.asset_type].toLowerCase()}${
                employee.asset_serial ? ', serial ' + employee.asset_serial : ''}.`
            : employee.asset_type
              ? 'No company device to collect.'
              : 'No device is recorded against them — worth checking before you start.'}</b>
            {hasDevice && ' Collecting and wiping it are on the checklist.'}</li>
          <li><b>They stay active</b> in the directory until every step is finished.</li>
          <li><b>Reminders start on their last working day</b> and arrive every working
            day at 2pm until the checklist is done.</li>
        </ul>

        <div className="frow">
          <div>
            <label>Last working day</label>
            <input type="date" value={day} onChange={e => setDay(e.target.value)} />
          </div>
        </div>

        <label style={{ marginTop: 14 }}>Why are they leaving?</label>
        <div className="reasons">
          {REASONS.map(r => (
            <button key={r} className="reason" data-on={reason === r ? '1' : '0'}
              onClick={() => setReason(r)}>{r}</button>
          ))}
        </div>

        <div className="confirm-acts">
          <button className="btn ghost" onClick={onCancel}>Not yet</button>
          <button className="btn danger" disabled={!day || !reason}
            onClick={() => onConfirm(employee, day, reason)}>
            {day && reason ? 'Start offboarding' : 'Pick a date and reason'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** One step: what it is, how to do it, what proves it was done. */
function Step({ s, leaver, evidence, actor, onSet, onNote, onEvidence, onOpenEvidence, onForm }) {
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);
  const fileRef = useRef(null);
  const guide = GUIDES[s.position] || {};
  const needs = EVIDENCE_REQUIRED.includes(s.position);

  return (
    <div className={'step e' + s.position + (s.status === 'done' ? ' done' : '')
      + (s.status === 'blocked' ? ' late' : '')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div className={'num p' + s.position}>{s.position}</div>
        <div className="st">{s.label}</div>
        {needs && (
          <span className={'chip ' + (evidence.length ? 'green' : 'amber')}>
            {evidence.length ? `${evidence.length} attached` : 'Evidence needed'}
          </span>
        )}
        {s.done_at && <span className="chip green" style={{ marginLeft: 'auto' }}>
          {pretty(String(s.done_at).slice(0, 10))}</span>}
      </div>

      {guide.hint && <p className="guide">{guide.hint}</p>}

      <div className="guiderow">
        {guide.link && (
          <a className="mini" href={guide.link} target="_blank" rel="noopener noreferrer">
            {guide.linkLabel || 'How to do this'}
          </a>
        )}
        {s.position === 5 && (
          <button className="mini" onClick={() => onForm(leaver)}>
            Open the collection form
          </button>
        )}
      </div>

      {s.status === 'blocked' && <div className="blockline">Blocked · {s.blocker}</div>}

      <div className="ctl">
        {ORDER.map(v => (
          <button key={v} data-on={s.status === v ? '1' : '0'} onClick={() => onSet(s, v)}>
            {STATUS[v]}
          </button>
        ))}
      </div>

      <input className="note" defaultValue={s.note || ''}
        placeholder="Note — courier reference, who has it, what was agreed"
        onBlur={e => { if (e.target.value !== (s.note || '')) onNote(s, e.target.value); }} />

      <div className="evidence">
        <div className="evhead">
          <span className="evtitle">Evidence</span>
          {needs && <span className={'chip ' + (evidence.length ? 'green' : 'amber')}>
            {evidence.length ? 'Attached' : 'Needed to close this'}
          </span>}
          {needs && !evidence.length && guide.evidence &&
            <span className="evneed">{guide.evidence}</span>}
        </div>

        {evidence.length > 0 && (
          <div className="evlist">
            {evidence.map(e => (
              <button key={e.id} className="evitem" onClick={() => onOpenEvidence(e)}>
                <span className="evkind">{e.kind === 'file' ? 'FILE'
                  : e.kind === 'link' ? 'LINK' : 'NOTE'}</span>
                <span className="evtext">
                  {e.file_name || e.url || e.note}
                  {e.note && (e.file_name || e.url) ? ' — ' + e.note : ''}
                </span>
                <span className="evwho">{(e.actor || '').split('@')[0]}</span>
              </button>
            ))}
          </div>
        )}

        <input ref={fileRef} type="file" style={{ display: 'none' }}
          accept="image/*,.pdf,.eml,.msg"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) onEvidence(s, { file: f, note: text });
            e.target.value = ''; setText('');
          }} />

        {adding
          ? <div className="evadd">
              <input autoFocus value={text} placeholder="What was done, or paste a link"
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && text.trim()) {
                  const isLink = /^https?:\/\//i.test(text.trim());
                  onEvidence(s, isLink ? { url: text.trim() } : { note: text.trim() });
                  setText(''); setAdding(false);
                } }} />
              <button className="mini go" disabled={!text.trim()}
                onClick={() => {
                  const isLink = /^https?:\/\//i.test(text.trim());
                  onEvidence(s, isLink ? { url: text.trim() } : { note: text.trim() });
                  setText(''); setAdding(false);
                }}>Save</button>
              <button className="mini" onClick={() => { setAdding(false); setText(''); }}>
                Cancel
              </button>
            </div>
          : <div className="evadd">
              <button className="mini" onClick={() => fileRef.current?.click()}>
                Attach a photo or file
              </button>
              <button className="mini" onClick={() => setAdding(true)}>
                Add a note or link
              </button>
            </div>}
      </div>
    </div>
  );
}

function BlockDialog({ step, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const full = reason + (note.trim() ? ' — ' + note.trim() : '');
  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="panel confirm">
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>What is holding up {step.label.toLowerCase()}?</h2>
        <p className="note-txt" style={{ margin: '10px 0 18px', lineHeight: 1.7 }}>
          Recording this keeps it out of the "we forgot" pile and puts it in the report,
          so the same thing stops happening every month.
        </p>
        <div className="reasons">
          {BLOCKERS.map(r => (
            <button key={r} className="reason" data-on={reason === r ? '1' : '0'}
              onClick={() => setReason(r)}>{r}</button>
          ))}
        </div>
        <input className="note" value={note} placeholder="Anything worth adding (optional)"
          onChange={e => setNote(e.target.value)} />
        <div className="confirm-acts">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn danger" disabled={!reason} onClick={() => onConfirm(step, full)}>
            {reason ? 'Mark as blocked' : 'Pick a reason'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({ l, events, evidence, actor, onClose, onSet, onNote, onCancel,
                 onEvidence, onOpenEvidence, onForm }) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const chip = dayChip(l.last_working_day, l.status);

  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel wide">
        <div className="ph">
          <span className="ini big">{initials(l)}</span>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>
              {fullName(l)} <span className="pc-ref">{l.ref}</span>
            </h2>
            <div className="drawer-sub">
              {l.title || 'no title'}{l.department ? ' · ' + l.department : ''} ·
              last day {pretty(l.last_working_day)}
              {l.reason ? ' · ' + l.reason : ''}
            </div>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-flags">
          <span className={'chip ' + chip.cls}>{chip.text}</span>
          <span className="chip accent">{l.done} of {l.steps.length} done</span>
          {l.source === 'sheet' && <span className="chip grey">From the leaver sheet</span>}
        </div>

        <div className="assetbox">
          <div>
            <b>{ASSET_LABEL[l.asset_type] || 'Not recorded'}</b>
            <span>{l.asset_serial || 'No serial number recorded'}
              {l.work_email ? ' · ' + l.work_email : ''}</span>
          </div>
        </div>

        {l.steps.map(s => (
          <Step key={s.id} s={s} leaver={l} actor={actor} onForm={onForm}
                evidence={evidence.filter(x => x.step_id === s.id)}
                onSet={onSet} onNote={onNote}
                onEvidence={onEvidence} onOpenEvidence={onOpenEvidence} />
        ))}

        {l.status === 'pending' && (
          <>
            <div className="sec">Stopping this offboarding</div>
            {cancelling
              ? <div className="danger-zone" style={{ display: 'block' }}>
                  <b>Why is it being stopped?</b>
                  <input className="note" value={cancelReason} autoFocus
                    placeholder="They are staying, wrong person, started twice…"
                    onChange={e => setCancelReason(e.target.value)} />
                  <div style={{ display: 'flex', gap: 9, marginTop: 12, flexWrap: 'wrap' }}>
                    <button className="mini" onClick={() => setCancelling(false)}>Keep going</button>
                    <button className="mini danger" disabled={!cancelReason.trim()}
                      onClick={() => onCancel(l, cancelReason)}>Stop offboarding</button>
                  </div>
                </div>
              : <div className="danger-zone">
                  <div>
                    <b>Stop this offboarding</b>
                    <span>If they are staying after all, or this was started by mistake.
                      The record is kept and they remain active in the directory.</span>
                  </div>
                  <button className="mini danger" onClick={() => setCancelling(true)}>Stop…</button>
                </div>}
          </>
        )}

        <div className="sec">History</div>
        {events.length === 0
          ? <p className="note-txt">Nothing recorded yet.</p>
          : <div className="trail">
              {events.map(e => (
                <div key={e.id} className="tr">
                  <span className={'dot ' + (e.kind === 'blocked' ? 'cmt'
                    : e.kind === 'completed' ? 'done' : '')} />
                  <span>{e.detail || e.kind}
                    <span className="who"> · {(e.actor || 'someone').split('@')[0]} ·{' '}
                      {String(e.created_at).slice(0, 10)}</span>
                  </span>
                </div>
              ))}
            </div>}

        <button className="btn ghost" style={{ marginTop: 18 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
