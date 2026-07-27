'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ---------------------------------------------------------- client */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* ---------------------------------------------------------- access */
// Only these people see the Sources tile. Everyone else gets the tracker.
export const ADMINS = ['saravana@bayzat.com'];
export const isAdmin = (email) => ADMINS.includes((email || '').toLowerCase());


/* ------------------------------------------------------------ icons */
/* Drawn inline so nothing depends on a font shipping the right glyph. */
const PATHS = {
  onboarding: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 M9 14l2 2 4-4',
  reports:    'M18 20V10 M12 20V4 M6 20v-6',
  sources:    'M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  plus:       'M12 5v14 M5 12h14'
};

export function Icon({ name, size = 20 }) {
  const d = PATHS[name] || PATHS.plus;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split(' M').map((seg, i) => (
        <path key={i} d={(i ? 'M' : '') + seg} />
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------- tiles */
// Adding a tile later means one entry here and one folder under app/.
export const tiles = [
  {
    slug: 'onboarding',
    name: 'Onboarding',
    blurb: 'New joiners, the six IT steps they need, and the monthly report.',
    href: '/onboarding',
    icon: 'onboarding',
    live: true
  },
  {
    slug: 'sources',
    name: 'Sources',
    blurb: 'The sheets, repo and database behind every tile.',
    href: '/sources',
    icon: 'sources',
    live: true,
    tone: 'emerald',
    adminOnly: true
  },
  {
    slug: 'next',
    name: 'Your next tile',
    blurb: 'Offboarding, asset register, access reviews — whatever comes next.',
    href: '#',
    icon: 'plus',
    live: false
  }
];

/* --------------------------------------------------------- sources */
// Where everything actually lives. Grouped by tile, so as tiles are added
// their sources sit under their own heading.
export const sources = [
  {
    group: 'Onboarding',
    items: [
      {
        name: 'Onboarding Automation Sheet',
        kind: 'Google Sheet',
        tone: 'green',
        desc: 'The joiners feed. Apps Script reads it and turns each new row into a ticket.',
        detail: 'First Name \u00b7 Last Name \u00b7 DOJ \u00b7 Joining Location \u00b7 Laptop Request',
        url: 'https://docs.google.com/spreadsheets/d/1j05L-fbJY7fX8oCxJfu2rDoLBDp2NuVUNrUWplU8Zww/edit?gid=0#gid=0'
      },
      {
        name: 'Apps Script',
        kind: 'Automation',
        tone: 'amber',
        desc: 'Watches the sheet every five minutes, creates tickets, sends both emails.',
        detail: 'Open the sheet \u2192 Extensions \u2192 Apps Script',
        url: 'https://docs.google.com/spreadsheets/d/1j05L-fbJY7fX8oCxJfu2rDoLBDp2NuVUNrUWplU8Zww/edit?gid=0#gid=0'
      }
    ]
  },
  {
    group: 'Platform',
    items: [
      {
        name: 'GitHub repository',
        kind: 'Code',
        tone: 'grey',
        desc: 'This app. Committing to main redeploys it automatically.',
        detail: 'saravana-rgb/bayzat-ops',
        url: 'https://github.com/saravana-rgb/bayzat-ops'
      },
      {
        name: 'Supabase project',
        kind: 'Database',
        tone: 'accent',
        desc: 'Tickets, steps, users and access rules. The single source of truth.',
        detail: 'Tables: tickets \u00b7 ticket_steps \u00b7 view: v_pending_steps',
        url: 'https://supabase.com/dashboard'
      },
      {
        name: 'Vercel project',
        kind: 'Hosting',
        tone: 'grey',
        desc: 'Serves this app and rebuilds on every commit.',
        detail: 'bayzat-ops-vert.vercel.app',
        url: 'https://vercel.com/dashboard'
      }
    ]
  }
];

/* ----------------------------------------------------------- dates */
export const today = () => new Date().toISOString().slice(0, 10);

const diff = (a, b) =>
  Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);

/** Days since the joining date. Negative means they have not started yet. */
export const daysSince = (doj) => diff(doj, today());

export const pretty = (iso) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/** How a ticket reads at a glance. There is no deadline any more, so this
 *  shows how long it has been sitting: quiet at first, louder as it ages. */
export function ageChip(doj) {
  const d = daysSince(doj);
  if (d < 0)   return { cls: 'grey',  text: d === -1 ? 'Joins tomorrow' : `Joins in ${-d}d` };
  if (d === 0) return { cls: 'accent', text: 'Joins today' };
  if (d < 3)   return { cls: 'grey',  text: `Open ${d}d` };
  if (d < 7)   return { cls: 'amber', text: `Open ${d}d` };
  return { cls: 'red', text: `Open ${d}d` };
}

export const STATUS = { todo: 'To do', progress: 'In progress', done: 'Done', na: 'N/A' };

/* ------------------------------------------------------------ auth */
/** Wraps every page. Signed-out visitors get the sign-in form; anyone
 *  outside bayzat.com is turned away here and again by row level security
 *  in Postgres, so the database is the real gate. */
export function AuthGate({ children }) {
  const [session, setSession] = useState(undefined);   // undefined = still checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="center"><p style={{ color: 'var(--ink3)', fontWeight: 600 }}>Loading…</p></div>;
  }

  if (!session) return <SignIn />;

  const email = session.user?.email || '';
  if (!email.endsWith('@bayzat.com')) {
    return (
      <div className="center">
        <div className="card">
          <h1 style={{ fontSize: 17, fontWeight: 800 }}>Wrong account</h1>
          <p style={{ fontSize: 13, color: 'var(--ink3)', margin: '8px 0 20px', lineHeight: 1.55 }}>
            {email} isn&apos;t a Bayzat address. Sign out and try again with your work account.
          </p>
          <button className="btn ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </div>
    );
  }

  return children;
}

/** Sign-in form. Accounts are created by an admin in the Supabase
 *  dashboard — there is deliberately no self-signup. */
function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e?.preventDefault();
    if (!email || !password) { setError('Enter your email and password.'); return; }
    setBusy(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'That email and password combination was not recognised.'
        : error.message);
    }
  }

  return (
    <div className="center">
      <div className="card">
        <div className="mark" style={{ margin: '0 auto 16px' }}>B</div>
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>Bayzat Ops</h1>
        <p style={{ fontSize: 13, color: 'var(--ink3)', margin: '8px 0 18px', lineHeight: 1.55 }}>
          Sign in with your Bayzat account to see the tiles.
        </p>

        {error && <div className="err">{error}</div>}

        <form onSubmit={submit}>
          <input className="note" type="email" placeholder="you@bayzat.com" value={email}
            autoComplete="username" onChange={e => setEmail(e.target.value)} />
          <input className="note" type="password" placeholder="Password" value={password}
            autoComplete="current-password" onChange={e => setPassword(e.target.value)} />
          <button className="btn" type="submit" disabled={busy} style={{ marginTop: 14, width: '100%' }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: 11.5, color: 'var(--ink3)', marginTop: 16, lineHeight: 1.5 }}>
          No account? Ask Saravana to create one for you.
        </p>
      </div>
    </div>
  );
}

/** Shared top bar. */
export function Bar({ title, sub, right }) {
  return (
    <div className="bar">
      <div className="mark">B</div>
      <div>
        <h1>{title}</h1>
        <div className="sub">{sub}</div>
      </div>
      <div className="right">{right}</div>
    </div>
  );
}
