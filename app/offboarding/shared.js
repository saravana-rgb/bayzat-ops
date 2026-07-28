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
