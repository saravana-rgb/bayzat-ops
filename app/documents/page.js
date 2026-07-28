'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthGate, Bar, supabase } from '../common/shared';
import { BUCKET, CATEGORIES, LABEL, expiryChip, pretty, size } from './shared';

export default function DocumentsPage() {
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
        title="Company documents"
        sub="Licences, cards, letterheads and stamps — with expiry watched for you"
        right={<a className="back" href="/">← All tiles</a>}
      />
      <Repo email={email} />
    </div>
  );
}

function Repo({ email }) {
  const [docs, setDocs] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [tab, setTab] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [replacing, setReplacing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    const [d, e] = await Promise.all([
      supabase.from('company_documents').select('*').order('created_at', { ascending: false }),
      supabase.from('document_events').select('*').order('created_at', { ascending: false }).limit(60)
    ]);
    if (d.error) { setError(d.error.message); return; }
    setError(''); setDocs(d.data || []); setEvents(e.data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  /* ---------------- upload, and replace, which is an upload with a parent ---- */
  async function upload(file, category, title, entity, replacesId) {
    if (!file) return;
    setBusy('Uploading ' + file.name);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${category}/${Date.now()}-${safe}`;

    const up = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (up.error) { setError(up.error.message); setBusy(''); return; }

    const { error } = await supabase.rpc('add_document', {
      p_category: category, p_title: title || file.name, p_entity: entity || '',
      p_file_path: path, p_file_name: file.name, p_mime: file.type || '',
      p_size: file.size, p_actor: email, p_replaces: replacesId || null
    });
    if (error) setError(error.message);
    setBusy(''); setReplacing(null); load();
  }

  async function download(doc) {
    setBusy('Preparing ' + doc.file_name);
    const { data, error } = await supabase.storage.from(BUCKET)
      .createSignedUrl(doc.file_path, 60);
    setBusy('');
    if (error) { setError(error.message); return; }
    const a = document.createElement('a');
    a.href = data.signedUrl; a.download = doc.file_name || 'document';
    a.target = '_blank'; a.click();
  }

  async function share(doc, recipient, message) {
    const { error } = await supabase.rpc('share_document', {
      p_id: doc.id, p_recipient: recipient, p_actor: email, p_message: message || ''
    });
    if (error) setError(error.message);
    else setBusy('Queued — it will send within a few minutes');
    setTimeout(() => setBusy(''), 4000);
    load();
  }

  /** Typing the number or dates by hand. Needed when Claude cannot read a
   *  scan, and for correcting it when it misreads one. */
  async function saveFields(doc, patch) {
    const { error } = await supabase.from('company_documents').update(patch).eq('id', doc.id);
    if (error) setError(error.message);
    else { setBusy('Saved'); setTimeout(() => setBusy(''), 1500); }
    load();
  }

  async function remove(doc, reason) {
    const { error } = await supabase.rpc('delete_document', {
      p_id: doc.id, p_actor: email, p_reason: reason
    });
    if (error) setError(error.message);
    setDeleting(null);
    load();
  }

  async function restore(doc) {
    const { error } = await supabase.rpc('restore_document', { p_id: doc.id, p_actor: email });
    if (error) setError(error.message);
    load();
  }

  if (!docs) return <p className="note-txt">Loading…</p>;

  const active = docs.filter(d => d.status === 'active');
  const history = docs.filter(d => d.status !== 'active');
  const expiring = active.filter(d => d.expiry_date &&
    (new Date(d.expiry_date) - new Date()) / 864e5 <= 30);
  const unread = active.filter(d => d.ai_status === 'pending').length;
  const detail = docs.find(d => d.id === openId);

  const shown = tab === 'history' ? history
    : tab === 'expiring' ? expiring
    : active;

  return (
    <>
      {error && <div className="err">{error}</div>}
      {busy && <div className="busy">{busy}</div>}

      <div className="stats">
        <Stat n={active.length} l="Documents" />
        <Stat n={expiring.length} l="Need renewing" c={expiring.length ? 'hot' : ''} />
        <Stat n={unread} l="Being read" c="calm" />
        <Stat n={history.length} l="Older versions" />
      </div>

      <Upload onUpload={upload} busy={busy} />

      <div className="toolbar">
        <div className="tabset">
          {[['all', 'Current', active.length],
            ['expiring', 'Expiring', expiring.length],
            ['history', 'History', history.length]].map(([k, l, n]) => (
            <button key={k} data-on={tab === k ? '1' : '0'} onClick={() => setTab(k)}>
              {l}{n ? ` · ${n}` : ''}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0
        ? <div className="empty">
            <b>{tab === 'history' ? 'No older versions yet' : 'Nothing here yet'}</b>
            <span>{tab === 'history'
              ? 'When you replace a document, the previous one moves here.'
              : 'Upload a trade licence or establishment card above. Claude reads it and fills in the expiry date on its own.'}</span>
          </div>
        : CATEGORIES.map(([key, name]) => {
            const group = shown.filter(d => d.category === key);
            if (!group.length) return null;
            return (
              <div key={key}>
                <div className="sec">{name} · {group.length}</div>
                <div className="grid">
                  {group.map(d => (
                    <DocCard key={d.id} d={d} onOpen={() => setOpenId(d.id)}
                      onDownload={() => download(d)}
                      onRestore={() => restore(d)} onReplace={() => setReplacing(d)} />
                  ))}
                </div>
              </div>
            );
          })}

      {deleting && (
        <ConfirmDelete doc={deleting} onCancel={() => setDeleting(null)}
          onConfirm={reason => remove(deleting, reason)} />
      )}

      {replacing && (
        <Replace doc={replacing} onCancel={() => setReplacing(null)}
          onPick={file => upload(file, replacing.category, replacing.title,
                                 replacing.entity, replacing.id)} />
      )}

      {detail && <Detail d={detail} events={events.filter(e => e.document_id === detail.id)}
                         onClose={() => setOpenId(null)} onShare={share}
                         onDownload={() => download(detail)} onSave={saveFields}
                         onDelete={() => { setOpenId(null); setDeleting(detail); }} />}
    </>
  );
}

/* ------------------------------------------------------------ pieces */
/** The fields Claude fills in, and you can override. Saving writes straight
 *  to the row, so a document whose scan cannot be read still gets reminders
 *  as long as someone types the expiry date. */
function Fields({ d, onSave }) {
  const [num, setNum] = useState(d.doc_number || '');
  const [issue, setIssue] = useState(d.issue_date || '');
  const [expiry, setExpiry] = useState(d.expiry_date || '');
  const [entity, setEntity] = useState(d.entity || '');

  const changed = num !== (d.doc_number || '') || issue !== (d.issue_date || '')
    || expiry !== (d.expiry_date || '') || entity !== (d.entity || '');

  return (
    <div className="fields">
      <div className="frow">
        <div>
          <label>Number</label>
          <input value={num} placeholder="CN-1234567" onChange={e => setNum(e.target.value)} />
        </div>
        <div>
          <label>Entity</label>
          <input value={entity} placeholder="Bayzat FZ-LLC"
            onChange={e => setEntity(e.target.value)} />
        </div>
      </div>
      <div className="frow">
        <div>
          <label>Issued</label>
          <input type="date" value={issue} onChange={e => setIssue(e.target.value)} />
        </div>
        <div>
          <label>Expires</label>
          <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
        </div>
      </div>
      <div className="frow" style={{ alignItems: 'center' }}>
        <span className="note-txt">
          {d.expiry_date
            ? 'Reminders start 30 days before this date.'
            : 'Add an expiry date and reminders start 30 days before it.'}
        </span>
        <button className="btn" disabled={!changed}
          onClick={() => onSave(d, {
            doc_number: num, entity,
            issue_date: issue || null, expiry_date: expiry || null
          })}>
          {changed ? 'Save changes' : 'Saved'}
        </button>
      </div>
    </div>
  );
}

const Stat = ({ n, l, c }) => (
  <div className={'stat' + (c ? ' ' + c : '')}><b>{n}</b><span>{l}</span></div>
);

function Upload({ onUpload }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('trade_license');
  const [title, setTitle] = useState('');
  const [entity, setEntity] = useState('');
  const ref = useRef(null);

  if (!open) return (
    <button className="btn" style={{ marginBottom: 24 }} onClick={() => setOpen(true)}>
      Add a document
    </button>
  );

  return (
    <div className="panelbox" style={{ marginBottom: 24 }}>
      <div className="uprow">
        <div style={{ minWidth: 170 }}>
          <label>Type</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label>Title</label>
          <input value={title} placeholder="Trade licence 2026"
            onChange={e => setTitle(e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label>Entity (optional)</label>
          <input value={entity} placeholder="Bayzat FZ-LLC"
            onChange={e => setEntity(e.target.value)} />
        </div>
      </div>
      <input ref={ref} type="file" style={{ display: 'none' }}
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) { onUpload(f, category, title, entity, null); setOpen(false); setTitle(''); }
          e.target.value = '';
        }} />
      <div style={{ display: 'flex', gap: 9, marginTop: 16, flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => ref.current?.click()}>Choose file and upload</button>
        <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
        <span className="note-txt" style={{ marginLeft: 'auto' }}>
          PDF or image · Claude reads the number and expiry within five minutes
        </span>
      </div>
    </div>
  );
}

function DocCard({ d, onOpen, onDownload, onRestore, onReplace }) {
  const left = d.status === 'deleted' && d.deleted_at
    ? 15 - Math.floor((Date.now() - new Date(d.deleted_at)) / 864e5) : null;
  const chip = d.status === 'deleted'
    ? { cls: 'red', text: left > 1 ? `Gone in ${left} days`
        : left === 1 ? 'Gone tomorrow' : 'Being removed' }
    : d.status === 'replaced' ? { cls: 'grey', text: 'Old version' }
    : expiryChip(d.expiry_date);

  return (
    <div className={'doccard ' + d.category + (d.status === 'deleted' ? ' deleted' : '')}>
      <div className="doc-top" onClick={onOpen}>
        <div className={'doc-ico ' + d.category}>
          {(d.mime_type || '').indexOf('pdf') > -1 ? 'PDF' : 'IMG'}
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="doc-name">
            {d.title}
            <span className="pc-ref">{d.ref}</span>
            {d.version > 1 && <span className="pc-ref">v{d.version}</span>}
          </div>
          <div className="doc-meta">
            {d.entity || 'no entity'}{d.doc_number ? ' · ' + d.doc_number : ''}
            {d.expiry_date ? ' · expires ' + pretty(d.expiry_date) : ''}
            {d.size_bytes ? ' · ' + size(d.size_bytes) : ''}
          </div>
          {d.status === 'deleted' && (
            <div className="binline">
              Deleted by {(d.deleted_by || 'someone').split('@')[0]} · kept for 15 days,
              then removed for good. Restore it any time before then.
            </div>
          )}
          {d.ai_status === 'pending' && <span className="chip grey">Being read…</span>}
          {d.ai_status === 'failed' &&
            <span className="chip amber">Could not be read — add the dates by hand</span>}
        </div>
        <span className={'chip ' + chip.cls}>{chip.text}</span>
      </div>
      <div className="doc-acts">
        <button className="mini" onClick={onDownload}>Download</button>
        <button className="mini" onClick={onOpen}>Share</button>
        {d.status === 'active' && <button className="mini" onClick={onReplace}>Replace</button>}
        {d.status === 'deleted' &&
          <button className="mini go" style={{ marginLeft: 'auto' }} onClick={onRestore}>
            Restore
          </button>}
      </div>
    </div>
  );
}

/** Deleting is reversible and always reported, so the dialog says so plainly
 *  rather than trying to frighten anyone out of it. A reason is required
 *  because the email is far more useful with one. */
function ConfirmDelete({ doc, onCancel, onConfirm }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const REASONS = [
    'Duplicate of another document',
    'Replaced outside the app',
    'Uploaded by mistake',
    'No longer needed',
    'Something else'
  ];
  const full = reason + (note.trim() ? ' — ' + note.trim() : '');

  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="panel confirm">
        <div className="confirm-head">
          <span className={'doc-ico ' + doc.category}>
            {(doc.mime_type || '').indexOf('pdf') > -1 ? 'PDF' : 'IMG'}
          </span>
          <div>
            <h2>Delete this document?</h2>
            <p>{doc.title} <span className="pc-ref">{doc.ref}</span></p>
          </div>
        </div>

        <ul className="confirm-facts">
          <li><b>It can be restored.</b> The file stays in storage and reappears under History.</li>
          <li><b>saravana@bayzat.com is told</b> who deleted it, when, and why.</li>
          <li><b>Expiry reminders stop</b> for this document once it is gone.</li>
        </ul>

        <label>Why are you deleting it?</label>
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
            {reason ? 'Delete document' : 'Pick a reason first'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Replace({ doc, onCancel, onPick }) {
  const ref = useRef(null);
  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="panel" style={{ maxWidth: 440 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>Replace {doc.title}</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink3)', margin: '10px 0 20px', lineHeight: 1.7 }}>
          The current file becomes version {doc.version} in History and the new one takes its
          place. saravana@bayzat.com is told. Claude reads the new file for its expiry date.
        </p>
        <input ref={ref} type="file" style={{ display: 'none' }}
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => ref.current?.click()}>Choose the new file</button>
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Detail({ d, events, onClose, onShare, onDownload, onSave, onDelete }) {
  const [to, setTo] = useState('');
  const [msg, setMsg] = useState('');
  const chip = expiryChip(d.expiry_date);

  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel">
        <div className="ph">
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600 }}>
              {d.title} <span className="pc-ref">{d.ref}</span>
            </h2>
            <div style={{ fontSize: 12.5, color: 'var(--ink3)', marginTop: 5 }}>
              {LABEL[d.category]}{d.entity ? ' · ' + d.entity : ''} · version {d.version}
            </div>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 8, margin: '16px 0 4px', flexWrap: 'wrap' }}>
          <span className={'chip ' + chip.cls}>{chip.text}</span>
          {d.ai_confidence &&
            <span className="chip grey">Read with {d.ai_confidence} confidence</span>}
        </div>

        {d.ai_summary && <p className="ai-note">{d.ai_summary}</p>}

        <Fields d={d} onSave={onSave} />

        <button className="btn" style={{ marginTop: 18 }} onClick={onDownload}>Download</button>

        <div className="sec">Share by email</div>
        <div className="cmt-row">
          <input type="email" value={to} placeholder="them@company.com"
            onChange={e => setTo(e.target.value)} />
          <input value={msg} placeholder="Optional note" onChange={e => setMsg(e.target.value)} />
          <button className="mini" disabled={!to.includes('@')}
            onClick={() => { onShare(d, to, msg); setTo(''); setMsg(''); }}>Send</button>
        </div>
        <p className="note-txt" style={{ marginTop: 9 }}>
          They get a link that works for seven days without signing in. You are copied on it.
        </p>

        {d.status === 'active' && (
          <>
            <div className="sec">Removing this document</div>
            <div className="danger-zone">
              <div>
                <b>Delete this document</b>
                <span>
                  Rarely needed. Kept for 15 days so it can be restored, then removed for good.
                  saravana@bayzat.com is told who deleted it and why, and the record of that
                  stays even after the file has gone.
                </span>
              </div>
              <button className="mini danger" onClick={onDelete}>Delete…</button>
            </div>
          </>
        )}

        <div className="sec">History</div>
        {events.length === 0
          ? <p className="note-txt">Nothing recorded yet.</p>
          : <div className="trail">
              {events.map(e => (
                <div key={e.id} className="tr">
                  <span className={'dot ' + (e.kind === 'delete' ? 'cmt' : 'done')} />
                  <span>
                    {e.detail || e.kind}
                    <span className="who"> · {(e.actor || 'someone').split('@')[0]}
                      {e.recipient ? ` → ${e.recipient}` : ''} · {String(e.created_at).slice(0, 10)}
                    </span>
                  </span>
                </div>
              ))}
            </div>}
      </div>
    </div>
  );
}
