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
