'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../common/shared';
import { ASSET_LABEL, fullName, pretty, today } from './shared';

/* The asset collection form. Filled in here, not printed blank — what is
   typed is the record, and printing is only a view of it. */

const CONDITION = {
  physical:    ['Good', 'Fair', 'Damaged'],
  powers_on:   ['Yes', 'No'],
  screen:      ['Good', 'Marked', 'Cracked'],
  keyboard:    ['Working', 'Faulty'],
  charger:     ['Returned', 'Not returned', 'Not applicable'],
  accessories: ['Bag', 'Mouse', 'Access card', 'None']
};

const DEVICE_TYPES = [
  ['bayzat',   'Bayzat owned'],
  ['leasing',  'Leased'],
  ['personal', 'Personal device'],
  ['none',     'No device']
];

const METHODS = [
  ['in_person',    'Handed over in person'],
  ['courier',      'Sent by courier'],
  ['post',         'Sent by post'],
  ['not_returned', 'Not returned']
];

export default function Handover({ leaver, actor, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [warn, setWarn] = useState('');
  const [shareTo, setShareTo] = useState(leaver.work_email || '');
  const [shareNote, setShareNote] = useState('');
  const [sharing, setSharing] = useState(false);
  const [serialOnRecord, setSerialOnRecord] = useState(leaver.asset_serial || '');
  const [deviceType, setDeviceType] = useState(leaver.asset_type || '');
  const [fromEmployee, setFromEmployee] = useState(false);

  // The leaver row is a snapshot taken when the offboarding started, so a
  // device recorded on the employee afterwards is not in it. Fall back to
  // the live employee record rather than showing an empty form.
  useEffect(() => {
    if (leaver.asset_serial || leaver.asset_type || !leaver.employee_id) return;
    supabase.from('employees')
      .select('asset_type, asset_serial').eq('id', leaver.employee_id).maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (data.asset_type && !deviceType) setDeviceType(data.asset_type);
        if (data.asset_serial && !serialOnRecord) setSerialOnRecord(data.asset_serial);
        if (data.asset_type || data.asset_serial) setFromEmployee(true);
      });
  }, [leaver.id]);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const blank = {
      collection_date: today(), collected_by: (actor || '').split('@')[0],
      method: 'in_person', serial_seen: ''
    };
    supabase.from('leaver_handover').select('*').eq('leaver_id', leaver.id).maybeSingle()
      .then(({ data, error }) => {
        // never leave the form stuck loading — open it blank and say what went
        // wrong, rather than a button that appears to do nothing
        if (error) setMsg('Could not load a saved form: ' + error.message);
        setForm(data || blank);
      })
      .catch(err => { setMsg('Could not load a saved form: ' + err.message); setForm(blank); });
  }, [leaver.id, actor]);

  if (!form) return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel form"><p className="note-txt">Opening the form…</p></div>
    </div>
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function save(quiet) {
    setBusy(true);

    // if the device was never recorded, this is the moment we learn it —
    // write it back to the leaver and to their employee record
    if ((serialOnRecord && serialOnRecord !== (leaver.asset_serial || '')) ||
        (deviceType && deviceType !== (leaver.asset_type || ''))) {
      await supabase.rpc('set_leaver_asset', {
        p_leaver_id: leaver.id, p_serial: serialOnRecord.trim(),
        p_type: deviceType, p_actor: actor });
      if (deviceType && !['personal', 'none'].includes(deviceType)) {
        await supabase.rpc('reopen_device_steps', { p_leaver_id: leaver.id });
      }
    }

    const { data, error } = await supabase.rpc('save_handover', {
      p_leaver_id: leaver.id, p_form: form, p_actor: actor });
    setBusy(false);
    if (error) { setMsg(error.message); return false; }
    setWarn(data?.serial_mismatch
      ? `The serial you entered (${data.seen}) does not match the one on record (${data.expected}). `
        + `Either the wrong device came back, or the record was wrong to begin with — worth `
        + `settling before this is closed.`
      : '');
    if (!quiet) { setMsg('Saved'); setTimeout(() => setMsg(''), 1800); }
    onSaved?.();
    return true;
  }

  async function sign(who, dataUrl, name) {
    const { data, error } = await supabase.rpc('sign_handover', {
      p_leaver_id: leaver.id, p_who: who, p_signature: dataUrl,
      p_name: name, p_actor: actor });
    if (error) { setMsg(error.message); return; }
    if (data && data.ok === false) { setMsg(data.reason); return; }
    setMsg('Signed'); setTimeout(() => setMsg(''), 1800);
    // reload so the printed copy carries it
    const { data: fresh } = await supabase.from('leaver_handover')
      .select('*').eq('leaver_id', leaver.id).maybeSingle();
    if (fresh) setForm(fresh);
    onSaved?.();
  }

  async function share() {
    if (!(await save(true))) return;
    const { data, error } = await supabase.rpc('share_handover', {
      p_leaver_id: leaver.id, p_email: shareTo, p_note: shareNote, p_actor: actor });
    if (error) { setMsg(error.message); return; }
    if (data && data.ok === false) { setMsg(data.reason); return; }
    setSharing(false); setMsg('Queued — it will send within a few minutes');
    setTimeout(() => setMsg(''), 3500);
    onSaved?.();
  }

  function print() {
    const w = window.open('', '_blank');
    w.document.write(printable(
      { ...leaver, asset_serial: serialOnRecord || leaver.asset_serial,
        asset_type: deviceType || leaver.asset_type },
      form, leaver.steps, actor));
    w.document.close();
  }

  return (
    <div className="veil" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="panel form">
        <div className="formhead">
          <div>
            <h2>Asset collection form</h2>
            <p>{fullName(leaver)} · {leaver.ref} · last day {pretty(leaver.last_working_day)}</p>
          </div>
          <button className="x" onClick={onClose}>✕</button>
        </div>

        {msg && <div className="busy">{msg}</div>}
        {warn && <div className="err">{warn}</div>}

        <div className="fsec s-blue">
          <h3>How it came back</h3>
          <div className="fgrid">
            <Field label="Collection date">
              <input type="date" value={form.collection_date || ''}
                onChange={e => set('collection_date', e.target.value)} />
            </Field>
            <Field label="Collected by">
              <input value={form.collected_by || ''}
                onChange={e => set('collected_by', e.target.value)} />
            </Field>
          </div>
          <Field label="How">
            <div className="pills">
              {METHODS.map(([v, l]) => (
                <button key={v} className="pill" data-on={form.method === v ? '1' : '0'}
                  onClick={() => set('method', v)}>{l}</button>
              ))}
            </div>
          </Field>
        </div>

        <div className="fsec s-amber">
          <h3>The device</h3>
          {fromEmployee ? (
            <p className="fnotice ok">
              Taken from their employee record — the offboarding was started before this was
              filled in. Saving copies it onto the offboarding so the form and the record agree.
            </p>
          ) : !leaver.asset_serial && !deviceType ? (
            <p className="fnotice">
              No device is recorded against this person, here or on their employee record.
              Fill it in and it is saved to both, so the gap closes rather than travelling
              with them.
            </p>
          ) : null}

          <Field label="Device type">
            <div className="pills">
              {DEVICE_TYPES.map(([v, l]) => (
                <button key={v} className="pill" data-on={deviceType === v ? '1' : '0'}
                  onClick={() => setDeviceType(v)}>{l}</button>
              ))}
            </div>
          </Field>

          <div className="fgrid">
            <Field label="Serial on record"
              hint={leaver.asset_serial
                ? 'What we had on file for them'
                : 'Nothing on file — type it in and we will save it'}>
              <input value={serialOnRecord} placeholder="Not recorded"
                onChange={e => setSerialOnRecord(e.target.value)} />
            </Field>
            <Field label="Serial on the machine"
              hint="Read it off the device — this is what catches the wrong laptop coming back">
              <input value={form.serial_seen || ''} placeholder="Type what you see"
                onChange={e => set('serial_seen', e.target.value)} />
            </Field>
            <Field label="Asset tag">
              <input value={form.asset_tag || ''} onChange={e => set('asset_tag', e.target.value)} />
            </Field>
            <Field label="Make and model">
              <input value={form.make_model || ''} placeholder="MacBook Pro 14, 2023"
                onChange={e => set('make_model', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="fsec s-green">
          <h3>Condition</h3>
          {Object.entries(CONDITION).map(([k, options]) => (
            <Field key={k} label={k.replace('_', ' ').replace(/^./, c => c.toUpperCase())}>
              <div className="pills">
                {options.map(o => (
                  <button key={o} className="pill" data-on={form[k] === o ? '1' : '0'}
                    onClick={() => set(k, form[k] === o ? '' : o)}>{o}</button>
                ))}
              </div>
            </Field>
          ))}
          <Field label="Damage notes">
            <textarea rows="2" value={form.damage_notes || ''}
              placeholder="Anything worth recording about its state"
              onChange={e => set('damage_notes', e.target.value)} />
          </Field>
        </div>

        <div className="fsec s-violet">
          <h3>Remarks</h3>
          <textarea rows="2" value={form.remarks || ''}
            placeholder="Anything else about the collection"
            onChange={e => set('remarks', e.target.value)} />
        </div>

        <div className="fsec s-ink">
          <h3>Signatures</h3>
          <p className="fhint" style={{ marginBottom: 14 }}>
            Sign on screen — a finger on a phone, a mouse on a laptop. What is drawn is
            printed on the form, so nothing needs scanning back in. If they have already
            left, send them the form instead and keep their reply as evidence.
          </p>
          <div className="fgrid">
            <SignaturePad title="Employee" who="employee"
              existing={form.employee_signature} existingName={form.employee_signed_name}
              existingAt={form.employee_signed_at} defaultName={fullName(leaver)}
              onSign={sign} />
            <SignaturePad title="Received by (IT)" who="it"
              existing={form.it_signature} existingName={form.it_signed_name}
              existingAt={form.it_signed_at}
              defaultName={form.collected_by || (actor || '').split('@')[0]}
              onSign={sign} />
          </div>
        </div>

        {sharing ? (
          <div className="fsec s-rose">
            <h3>Send it to them</h3>
            <p className="fhint">
              For when the device is coming back by post, or they have already left. They get
              the form as an email and a PDF, with what we know filled in, and are asked to
              reply confirming. You are copied on it. Keep their reply as evidence on the
              collection step and the record is complete without anyone signing paper.
            </p>
            <div className="fgrid">
              <Field label="Send to">
                <input type="email" value={shareTo} onChange={e => setShareTo(e.target.value)} />
              </Field>
              <Field label="Note to include">
                <input value={shareNote} placeholder="Optional"
                  onChange={e => setShareNote(e.target.value)} />
              </Field>
            </div>
            <div className="formacts">
              <button className="btn ghost" onClick={() => setSharing(false)}>Back</button>
              <button className="btn" disabled={!shareTo.includes('@')} onClick={share}>
                Send the form
              </button>
            </div>
          </div>
        ) : (
          <div className="formacts">
            <button className="btn ghost" onClick={onClose}>Close</button>
            <button className="btn ghost" onClick={() => setSharing(true)}>Send to them…</button>
            <button className="btn ghost" onClick={print}>Print or PDF</button>
            <button className="btn" disabled={busy} onClick={() => save(false)}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}

        {form.shared_at && (
          <p className="note-txt" style={{ marginTop: 12 }}>
            Sent to {form.shared_to} on {pretty(String(form.shared_at).slice(0, 10))}
            {form.share_sent ? '' : ' — waiting to go out'}
          </p>
        )}
      </div>
    </div>
  );
}

/** A signature pad. Draw with a finger, a stylus or a mouse; what is drawn
 *  is stored as an image with the form and printed on it, so nothing has to
 *  be scanned back in. */
function SignaturePad({ title, who, existing, existingName, existingAt,
                        defaultName, onSign, onClear }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [touched, setTouched] = useState(false);
  const [name, setName] = useState(defaultName || '');

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    // draw at device resolution so it is not blurry on a phone
    const ratio = window.devicePixelRatio || 1;
    const w = c.offsetWidth, h = c.offsetHeight;
    c.width = w * ratio; c.height = h * ratio;
    const ctx = c.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1F1B16';
    if (existing) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, w, h);
      img.src = existing;
      setTouched(true);
    }
  }, [existing]);

  function pos(e) {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function start(e) {
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = pos(e);
    ctx.beginPath(); ctx.moveTo(x, y);
    setDrawing(true); setTouched(true);
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = pos(e);
    ctx.lineTo(x, y); ctx.stroke();
  }
  function end() { setDrawing(false); }

  function clear() {
    const c = canvasRef.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    setTouched(false);
    onClear?.();
  }

  const signed = !!existingAt;

  return (
    <div className="sigbox">
      <div className="sighead">
        <span className="sigtitle">{title}</span>
        {signed && <span className="chip green">Signed {pretty(String(existingAt).slice(0, 10))}</span>}
      </div>

      <canvas ref={canvasRef} className="sigpad"
        onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerLeave={end} />

      <div className="sigrow">
        <input value={name} placeholder="Full name"
          onChange={e => setName(e.target.value)} />
        <button className="mini" onClick={clear}>Clear</button>
        <button className="mini go" disabled={!touched || !name.trim()}
          onClick={() => onSign(who, canvasRef.current.toDataURL('image/png'), name.trim())}>
          {signed ? 'Sign again' : 'Sign'}
        </button>
      </div>
      {signed && existingName && (
        <p className="fhint">Signed by {existingName}</p>
      )}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="ffield">
      <label>{label}</label>
      {children}
      {hint && <span className="fhint">{hint}</span>}
    </div>
  );
}

/* ---------------------------------------------------------- printing */
export function printable(l, f, steps, actor) {
  const esc = v => String(v ?? '').replace(/[&<>]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const val = v => v ? esc(v) : '<i>&mdash;</i>';
  const row = (k, v) => `<tr><th>${k}</th><td>${val(v)}</td></tr>`;
  const method = ({ in_person: 'Handed over in person', courier: 'Sent by courier',
                    post: 'Sent by post', not_returned: 'Not returned' })[f.method] || '';

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Asset collection — ${esc(fullName(l))}</title>
<style>
  @page{size:A4;margin:15mm 14mm}
  *{box-sizing:border-box}
  body{font:400 10.5pt/1.5 -apple-system,"Segoe UI",system-ui,sans-serif;color:#1f1b16;margin:0}
  .sheet{max-width:186mm;margin:0 auto}
  header{display:flex;align-items:center;gap:13px;padding-bottom:13px;
         border-bottom:2.5px solid #b14a2e;margin-bottom:20px}
  .mk{width:34px;height:34px;border-radius:6px;background:#b14a2e;color:#fff;
      display:flex;align-items:center;justify-content:center;font:700 15pt system-ui}
  h1{font-size:15pt;font-weight:600;margin:0}
  .sub{font-size:9pt;color:#8f8779;margin-top:2px}
  .ref{margin-left:auto;text-align:right;font-size:8.5pt;color:#8f8779}
  .ref b{display:block;font-size:11pt;color:#1f1b16;letter-spacing:.4px}
  h2{font-size:9pt;font-weight:600;text-transform:uppercase;letter-spacing:.9px;
     margin:20px 0 8px;padding:5px 9px;border-radius:4px;display:inline-block}
  .c1{background:#e7f0ef;color:#1f5f5b} .c2{background:#faede7;color:#b14a2e}
  .c3{background:#eff3e7;color:#4a6b22} .c4{background:#f4ebf2;color:#6b2d5c}
  table{width:100%;border-collapse:collapse;margin-bottom:2px}
  th,td{text-align:left;padding:5.5px 8px;font-size:10pt;border-bottom:1px solid #efeae1;
        vertical-align:top}
  th{font-weight:400;color:#8f8779;width:36%}
  td i{color:#c3bdb2;font-style:normal}
  .grid th{background:#faf8f5;font-weight:600;color:#1f1b16;width:auto}
  .grid td b{font-size:10.5pt}
  .flag{background:#faeaea;color:#9b2c36;padding:8px 11px;border-radius:4px;
        font-size:9.5pt;margin:8px 0}
  .box{border:1px solid #e6dfd3;border-radius:4px;padding:10px 12px;min-height:40px;
       font-size:9.5pt;color:#3a3a3a;line-height:1.6;white-space:pre-wrap}
  .ack{font-size:9.5pt;color:#3a3a3a;line-height:1.7;margin-top:6px}
  .signs{display:flex;gap:32px;margin-top:32px}
  .signs div{flex:1}.signs .rule{height:44px}
  .signs .sig{display:block;height:46px;object-fit:contain;object-position:left bottom;
              max-width:100%}
  .signs .sigline{border-top:1px solid #1f1b16;margin-bottom:5px}
  .signs small{font-size:8.5pt;color:#8f8779;line-height:1.5;display:block}
  footer{margin-top:26px;padding-top:9px;border-top:1px solid #efeae1;font-size:8pt;
         color:#b0aca4;display:flex;justify-content:space-between}
  section{break-inside:avoid;page-break-inside:avoid}
  .np{position:fixed;top:12px;right:12px;display:flex;gap:8px}
  .np button{font:500 12px system-ui;padding:8px 15px;border-radius:5px;
             border:1px solid #e6dfd3;background:#fff;cursor:pointer}
  .np button.p{background:#b14a2e;border-color:#b14a2e;color:#fff}
  @media print{.np{display:none}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="np"><button onclick="window.close()">Close</button>
<button class="p" onclick="window.print()">Print or save as PDF</button></div>
<div class="sheet">
  <header>
    <div class="mk">B</div>
    <div><h1>IT Asset Collection Form</h1>
      <div class="sub">Bayzat &middot; Information Technology</div></div>
    <div class="ref"><b>${esc(l.ref)}</b>${pretty(today())}</div>
  </header>

  <section><h2 class="c1">Employee</h2>
    <table>
      ${row('Name', fullName(l))}
      ${row('Department', l.department)}
      ${row('Designation', l.title)}
      ${row('Email', l.work_email)}
      ${row('Last working day', pretty(l.last_working_day))}
      ${row('Collection date', pretty(f.collection_date))}
      ${row('Collected by', f.collected_by)}
      ${row('How it came back', method)}
    </table>
  </section>

  <section><h2 class="c2">The device</h2>
    <table class="grid">
      <tr><th>Type</th><th>Asset tag</th><th>Make and model</th><th>Serial</th></tr>
      <tr><td>${val(ASSET_LABEL[l.asset_type])}</td><td>${val(f.asset_tag)}</td>
        <td>${val(f.make_model)}</td><td><b>${val(f.serial_seen || l.asset_serial)}</b></td></tr>
    </table>
    ${f.serial_seen && l.asset_serial &&
      f.serial_seen.toUpperCase().replace(/\s/g, '') !== l.asset_serial.toUpperCase().replace(/\s/g, '')
      ? `<div class="flag"><b>Serial does not match.</b> Expected ${esc(l.asset_serial)},
         received ${esc(f.serial_seen)}.</div>` : ''}
  </section>

  <section><h2 class="c3">Condition</h2>
    <table>
      ${row('Physical condition', f.physical)}
      ${row('Powers on', f.powers_on)}
      ${row('Screen', f.screen)}
      ${row('Keyboard and trackpad', f.keyboard)}
      ${row('Charger', f.charger)}
      ${row('Accessories', f.accessories)}
    </table>
    ${f.damage_notes ? `<div class="box" style="margin-top:9px">${esc(f.damage_notes)}</div>` : ''}
  </section>

  ${f.remarks ? `<section><h2 class="c1">Remarks</h2>
    <div class="box">${esc(f.remarks)}</div></section>` : ''}

  <section><h2 class="c2">Acknowledgement</h2>
    <p class="ack">I confirm that the company assets listed above have been returned, and that
      I retain no company property, data or access.</p>
    <div class="signs">
      <div>
        ${f.employee_signature
          ? `<img src="${f.employee_signature}" alt="" class="sig">`
          : '<div class="rule"></div>'}
        <div class="sigline"></div>
        <small><b>${esc(f.employee_signed_name || fullName(l))}</b><br>
          ${f.employee_signed_at
            ? 'Signed ' + pretty(String(f.employee_signed_at).slice(0, 10))
            : 'Employee signature and date'}</small>
      </div>
      <div>
        ${f.it_signature
          ? `<img src="${f.it_signature}" alt="" class="sig">`
          : '<div class="rule"></div>'}
        <div class="sigline"></div>
        <small><b>${esc(f.it_signed_name || f.collected_by ||
          (actor || '').split('@')[0])}</b><br>
          ${f.it_signed_at
            ? 'Received and verified ' + pretty(String(f.it_signed_at).slice(0, 10))
            : 'Received and verified by, and date'}</small>
      </div>
    </div>
  </section>

  <footer><span>${esc(l.ref)} &middot; ${esc(fullName(l))}</span>
    <span>Bayzat IT &middot; ${pretty(today())}</span></footer>
</div></body></html>`;
}
