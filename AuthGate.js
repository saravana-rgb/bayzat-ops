'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/** Wraps every page. Signed-out visitors get the Google button; anyone
 *  outside bayzat.com gets turned away here and again by row level
 *  security in Postgres, so the database is the real gate. */
export default function AuthGate({ children }) {
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
          <button
            className="btn"
            onClick={() => supabase.auth.signInWithOAuth({
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
