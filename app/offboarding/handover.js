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

  useEffect(() => {
    supabase.from('leaver_handover').select('*').eq('leaver_id', leaver.id).maybeSingle()
      .then(({ data }) => setForm(data || {
        collection_date: today(), collected_by: (actor || '').split('@')[0],
        method: 'in_person', serial_seen: ''
      }));
  }, [leaver.id, actor]);

  if (!form) return null;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function save(quiet) {
    setBusy(true);
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
    w.document.write(printable(leaver, form, leaver.steps, actor));
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
          <div className="fgrid">
            <Field label="Serial on record">
              <input value={leaver.asset_serial || 'none recorded'} disabled />
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

        {sharing ? (
          <div className="fsec s-rose">
            <h3>Send it to them</h3>
            <p className="fhint">
              For when the device is coming back by post, or they have already left. They get the
              form with what we know filled in, and are asked to reply confirming. Keep their
              reply as evidence on the collection step.
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
  const byPos = Object.fromEntries((steps || []).map(s => [s.position, s]));
  const mark = s => !s ? '<span class="pend">Pending</span>'
    : s.status === 'done' ? '<span class="done">Completed</span>'
    : s.status === 'na' ? '<span class="na">Not applicable</span>'
    : s.status === 'blocked' ? '<span class="blk">Blocked</span>'
    : '<span class="pend">Pending</span>';
  const row = (k, v) => `<tr><th>${k}</th><td>${val(v)}</td></tr>`;
  const method = ({ in_person: 'Handed over in person', courier: 'Sent by courier',
                    post: 'Sent by post', not_returned: 'Not returned' })[f.method] || '';

  const checks = [
    ['Device received by IT', byPos[5]],
    ['Serial matched against the record',
      f.serial_seen && l.asset_serial
        ? { status: f.serial_seen.toUpperCase().replace(/\s/g, '')
            === l.asset_serial.toUpperCase().replace(/\s/g, '') ? 'done' : 'blocked' } : null],
    ['Google Workspace suspended', byPos[1]],
    ['Slack access removed', byPos[2]],
    ['Bayzat Platform access removed', byPos[3]],
    ['Drata and VPN removed', byPos[4]],
    ['Device wiped or reset', byPos[6]],
    ['Returned to leasing vendor', l.asset_type === 'leasing' ? byPos[5] : { status: 'na' }],
    ['End of service settled', byPos[7]]
  ];

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
  .done{color:#3f6b3a;font-weight:600} .pend{color:#8f8779}
  .na{color:#b0aca4} .blk{color:#9b2c36;font-weight:600}
  .box{border:1px solid #e6dfd3;border-radius:4px;padding:10px 12px;min-height:40px;
       font-size:9.5pt;color:#3a3a3a;line-height:1.6;white-space:pre-wrap}
  .ack{font-size:9.5pt;color:#3a3a3a;line-height:1.7;margin-top:6px}
  .signs{display:flex;gap:32px;margin-top:32px}
  .signs div{flex:1}.signs .rule{border-top:1px solid #1f1b16;margin-bottom:5px;height:32px}
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

  <section><h2 class="c4">IT verification</h2>
    <table>${checks.map(([label, s]) =>
      `<tr><td>${label}</td><td style="width:38%">${mark(s)}</td></tr>`).join('')}</table>
  </section>

  ${f.remarks ? `<section><h2 class="c1">Remarks</h2>
    <div class="box">${esc(f.remarks)}</div></section>` : ''}

  <section><h2 class="c2">Acknowledgement</h2>
    <p class="ack">I confirm that the company assets listed above have been returned, and that
      I retain no company property, data or access.</p>
    <div class="signs">
      <div><div class="rule"></div><small><b>${esc(fullName(l))}</b><br>
        Employee signature and date</small></div>
      <div><div class="rule"></div><small><b>${esc(f.collected_by ||
        (actor || '').split('@')[0])}</b><br>Received and verified by, and date</small></div>
    </div>
  </section>

  <footer><span>${esc(l.ref)} &middot; ${esc(fullName(l))}</span>
    <span>Bayzat IT &middot; ${pretty(today())}</span></footer>
</div></body></html>`;
}
