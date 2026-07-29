'use client';
import { useCallback, useEffect, useState } from 'react';
import { AuthGate, Bar, Icon, supabase } from './common/shared';
import { isAdmin, tiles } from './common/tiles';

export default function Home() {
  return <AuthGate><Shell /></AuthGate>;
}

/** Today, in the browser's own timezone. */
const today = () => {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
};
const days = (iso) => iso
  ? Math.round((new Date(today() + 'T00:00:00')
      - new Date(String(iso).slice(0, 10) + 'T00:00:00')) / 864e5) : null;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function Shell() {
  const [email, setEmail] = useState('');
  const [d, setD] = useState(null);

  const load = useCallback(async () => {
    const [pending, leavers, docs, emp] = await Promise.all([
      supabase.from('v_pending_steps').select('ref,days_open,name,label'),
      supabase.from('leavers').select('id,ref,first_name,last_name,status,last_working_day'),
      supabase.from('company_documents').select('id,title,expiry_date,status'),
      supabase.from('employees').select('id,status,asset_type,first_name,last_name,work_email,' +
        'employee_id,hiring_date,location,entity,department,title,reports_to')
    ]);

    const joiners = {};
    (pending.data || []).forEach(r => {
      joiners[r.ref] = joiners[r.ref] || { name: r.name, days: r.days_open, steps: 0 };
      joiners[r.ref].steps++;
    });
    const joinerList = Object.entries(joiners).map(([ref, v]) => ({ ref, ...v }))
      .sort((a, b) => b.days - a.days);

    const openLeavers = (leavers.data || []).filter(l => l.status === 'pending');
    const dueLeavers = openLeavers.filter(l => days(l.last_working_day) >= 0);

    // anything expiring within a month, or already past it
    const soon = (docs.data || [])
      .filter(x => x.status === 'active' && x.expiry_date)
      .filter(x => -days(x.expiry_date) <= 30);

    const active = (emp.data || []).filter(e => e.status === 'active');
    const REQ = ['work_email','employee_id','hiring_date','location','entity','department',
                 'title','reports_to','asset_type'];
    const gaps = active.filter(e => REQ.some(k => !String(e[k] ?? '').trim()));

    setD({ joinerList, openLeavers, dueLeavers, soon, active, gaps });
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
    load();
  }, [load]);

  const visible = tiles.filter(t => !t.adminOnly || isAdmin(email));
  const name = (email || '').split('@')[0].split('.')[0];

  /* everything that wants attention today, in one list, worst first */
  const jobs = [];
  if (d) {
    d.dueLeavers.forEach(l => jobs.push({
      tone: 'rose', href: '/offboarding',
      what: `${l.first_name} ${l.last_name} has left`,
      why: days(l.last_working_day) === 0
        ? 'Last day is today — collect the device and close their access'
        : `${days(l.last_working_day)} days ago and the checklist is still open`,
      sort: 100 + days(l.last_working_day)
    }));
    d.soon.forEach(x => jobs.push({
      tone: 'amber', href: '/documents',
      what: x.title,
      why: -days(x.expiry_date) < 0 ? 'Expired' : `Expires in ${-days(x.expiry_date)} days`,
      sort: 80 - (-days(x.expiry_date))
    }));
    d.joinerList.filter(j => j.days >= 3).forEach(j => jobs.push({
      tone: 'blue', href: '/onboarding',
      what: j.name,
      why: `Joined ${j.days} days ago, ${j.steps} step${j.steps > 1 ? 's' : ''} outstanding`,
      sort: 40 + j.days
    }));
  }
  jobs.sort((a, b) => b.sort - a.sort);

  return (
    <div className="wrap">
      <Bar
        title="Bayzat Ops"
        sub="Internal tools for the IT and People teams"
        right={<>{email}<button className="mini" onClick={() => supabase.auth.signOut()}>
          Sign out</button></>}
      />

      <div className="hello">
        <div>
          <h2>{greeting()}{name ? ', ' + name.charAt(0).toUpperCase() + name.slice(1) : ''}</h2>
          <p>
            {!d ? 'Checking what needs you…'
              : jobs.length === 0
                ? 'Nothing is waiting on you — every joiner, leaver and licence is up to date.'
                : `${jobs.length} thing${jobs.length > 1 ? 's need' : ' needs'} your attention.`}
          </p>
        </div>
        <span className="kbd-hint">Press <kbd>/</kbd> to search anything</span>
      </div>

      {d && jobs.length > 0 && (
        <div className="todaybox">
          <div className="todayhead">
            <span>Needs you today</span>
            <span className="todaycount">{jobs.length}</span>
          </div>
          {jobs.slice(0, 6).map((j, i) => (
            <a key={i} className={'job ' + j.tone} href={j.href}>
              <span className="jdot" />
              <span className="jbody">
                <span className="jwhat">{j.what}</span>
                <span className="jwhy">{j.why}</span>
              </span>
              <span className="jgo">→</span>
            </a>
          ))}
          {jobs.length > 6 && (
            <a className="todaymore" href="/onboarding">
              and {jobs.length - 6} more across the tiles →
            </a>
          )}
        </div>
      )}

      <div className="tiles">
        {visible.map(t => {
          // a plain `length && text` returns 0 when the count is zero, and
          // React renders that 0 on the page — hence the stray zeroes
          const n = d ? {
            onboarding: d.joinerList.length,
            offboarding: d.openLeavers.length,
            employees: d.gaps.length,
            documents: d.soon.length
          }[t.slug] : null;
          const label = {
            onboarding: 'pending', offboarding: 'in progress',
            employees: 'need attention', documents: 'expiring'
          }[t.slug];
          const counts = n ? `${n} ${label}` : null;
          const urgent = d ? ({
            offboarding: d.dueLeavers.length,
            documents: d.soon.filter(x => -days(x.expiry_date) <= 7).length,
            onboarding: d.joinerList.filter(j => j.days >= 7).length
          }[t.slug] || 0) : 0;

          const inner = (
            <>
              <div className={'ico' + (t.tone ? ' ' + t.tone : '')}><Icon name={t.icon} /></div>
              <h2>{t.name}</h2>
              <p>{t.blurb}</p>
              <div className="badges">
                {urgent > 0 && <span className="chip red">{urgent} urgent</span>}
                {counts && <span className="chip grey">{counts}</span>}
                {t.slug === 'sources' && <span className="chip green">Only you</span>}
                {!t.live && <span className="chip grey">Coming later</span>}
                {d && t.live && !counts && !urgent && t.slug !== 'sources' &&
                  n !== null && <span className="chip green">All clear</span>}
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
