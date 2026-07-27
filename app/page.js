'use client';
import { useEffect, useState } from 'react';
import { AuthGate, Bar, Icon, supabase } from './common/shared';
import { isAdmin, tiles } from './common/tiles';

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

  return (
    <div className="wrap">
      <Bar
        title="Bayzat Ops"
        sub="Internal tools for the IT and People teams"
        right={<>{email}<button className="mini" onClick={() => supabase.auth.signOut()}>Sign out</button></>}
      />

      <div className="tiles">
        {visible.map(t => {
          const inner = (
            <>
              <div className={'ico' + (t.tone ? ' ' + t.tone : '')}>
                <Icon name={t.icon} />
              </div>
              <h2>{t.name}</h2>
              <p>{t.blurb}</p>
              <div className="badges">
                {t.slug === 'onboarding' && counts && (<>
                  {counts.old > 0 && <span className="chip red">{counts.old} waiting a week</span>}
                  {counts.people > 0
                    ? <span className="chip accent">{counts.people} pending</span>
                    : <span className="chip green">All clear</span>}
                </>)}
                {t.slug === 'sources' && <span className="chip green">Only you</span>}
                {!t.live && <span className="chip grey">Coming later</span>}
              </div>
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
