'use client';
import { useEffect, useState } from 'react';
import { AuthGate, Bar, supabase, tiles } from './shared';

export default function Home() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  const [email, setEmail] = useState('');
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
    supabase.from('v_pending_steps').select('ref,days_left').then(({ data }) => {
      if (!data) return;
      const people = {};
      data.forEach(r => { people[r.ref] = r.days_left; });
      const vals = Object.values(people);
      setCounts({ open: vals.length, late: vals.filter(d => d < 0).length });
    });
  }, []);

  return (
    <div className="wrap">
      <Bar
        title="Bayzat Ops"
        sub="Internal tools for the IT and People teams"
        right={<>{email}<button className="mini" onClick={() => supabase.auth.signOut()}>Sign out</button></>}
      />

      <div className="tiles">
        {tiles.map(t => {
          const inner = (
            <>
              <div className="ico">{t.icon}</div>
              <h2>{t.name}</h2>
              <p>{t.blurb}</p>
              {t.slug === 'onboarding' && counts && (
                <div className="badges">
                  {counts.late > 0 && <span className="chip red">{counts.late} overdue</span>}
                  <span className="chip grey">{counts.open} open</span>
                </div>
              )}
              {!t.live && <div className="badges"><span className="chip grey">Coming later</span></div>}
            </>
          );
          return t.live
            ? <a key={t.slug} className="tile" href={t.href}>{inner}</a>
            : <div key={t.slug} className="tile soon">{inner}</div>;
        })}
      </div>
    </div>
  );
}
