'use client';
/* Everything the Documents tile needs to talk about files and expiry. */

export const BUCKET = 'company-docs';

export const CATEGORIES = [
  ['trade_license',      'Trade licence'],
  ['establishment_card', 'Establishment card'],
  ['letterhead',         'Letterhead'],
  ['stamp',              'Stamp'],
  ['other',              'Other']
];
export const LABEL = Object.fromEntries(CATEGORIES);

/** Expiry as a person would say it. */
/** Today in the browser's timezone — toISOString() gives UTC, which reads
 *  as yesterday for the first hours of every day in Dubai. */
function localToday() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

export function expiryChip(iso) {
  if (!iso) return { cls: 'grey', text: 'No expiry' };
  const days = Math.round(
    (new Date(iso + 'T00:00:00') - new Date(localToday() + 'T00:00:00'))
    / 864e5);
  if (days < 0)   return { cls: 'red',   text: `Expired ${-days}d ago` };
  if (days === 0) return { cls: 'red',   text: 'Expires today' };
  if (days <= 30) return { cls: 'amber', text: `${days}d left` };
  if (days <= 60) return { cls: 'grey',  text: `${days}d left` };
  return { cls: 'green', text: `${Math.round(days / 30)} months left` };
}

export const pretty = iso => iso
  ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB',
      { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export const size = b => !b ? '' : b > 1048576
  ? (b / 1048576).toFixed(1) + ' MB' : Math.max(Math.round(b / 1024), 1) + ' KB';
