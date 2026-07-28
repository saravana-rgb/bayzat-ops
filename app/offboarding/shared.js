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

/** The handover receipt, generated from what we already know. Printed,
 *  signed, and scanned back in as evidence — which is what makes the
 *  collection provable rather than remembered. */
export function receiptHtml(l) {
  const row = (k, v) => `<tr><td>${k}</td><td><b>${v || '—'}</b></td></tr>`;
  return `<!doctype html><html><head><meta charset="utf-8">
<title>Device handover — ${fullName(l)}</title>
<style>
  body{font:400 13px/1.7 -apple-system,system-ui,sans-serif;color:#1F1B16;
       max-width:640px;margin:40px auto;padding:0 24px}
  h1{font-size:20px;font-weight:600;margin:0 0 4px}
  .sub{color:#8F8779;font-size:12.5px;margin-bottom:28px}
  table{border-collapse:collapse;width:100%;margin-bottom:28px}
  td{padding:9px 0;border-bottom:1px solid #E6DFD3;vertical-align:top}
  td:first-child{color:#8F8779;width:190px}
  .box{border:1px solid #E6DFD3;border-radius:5px;padding:16px 18px;margin-bottom:20px}
  .sign{display:flex;gap:40px;margin-top:44px}
  .sign div{flex:1;border-top:1px solid #1F1B16;padding-top:8px;font-size:12px;color:#8F8779}
  .note{font-size:12px;color:#8F8779;line-height:1.7}
  @media print{body{margin:0}}
</style></head><body>
<h1>Device handover</h1>
<div class="sub">${l.ref} · generated ${pretty(today())}</div>
<table>
  ${row('Employee', fullName(l))}
  ${row('Work email', l.work_email)}
  ${row('Department', l.department)}
  ${row('Last working day', pretty(l.last_working_day))}
  ${row('Device', ASSET_LABEL[l.asset_type] || 'Not recorded')}
  ${row('Serial number', l.asset_serial)}
</table>
<div class="box">
  <b>Condition on return</b>
  <p class="note">Circle one: &nbsp; Good &nbsp;·&nbsp; Minor damage &nbsp;·&nbsp;
     Damaged &nbsp;·&nbsp; Not returned</p>
  <p class="note">Notes: ________________________________________________</p>
</div>
<div class="box">
  <b>Also returned</b>
  <p class="note">Charger &nbsp;☐ &nbsp; Bag &nbsp;☐ &nbsp; Mouse &nbsp;☐ &nbsp;
     Access card &nbsp;☐ &nbsp; Other: ____________________</p>
</div>
<p class="note">
  I confirm the equipment listed above has been returned to Bayzat in the condition
  recorded, and that I retain no company property or data.
</p>
<div class="sign">
  <div>Employee signature and date</div>
  <div>Received by, and date</div>
</div>
</body></html>`;
}
