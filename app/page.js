'use client';
import { useEffect, useState } from 'react';
import { AuthGate, Bar, isAdmin, supabase, tiles } from './shared';

export default function Home() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  const [email, setEmail] = useState('');
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
    supabase.from('v_pending_steps').select('ref,days_open').then(({ data }) => {
      if (!data) return;
      const people = {};
      data.forEach(r => { people[r.ref] = r.days_open; });
      const ages = Object.values(people);
      setCounts({ people: ages.length, steps: data.length, old: ages.filter(d => d >= 7).length });
    });
  }, []);

  // the Sources tile only exists for admins
  const visible = tiles.filter(t => !t.adminOnly || isAdmin(email));
  const main = visible.filter(t => !t.compact);
  const utility = visible.filter(t => t.compact);

  return (
    <div className="wrap">
      <Bar
        title="Bayzat Ops"
        sub="Internal tools for the IT and People teams"
        right={<>{email}<button className="mini" onClick={() => supabase.auth.signOut()}>Sign out</button></>}
      />

      <div className="tiles">
        {main.map(t => {
          const inner = (
            <>
              <div className="ico">{t.icon}</div>
              <h2>{t.name}</h2>
              <p>{t.blurb}</p>
              {t.slug === 'onboarding' && counts && (
                <div className="badges">
                  {counts.old > 0 && <span className="chip red">{counts.old} waiting a week</span>}
                  {counts.people > 0
                    ? <span className="chip accent">{counts.people} joiner{counts.people > 1 ? 's' : ''} pending</span>
                    : <span className="chip green">All clear</span>}
                  {counts.steps > 0 && <span className="chip grey">{counts.steps} steps</span>}
                </div>
              )}
              {!t.live && <div className="badges"><span className="chip grey">Coming later</span></div>}
            </>
          );
          const cls = 'tile' + (t.chart ? ' chart' : '');
          return t.live
            ? <a key={t.slug} className={cls} href={t.href}>{inner}</a>
            : <div key={t.slug} className="tile soon">{inner}</div>;
        })}
      </div>

      {utility.length > 0 && (
        <div className="tiles" style={{ marginTop: 14 }}>
          {utility.map(t => (
            <a key={t.slug} className="tile compact" href={t.href}>
              <div className="ico">{t.icon}</div>
              <div>
                <h2>{t.name}</h2>
                <p>{t.blurb}</p>
              </div>
              <span className="lock">Only you</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
