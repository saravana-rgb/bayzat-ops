'use client';
/* How the Master record is grouped and read. The field list mirrors the
   Master sheet, so a column added there needs one entry here to appear. */

export const GROUPS = [
  {
    name: 'Identity',
    fields: [
      ['employee_id',      'Employee ID'],
      ['sr_no',            'Sr. No'],
      ['full_name',        'Full name'],
      ['work_email',       'Work email'],
      ['personal_email',   'Personal email'],
      ['mobile_no',        'Mobile'],
      ['work_no',          'Office number'],
      ['nationality',      'Nationality'],
      ['gender',           'Gender']
    ]
  },
  {
    name: 'Role',
    fields: [
      ['title',            'Job title'],
      ['mol_designation',  'MOL designation'],
      ['department',       'Department'],
      ['lm_department',    'LM department'],
      ['team',             'Team'],
      ['business_unit_m',  'Business unit'],
      ['employee_group',   'Employee group'],
      ['reports_to',       'Manager'],
      ['manager_email',    'Manager email'],
      ['manager_eid',      'Manager EID'],
      ['hrbp',             'HRBP']
    ]
  },
  {
    name: 'Employment',
    fields: [
      ['employee_status',  'Status'],
      ['hiring_date',      'Hire date',      'date'],
      ['seniority_date',   'Seniority date', 'date'],
      ['tenure',           'Tenure'],
      ['confirmation_status', 'Confirmation'],
      ['probation_end',    'Probation ends', 'date'],
      ['probation_days',   'Probation days'],
      ['leave_date',       'Leave date',     'date'],
      ['separation_type',  'Separation type'],
      ['exit_type',        'Type of exit'],
      ['exit_regretted',   'Regretted']
    ]
  },
  {
    name: 'Where and under whom',
    fields: [
      ['organization',     'Organization'],
      ['legal_entity',     'Legal entity'],
      ['contract_entity',  'Contract entity'],
      ['location',         'Location'],
      ['office',           'Office'],
      ['country_residence','Country of residence'],
      ['mol_id',           'MOL ID'],
      ['freezone_id',      'Freezone ID']
    ]
  },
  {
    name: 'Visa and residency',
    fields: [
      ['visa_uid',         'Residency visa UID'],
      ['visa_file_no',     'Visa file number'],
      ['visa_location',    'Visa location'],
      ['visa_expiry',      'Visa expiry',    'date']
    ]
  },
  {
    name: 'Contract',
    fields: [
      ['contract_type',    'Contract type'],
      ['contract_limited', 'Limited or unlimited'],
      ['notice_period',    'Notice period'],
      ['non_compete',      'Non-compete'],
      ['legal_jurisdiction','Legal jurisdiction']
    ]
  },
  {
    name: 'Insurance and benefits',
    fields: [
      ['medical_insurance','Medical insurance'],
      ['insurance_category','Category'],
      ['insurance_coverage','Coverage'],
      ['insurance_spouse', 'Spouse'],
      ['insurance_children','Children'],
      ['insurance_parents','Parents'],
      ['dependents',       'Dependents'],
      ['air_ticket',       'Air ticket allowance'],
      ['ticket_class',     'Ticket class'],
      ['trip',             'Trip']
    ]
  }
];

/* Shown only to whoever is listed in hr_admins. The database returns null
   for these to everyone else, so this list is a label, not the control. */
export const PRIVATE_FIELDS = [
  ['salary',          'Salary',          'money'],
  ['basic_salary',    'Basic salary',    'money'],
  ['housing',         'Housing',         'money'],
  ['travel_salary',   'Travel',          'money'],
  ['salary_aed',      'Salary (AED)',    'money'],
  ['currency',        'Currency'],
  ['date_of_birth',   'Date of birth',   'date'],
  ['marital_status',  'Marital status'],
  ['home_address',    'Home address'],
  ['passport_no',     'Passport number'],
  ['passport_expiry', 'Passport expiry', 'date'],
  ['emirates_id',     'Emirates ID'],
  ['emirates_expiry', 'Emirates ID expiry', 'date'],
  ['comments',        'Comments']
];

export const today = () => {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
};

export const pretty = (iso) =>
  iso ? new Date(String(iso).slice(0, 10) + 'T00:00:00')
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const daysUntil = (iso) => iso
  ? Math.round((new Date(String(iso).slice(0, 10) + 'T00:00:00')
      - new Date(today() + 'T00:00:00')) / 864e5) : null;

export const money = (v, ccy) => (v === null || v === undefined || v === '')
  ? '' : (ccy ? ccy + ' ' : '') + Number(v).toLocaleString('en-GB');

export const initials = (e) =>
  ((e.first_name || '?')[0] + (e.last_name || '')[0] || '').toUpperCase();

export const fullName = (e) =>
  e.full_name || [e.first_name, e.last_name].filter(Boolean).join(' ').trim();

/** Visa and probation are the two dates that need chasing. */
export function expiryChip(iso, label) {
  const d = daysUntil(iso);
  if (d === null) return null;
  if (d < 0)   return { cls: 'red',   text: `${label} expired ${-d}d ago` };
  if (d <= 30) return { cls: 'red',   text: `${label} in ${d}d` };
  if (d <= 60) return { cls: 'amber', text: `${label} in ${d}d` };
  return null;
}
