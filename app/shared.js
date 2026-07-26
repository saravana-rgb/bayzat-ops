'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ---------------------------------------------------------- client */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* ----------------------------------------------------------- tiles */
// Adding a tile later means one entry here and one folder under app/.
export const tiles = [
  {
    slug: 'onboarding',
    name: 'Onboarding tracker',
    blurb: 'Every new joiner, the six IT steps they need, and what is overdue.',
    href: '/onboarding',
    icon: '\u2713',
    live: true
  },
  {
    slug: 'next',
    name: 'Your next tile',
    blurb: 'Offboarding, asset register, access reviews — whatever comes next.',
    href: '#',
    icon: '+',
    live: false
  }
];

/* ----------------------------------------------------------- dates */
export const today = () => new Date().toISOString().slice(0, 10);

export const daysLeft = (due) =>
  Math.round((new Date(due + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5);

export const pretty = (iso) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export function dueChip(due) {
  const d = daysLeft(due);
  if (d < 0)   return { cls: 'red',   text: `${-d}d overdue` };
  if (d === 0) return { cls: 'amber', text: 'Due today' };
  return { cls: 'grey', text: `${d}d left` };
}

export const STATUS = { todo: 'To do', progress: 'In progress', done: 'Done', na: 'N/A' };

/* ------------------------------------------------------------ auth */
/** Wraps every page. Signed-out visitors get the Google button; anyone
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

  if (!session) {
    return (
      <div className="center">
        <div className="card">
          <div className="mark" style={{ margin: '0 auto 16px' }}>B</div>
          <h1 style={{ fontSize: 18, fontWeight: 800 }}>Bayzat Ops</h1>
          <p style={{ fontSize: 13, color: 'var(--ink3)', margin: '8px 0 20px', lineHeight: 1.55 }}>
            Sign in with your Bayzat account to see the tiles.
          </p>
          <button className="btn" onClick={() => supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
          })}>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

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
