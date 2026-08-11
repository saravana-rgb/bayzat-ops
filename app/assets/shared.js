'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { S, C, STATUS_COLOUR } from './styles';

/* If common/shared.js already exports a configured client, replace these two
   lines with an import of it. These are the standard Vercel/Supabase names. */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const PATH = '/assets';

/* ---------------------------------------------------------- vocabulary
   Kept in one place and mirrored from the check constraints. If these drift
   from the database the insert fails loudly, which is the right way round. */
export const OWNERSHIP = [
  { value: 'bayzat', label: 'Bayzat owned' },
  { value: 'leased', label: 'Leased' },
  { value: 'byod',   label: 'Employee owned' }
];

export const STATUS_LABEL = {
  in_stock          : 'In stock',
  assigned          : 'In use',
  repair            : 'Repair',
  retired           : 'Retired',
  returned_to_lessor: 'Back to lessor',
  released          : 'Released',
  missing           : 'Missing'
};

/* Which endings exist depends on who owns the thing. The database enforces
   this too — this list only stops us offering an impossible one. */
export const CLOSURES = {
  bayzat: [
    { value: 'collected',   label: 'Collected', needsCondition: true },
    { value: 'reassigned',  label: 'Passed to someone else', needsCondition: true },
    { value: 'written_off', label: 'Written off' },
    { value: 'missing',     label: 'Not returned' }
  ],
  leased: [
    { value: 'collected',          label: 'Collected', needsCondition: true },
    { value: 'returned_to_lessor', label: 'Returned to lessor' },
    { value: 'missing',            label: 'Not returned' }
  ],
  byod: [
    { value: 'access_removed', label: 'Access removed' },
    { value: 'missing',        label: 'Unresolved' }
  ]
};

export function ownershipLabel(v) {
  const found = OWNERSHIP.find(function (o) { return o.value === v; });
  return found ? found.label : v;
}

/* ------------------------------------------------------------- helpers */

/* toISOString is UTC, which reads as yesterday for the first four hours of a
   Dubai day. Dates are built from local parts, always. */
export function today() {
  const d = new Date();
  const p = function (n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function pretty(iso) {
  if (!iso) return '—';
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso);
  return Number(m[3]) + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1];
}

export function describe(a) {
  const bits = [a.make, a.model].filter(Boolean).join(' ');
  return bits || a.category_label || 'Asset';
}

export function handle(a) {
  return a.tag || a.serial || (a.id ? a.id.slice(0, 8) : '—');
}

/* ---------------------------------------------------------- components */

export function Pill({ children, tone, subtle }) {
  const colour = tone || C.steel;
  return (
    <span style={subtle ? { ...S.pillSubtle, color: colour, borderColor: colour }
                        : { ...S.pill, background: colour }}>
      {children}
    </span>
  );
}

export function StatusPill({ status }) {
  return <Pill tone={STATUS_COLOUR[status] || C.steel}>
    {STATUS_LABEL[status] || status}
  </Pill>;
}

export function Count({ label, value, tone, active, onClick }) {
  return (
    <button onClick={onClick}
            style={{ ...S.count, borderColor: active ? tone : C.rule,
                     background: active ? '#FFFFFF' : 'transparent' }}>
      <span style={{ ...S.countNum, color: tone }}>{value}</span>
      <span style={S.countLabel}>{label}</span>
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      {children}
      {hint ? <span style={S.fieldHint}>{hint}</span> : null}
    </label>
  );
}

export function Panel({ title, sub, onClose, children, wide }) {
  return (
    <div style={S.scrim} onClick={onClose}>
      <div style={wide ? { ...S.panel, maxWidth: 760 } : S.panel}
           onClick={function (e) { e.stopPropagation(); }}>
        <div style={S.panelHead}>
          <div>
            <div style={S.panelTitle}>{title}</div>
            {sub ? <div style={S.panelSub}>{sub}</div> : null}
          </div>
          <button style={S.close} onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ children }) {
  return <div style={S.empty}>{children}</div>;
}

/* -------------------------------------------------------------- auth
   Same rule as the rest of the app: a signed-in @bayzat.com address. */
export function AuthGate({ children }) {
  const [state, setState] = useState('checking');
  const [email, setEmail] = useState('');

  useEffect(function () {
    let live = true;
    supabase.auth.getSession().then(function ({ data }) {
      if (!live) return;
      const who = data && data.session && data.session.user
        ? data.session.user.email : '';
      setEmail(who || '');
      setState(who && /@bayzat\.com$/i.test(who) ? 'in' : 'out');
    });
    const sub = supabase.auth.onAuthStateChange(function (_e, session) {
      const who = session && session.user ? session.user.email : '';
      setEmail(who || '');
      setState(who && /@bayzat\.com$/i.test(who) ? 'in' : 'out');
    });
    return function () {
      live = false;
      if (sub && sub.data && sub.data.subscription) sub.data.subscription.unsubscribe();
    };
  }, []);

  if (state === 'checking') return <div style={S.gate}>Checking…</div>;
  if (state === 'out') {
    return (
      <div style={S.gate}>
        <div style={S.gateTitle}>Not signed in</div>
        <div style={S.gateBody}>
          {email
            ? email + ' is not a Bayzat address.'
            : 'Sign in with your Bayzat account to see the asset register.'}
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
