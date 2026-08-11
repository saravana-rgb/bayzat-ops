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

/* --------------------------------------------------------- iconography
 * Same technique as Icon() in common/shared.js -- a path string split on
 * ' M' into separate <path> elements, so the stroke language matches the
 * rest of the app. Kept deliberately simple (rectangles and straight
 * lines) rather than freehand curves. */
export const CATEGORY_ICON = {
  laptop:      'M4 4h16v10H4z M2 18h20l-2-4H4z',
  desktop:     'M7 3h10v17H7z M9 7h6 M9 10h6 M11 20h2',
  monitor:     'M3 4h18v12H3z M9 20h6 M12 16v4',
  phone:       'M8 2h8v20H8z M11 19h2',
  sim:         'M5 4h14v16H5z M8 9h8 M8 13h8 M8 17h5',
  tablet:      'M4 3h16v18H4z M10 20h4',
  peripheral:  'M2 8h20v10H2z M5 11h2 M9 11h2 M13 11h2 M17 11h2 M5 15h14',
  access_card: 'M3 5h18v14H3z M6 8h4v4H6z M13 9h6 M13 13h6',
  other:       'M4 4h16v16H4z M9 9h6v6H9z'
};

export function CategoryIcon({ slug, size = 18 }) {
  const d = CATEGORY_ICON[slug] || CATEGORY_ICON.other;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split(' M').map((seg, i) => <path key={i} d={(i ? 'M' : '') + seg} />)}
    </svg>
  );
}

/* Every category gets a distinct, named palette colour -- no new hex,
 * every one of these already exists as a CSS variable everywhere else in
 * the app. Cycled across nine categories with six hues, same way the
 * onboarding step colours (s1..s6) already get reused across more than
 * six things elsewhere in this codebase. */
const CATEGORY_TONE = {
  laptop: 'a1', desktop: 'a6', monitor: 'a4', phone: 'a5',
  sim: 'a3', tablet: 'a2', peripheral: 'a1', access_card: 'a6', other: 'muted'
};
export function categoryTone(slug) { return CATEGORY_TONE[slug] || 'muted'; }

export const TONE_VAR = {
  a1: 'var(--s1)', a2: 'var(--accent)', a3: 'var(--s3)',
  a4: 'var(--s4)', a5: 'var(--s5)', a6: 'var(--s6)', muted: 'var(--ink3)'
};

/* Initials for a plain "First Last" string, not an employee record shape
 * -- this tile only ever has the holder's name as text, not the record. */
export function nameInitials(name) {
  const parts = String(name || '').trim().split(/\s+/);
  return (((parts[0] || '?')[0] || '') + ((parts[1] || '')[0] || '')).toUpperCase();
}

/* A small hand-built donut, not a charting library -- this app has none
 * installed. Pure circle geometry (stroke-dasharray as a fraction of the
 * circumference), not freehand drawing, so it is correct by construction
 * rather than by eye. */
export function Donut({ segments, size = 128, thickness = 18 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--line2)" strokeWidth={thickness} />
      {segments.filter(s => s.value > 0).map((s, i) => {
        const frac = s.value / total;
        const dash = frac * c;
        const el = (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}
