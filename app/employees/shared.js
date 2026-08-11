'use client';
/* What a complete employee record looks like, and how the fields are grouped
   in the drawer. `req` drives the red flags — it must match the list inside
   employee_missing() in schema-employees.sql. */

export const ASSET_TYPES = [
  ['bayzat',   'Bayzat owned'],
  ['leasing',  'Leased'],
  ['personal', 'Personal device'],
  ['none',     'No device']
];
export const ASSET_LABEL = Object.fromEntries(ASSET_TYPES);

export const LEASING_COMPANIES = [
  ['ABCOM',           'ABCOM'],
  ['GRENKE/ZENADMIN', 'GRENKE/ZENADMIN'],
  ['HOFY',             'HOFY']
];

export const GROUPS = [
  {
    name: 'Who they are',
    fields: [
      { k: 'first_name',     l: 'First name',     req: true },
      { k: 'last_name',      l: 'Last name',      req: true },
      { k: 'preferred_name', l: 'Preferred name' },
      { k: 'employee_id',    l: 'Employee number', req: true },
      { k: 'nationality',    l: 'Nationality',    list: true },
      { k: 'gender',         l: 'Gender',         list: true }
    ]
  },
  {
    name: 'Where they sit',
    fields: [
      { k: 'hiring_date', l: 'Hiring date', req: true, type: 'date' },
      { k: 'title',       l: 'Job title',   req: true },
      { k: 'department',  l: 'Department',  req: true, list: true },
      { k: 'reports_to',  l: 'Reports to',  req: true },
      { k: 'entity',      l: 'Entity',      req: true, list: true },
      { k: 'location',    l: 'Location',    req: true, list: true },
      { k: 'office',      l: 'Office',      list: true }
    ]
  },
  {
    name: 'Their device',
    fields: [
      { k: 'asset_type',   l: 'Device type', req: true, type: 'select', options: ASSET_TYPES },
      { k: 'asset_serial', l: 'Serial number' },
      /* Only applies -- and is only required -- when the device is leased.
       * Deliberately NOT `req: true`: REQUIRED (below) feeds a per-field
       * completeness report across every active employee, and this field
       * is legitimately blank for everyone not on a leased device. Marking
       * it plainly required would make that report say something false --
       * "97% missing Leasing company" -- about people the field was never
       * meant to apply to. reqIf/showIf keep it conditional everywhere:
       * the drawer, the red-flag count, and the completeness report all
       * agree on when it actually matters. */
      { k: 'leasing_company', l: 'Leasing company', type: 'select', options: LEASING_COMPANIES,
        showIf: (e) => e.asset_type === 'leasing',
        reqIf:  (e) => e.asset_type === 'leasing' },
      { k: 'asset_note',   l: 'Note', wide: true }
    ]
  },
  {
    name: 'How to reach them',
    fields: [
      { k: 'work_email',     l: 'Work email',     req: true, type: 'email' },
      { k: 'personal_email', l: 'Personal email', type: 'email' },
      { k: 'mobile_no',      l: 'Mobile' },
      { k: 'work_no',        l: 'Work number' }
    ]
  }
];

export const ALL_FIELDS = GROUPS.flatMap(g => g.fields);
export const FIELD = Object.fromEntries(ALL_FIELDS.map(f => [f.k, f]));
export const REQUIRED = ALL_FIELDS.filter(f => f.req).map(f => f.k);

/** Which required fields are still empty. Mirrors the database view, so the
 *  count in the app and the count in a report agree. A field only counts
 *  as missing when it actually applies (showIf) and is actually required
 *  right now (req, or reqIf evaluated against this record) -- so a field
 *  that does not apply to someone is never held against them. */
export function missingOf(e) {
  return ALL_FIELDS.filter(f => {
    if (f.showIf && !f.showIf(e)) return false;
    const required = f.req || (f.reqIf && f.reqIf(e));
    if (!required) return false;
    const v = e[f.k];
    return v === null || v === undefined || String(v).trim() === '';
  }).map(f => f.k);
}

export const initials = (e) =>
  ((e.first_name || '?')[0] + (e.last_name || '')[0] || '').toUpperCase();

export const fullName = (e) =>
  [e.preferred_name || e.first_name, e.last_name].filter(Boolean).join(' ').trim();

export const pretty = (iso) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/** Years and months since joining, for the drawer. */
export function tenure(iso) {
  if (!iso) return '';
  const start = new Date(iso + 'T00:00:00');
  if (start > new Date()) return 'starts ' + pretty(iso);
  const months = Math.floor((Date.now() - start) / 2629800000);
  if (months < 1) return 'joined this month';
  if (months < 12) return months + ' month' + (months > 1 ? 's' : '');
  const y = Math.floor(months / 12), m = months % 12;
  return y + ' year' + (y > 1 ? 's' : '') + (m ? ', ' + m + ' month' + (m > 1 ? 's' : '') : '');
}
