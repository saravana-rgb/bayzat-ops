'use client';
import { useEffect } from 'react';
/* What an asset looks like, and the small pieces every part of this tile
   needs. The client, the sign-in gate and the top bar are not redefined
   here — they come from common/shared like every other tile uses. */

export { AuthGate, Bar, supabase } from '../common/shared';

/* Every panel in this tile wants the same two things: Escape closes it, and
 * the first field is focused the moment it opens. One hook, used four times,
 * instead of four slightly different copies of the same effect. */
export function usePanelKeys(onClose, focusRef) {
  useEffect(() => {
    focusRef?.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ---------------------------------------------------------- vocabulary
   Matches ASSET_TYPES in employees/shared.js exactly, on purpose — the
   write-back copies this value straight into employees.asset_type, so if
   the two ever say different things the sync is broken by definition. */
export const OWNERSHIP = [
  ['bayzat',   'Bayzat owned'],
  ['leasing',  'Leased'],
  ['personal', 'Personal device']
];
export const OWNERSHIP_LABEL = Object.fromEntries(OWNERSHIP);

export const STATUS_LABEL = {
  in_stock          : 'In stock',
  assigned          : 'In use',
  repair            : 'Repair',
  retired           : 'Retired',
  returned_to_lessor: 'Back to lessor',
  released          : 'Released',
  missing           : 'Missing'
};

/* Which closures exist depends on who owns the thing — a personal device
   cannot be collected, and a leased one is never retired. The database
   enforces this too; this list only stops the form offering the impossible
   one. */
export const CLOSURES = {
  bayzat: [
    ['collected',   'Collected',              true],
    ['reassigned',  'Passed to someone else', true],
    ['written_off', 'Written off',            false],
    ['missing',     'Not returned',           false]
  ],
  leasing: [
    ['collected',          'Collected', true],
    ['returned_to_lessor', 'Returned to lessor', false],
    ['missing',            'Not returned', false]
  ],
  personal: [
    ['access_removed', 'Access removed', false],
    ['missing',        'Unresolved',     false]
  ]
};

/* Status maps down to one of six left-rule / chip colours. returned_to_lessor
   and released both read as "gone, and not ours to take back". */
export function statusClass(status) {
  if (status === 'in_stock') return 'st-instock';
  if (status === 'assigned') return 'st-assigned';
  if (status === 'repair')   return 'st-repair';
  if (status === 'missing')  return 'st-missing';
  if (status === 'retired')  return 'st-retired';
  return 'st-gone';   // returned_to_lessor, released
}

/* Today in the browser's own timezone. toISOString() is UTC, which reads
 * as yesterday for the first four hours of a Dubai day. */
export function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

export const pretty = (iso) => iso
  ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB',
      { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

export const describe = (a) => [a.make, a.model].filter(Boolean).join(' ')
  || a.category_label || 'Asset';

export const handle = (a) => a.tag || a.serial || (a.id ? a.id.slice(0, 8) : '—');

/* Same construction as fullName() in employees/shared.js, kept local so
 * this tile does not reach into another tile's file. */
export const fullName = (e) =>
  [e.preferred_name || e.first_name, e.last_name].filter(Boolean).join(' ').trim();

export const initials = (e) =>
  (((e.first_name || '?')[0] || '') + ((e.last_name || '')[0] || '')).toUpperCase();
