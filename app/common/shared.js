'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

/* ---------------------------------------------------------- client */

/* ---------------------------------------------------------- client */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/* ---------------------------------------------------------- access */
// Only these people see the Sources tile. Everyone else gets the tracker.

/* ------------------------------------------------------------ icons */
/* Drawn inline so nothing depends on a font shipping the right glyph.
   Not exported — only Icon below uses it. */
const PATHS = {
  onboarding: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 M9 14l2 2 4-4',
  reports:    'M18 20V10 M12 20V4 M6 20v-6',
  sources:    'M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  documents:  'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h4',
  employees:  'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  offboarding:'M16 17l5-5-5-5 M21 12H9 M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6',
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
