'use client';
/* How the Offboarding tile talks about people, dates and progress. */

export const STATUS = {
  todo: 'To do', progress: 'In progress', done: 'Done',
  na: 'Not needed', blocked: 'Blocked'
};
export const ORDER = ['todo', 'progress', 'done', 'na', 'blocked'];

export const ASSET_LABEL = {
  bayzat: 'Bayzat owned', leasing: 'Leased',
  personal: 'Personal device', none: 'No device', '': 'Not recorded'
};

/* Why an offboarding stalls. Recorded on the step so the report can say
   whether we are waiting on the person, a courier, or ourselves. */
export const BLOCKERS = [
  'Employee has not returned the device',
  'Device with a courier or in transit',
  'Waiting on the manager',
  'Waiting on finance or EOS',
  'Access owned by another team',
  'Something else'
];

export const today = () => new Date().toISOString().slice(0, 10);

export const pretty = (iso) =>
  iso ? new Date(String(iso).slice(0, 10) + 'T00:00:00')
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const daysSince = (iso) => iso
  ? Math.round((new Date(today() + 'T00:00:00') - new Date(String(iso).slice(0, 10) + 'T00:00:00'))
      / 864e5) : null;

/** How a leaver reads at a glance: counting down before the last day,
 *  counting up after it, and louder the longer it drags. */
export function dayChip(lwd, status) {
  if (status === 'completed') return { cls: 'green', text: 'Completed' };
  if (status === 'cancelled') return { cls: 'grey', text: 'Cancelled' };
  const d = daysSince(lwd);
  if (d === null) return { cls: 'grey', text: 'No date' };
  if (d < -1) return { cls: 'grey', text: `Leaves in ${-d} days` };
  if (d === -1) return { cls: 'amber', text: 'Leaves tomorrow' };
  if (d === 0) return { cls: 'red', text: 'Last day today' };
  if (d <= 3) return { cls: 'amber', text: `${d} days past` };
  return { cls: 'red', text: `${d} days past` };
}

export const initials = (p) =>
  ((p.first_name || '?')[0] + (p.last_name || '')[0] || '').toUpperCase();

export const fullName = (p) =>
  [p.first_name, p.last_name].filter(Boolean).join(' ').trim();

/* ------------------------------------------------------------ guides
   What each step actually involves, and where the instructions live.
   Put your own links in here — the wipe video, the handover form, the
   Drata runbook — and they appear on the step where they are needed
   rather than in a folder nobody opens.

   EVIDENCE lists the steps that will not close without something
   attached. It must match evidence_required_steps() in the schema. */

export const EVIDENCE_REQUIRED = [5, 6];

export const GUIDES = {
  1: { hint: 'Suspend the account, transfer Drive ownership, set a forwarding rule.' },
  2: { hint: 'Deactivate the member, not delete — their history stays searchable.' },
  3: { hint: 'Remove platform access and any admin roles they held.' },
  4: { hint: 'Offboard in Drata and revoke the VPN profile.' },
  5: {
    hint: 'Collect the device, check the condition, and get the handover form signed.',
    link: '',                      // ← your asset collection form
    linkLabel: 'Open the handover form',
    evidence: 'A photo or scan of the signed form, or the confirmation email.'
  },
  6: {
    hint: 'Wipe the machine following the standard procedure.',
    link: '',                      // ← your laptop erase video
    linkLabel: 'Watch the erase procedure',
    evidence: 'A photo of the finished wipe screen, or a note of the method and date.'
  },
  7: { hint: 'Final settlement with finance. Often the last thing to clear.' }
};

/** The IT Asset Collection Form, built from what the system already knows.
 *  Prints to one or two A4 pages. The verification checklist fills itself in
 *  from the actual step statuses, so it cannot disagree with the record —
 *  which is the whole point of generating it rather than typing it again. */
export function receiptHtml(l, steps, actor) {
  const esc = (v) => String(v ?? '').replace(/[&<>]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const val = (v) => v ? esc(v) : '<i>&mdash;</i>';

  /* the checklist maps onto the real steps; anything we have no step for is
     left blank for whoever is holding the pen */
  const byPos = Object.fromEntries((steps || []).map(s => [s.position, s]));
  const mark = (s) => !s ? '☐ &nbsp;Pending'
    : s.status === 'done' ? '☑ &nbsp;Completed'
    : s.status === 'na' ? '&ndash; &nbsp;Not applicable'
    : s.status === 'blocked' ? '☐ &nbsp;Blocked'
    : '☐ &nbsp;Pending';

  const checklist = [
    ['Device received by IT', byPos[5]],
    ['Device matched with asset inventory', null],
    ['User account disabled', byPos[3]],
    ['Google Workspace suspended or deprovisioned', byPos[1]],
    ['MFA revoked', byPos[4]],
    ['VPN access removed', byPos[4]],
    ['Slack access removed', byPos[2]],
    ['Other application access removed', byPos[3]],
    ['Device wiped or reset', byPos[6]],
    ['Returned to leasing vendor',
      l.asset_type === 'leasing' ? byPos[5] : { status: 'na' }]
  ];

  const row = (k, v) => `<tr><th>${k}</th><td>${val(v)}</td></tr>`;
  const line = (label, status) =>
    `<tr><td>${label}</td><td class="st">${status}</td></tr>`;
  const blank = (label, options) =>
    `<tr><td>${label}</td><td class="st opt">${options}</td></tr>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>IT Asset Collection Form — ${esc(fullName(l))}</title>
<style>
  @page { size: A4; margin: 16mm 15mm; }
  *{box-sizing:border-box}
  body{font:400 10.5pt/1.55 -apple-system,"Segoe UI",system-ui,sans-serif;
       color:#1a1a1a;margin:0;padding:0}
  .sheet{max-width:186mm;margin:0 auto}

  header{display:flex;align-items:flex-start;gap:14px;padding-bottom:14px;
         border-bottom:2px solid #1a1a1a;margin-bottom:22px}
  .mark{width:34px;height:34px;border-radius:6px;background:#B14A2E;color:#fff;
        display:flex;align-items:center;justify-content:center;
        font-weight:700;font-size:15pt;flex:none}
  header h1{font-size:15pt;font-weight:600;margin:0;letter-spacing:-.2px}
  header .sub{font-size:9pt;color:#6b6b6b;margin-top:3px}
  header .ref{margin-left:auto;text-align:right;font-size:9pt;color:#6b6b6b}
  header .ref b{display:block;font-size:11pt;color:#1a1a1a;letter-spacing:.5px}

  h2{font-size:10pt;font-weight:600;text-transform:uppercase;letter-spacing:.8px;
     color:#B14A2E;margin:22px 0 9px;padding-bottom:5px;border-bottom:1px solid #e0dcd4}
  h2:first-of-type{margin-top:0}

  table{width:100%;border-collapse:collapse;margin-bottom:4px}
  th,td{text-align:left;vertical-align:top;padding:6px 8px;font-size:10pt;
        border-bottom:1px solid #ebe7e0}
  th{font-weight:400;color:#6b6b6b;width:36%}
  td i{color:#b0aca4;font-style:normal}
  td.st{width:44%;font-size:9.5pt}
  td.st.opt{color:#6b6b6b}
  table.grid th{background:#faf8f5;font-weight:600;color:#1a1a1a;width:auto;
                border-bottom:1px solid #d8d3ca}
  table.grid td{font-size:10pt}

  .fill{display:inline-block;min-width:150px;border-bottom:1px solid #9a9a9a;
        height:1.1em;vertical-align:baseline}
  .remarks{border:1px solid #e0dcd4;border-radius:4px;padding:11px 13px;
           min-height:52px;font-size:9.5pt;color:#3a3a3a;line-height:1.7}

  .ack{margin-top:8px;font-size:9.5pt;color:#3a3a3a;line-height:1.7}
  .signs{display:flex;gap:34px;margin-top:34px}
  .signs div{flex:1}
  .signs .rule{border-top:1px solid #1a1a1a;margin-bottom:6px;height:34px}
  .signs small{font-size:8.5pt;color:#6b6b6b;display:block;line-height:1.6}
  footer{margin-top:30px;padding-top:10px;border-top:1px solid #ebe7e0;
         font-size:8pt;color:#9a9a9a;display:flex;justify-content:space-between}

  section{break-inside:avoid;page-break-inside:avoid}
  @media print{ .noprint{display:none} body{-webkit-print-color-adjust:exact;
                print-color-adjust:exact} }
  .noprint{position:fixed;top:12px;right:12px;display:flex;gap:8px}
  .noprint button{font:500 12px system-ui;padding:8px 15px;border-radius:5px;
                  border:1px solid #d8d3ca;background:#fff;cursor:pointer}
  .noprint button.p{background:#B14A2E;border-color:#B14A2E;color:#fff}
</style></head><body>

<div class="noprint">
  <button onclick="window.close()">Close</button>
  <button class="p" onclick="window.print()">Print or save as PDF</button>
</div>

<div class="sheet">
  <header>
    <div class="mark">B</div>
    <div>
      <h1>IT Asset Collection Form</h1>
      <div class="sub">Bayzat &middot; Information Technology</div>
    </div>
    <div class="ref"><b>${esc(l.ref)}</b>Generated ${pretty(today())}</div>
  </header>

  <section>
    <h2>Employee information</h2>
    <table>
      ${row('Employee name', fullName(l))}
      ${row('Employee ID', l.employee_id)}
      ${row('Department', l.department)}
      ${row('Designation', l.title)}
      ${row('Email address', l.work_email)}
      ${row('Telephone', l.mobile_no)}
      ${row('Last working day', pretty(l.last_working_day))}
      ${row('Collection date', pretty(today()))}
    </table>
  </section>

  <section>
    <h2>Asset details</h2>
    <table class="grid">
      <tr><th>Asset type</th><th>Asset tag</th><th>Make &amp; model</th><th>Serial number</th></tr>
      <tr>
        <td>${l.asset_type ? esc(ASSET_LABEL[l.asset_type]) : '<i>&mdash;</i>'}</td>
        <td><span class="fill"></span></td>
        <td><span class="fill"></span></td>
        <td><b>${l.asset_serial ? esc(l.asset_serial) : '<span class="fill"></span>'}</b></td>
      </tr>
    </table>
  </section>

  <section>
    <h2>Asset condition</h2>
    <table>
      ${blank('Physical condition', 'Good &nbsp;/&nbsp; Fair &nbsp;/&nbsp; Damaged')}
      ${blank('Device powers on', 'Yes &nbsp;/&nbsp; No')}
      ${blank('Screen condition', 'Good &nbsp;/&nbsp; Marked &nbsp;/&nbsp; Cracked')}
      ${blank('Keyboard and trackpad working', 'Yes &nbsp;/&nbsp; No')}
      ${blank('Charger returned', 'Yes &nbsp;/&nbsp; No &nbsp;/&nbsp; N/A')}
      ${blank('Accessories returned', 'Bag &nbsp;/&nbsp; Mouse &nbsp;/&nbsp; Card &nbsp;/&nbsp; None')}
    </table>
    <p style="font-size:9pt;color:#6b6b6b;margin:9px 0 5px">Damage notes</p>
    <div class="remarks"></div>
  </section>

  <section>
    <h2>IT verification checklist</h2>
    <table>
      ${checklist.map(([label, st]) => line(label, mark(st))).join('')}
    </table>
  </section>

  <section>
    <h2>Remarks</h2>
    <div class="remarks">${l.notes ? esc(l.notes) : ''}</div>
  </section>

  <section>
    <h2>Acknowledgement</h2>
    <p class="ack">
      I confirm that the company assets listed above have been returned, and that I retain
      no company property, data or access.
    </p>
    <div class="signs">
      <div>
        <div class="rule"></div>
        <small><b>${esc(fullName(l))}</b><br>Employee signature and date</small>
      </div>
      <div>
        <div class="rule"></div>
        <small><b>${esc((actor || '').split('@')[0] || 'IT representative')}</b><br>
          Received and verified by, and date</small>
      </div>
    </div>
  </section>

  <footer>
    <span>${esc(l.ref)} &middot; ${esc(fullName(l))}</span>
    <span>Bayzat IT &middot; ${pretty(today())}</span>
  </footer>
</div>
</body></html>`;
}
