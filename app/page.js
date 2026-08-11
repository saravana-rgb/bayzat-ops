'use client';
import { useCallback, useEffect, useState } from 'react';
import { AuthGate, Bar, Icon, supabase } from './common/shared';
import { isAdmin, tiles } from './common/tiles';
import { homeCss } from './styles';

/* Small inline icons standing in for the plain arrow/exclamation
 * characters the lanes used before. Same drawing technique as Icon() in
 * common/shared.js -- a stroked path, nothing filled, no new dependency. */
function LaneIcon({ kind }) {
  const d = kind === 'leaving' ? 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9'
          : kind === 'joining' ? 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3'
          : 'M12 9v4 M12 17h.01 M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z';
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.split(' M').map((seg, i) => <path key={i} d={(i ? 'M' : '') + seg} />)}
    </svg>
  );
}

function railInitials(name) {
  const parts = String(name || '').trim().split(/\s+/);
  return (((parts[0] || '?')[0] || '') + ((parts[1] || '')[0] || '')).toUpperCase();
}

/* The rail's one job: for each thing actually happening today, show what
 * kind it is, who or what it concerns, and why it matters -- using only
 * fields the data really has. "when" here is always relative day language
 * ("Starts today", "Expires in 4 days") because hiring_date, last_working_
 * day and expiry_date are all dates, not timestamps -- there is no time of
 * day to show, so the rail never claims one.
 *
 * Deliberately excludes the "records need attention" count: that is an
 * ongoing backlog, not a dated event, and mixing it into a timeline would
 * be mixing two different kinds of information into one visual language.
 * It gets its own small badge instead, see HeroBadge below. */
function TodayRail({ leaving, joining, expiring }) {
  const lanes = [
    { key: 'leaving', tone: 'rose', verb: 'leaving', href: '/offboarding', items: leaving, person: true },
    { key: 'joining', tone: 'olive', verb: 'joining', href: '/onboarding', items: joining, person: true },
    { key: 'expiring', tone: 'amber', verb: 'expiring', href: '/documents', items: expiring, person: false }
  ].filter(l => l.items.length > 0);
  if (lanes.length === 0) return null;

  return (
    <div className="rail">
      <div className="rail-track" />
      <div className="rail-items">
        {lanes.map(lane => {
          const top = lane.items[0];
          return (
            <a key={lane.key} className={'rail-item ' + lane.tone} href={lane.href}>
              <span className="rail-dot"><LaneIcon kind={lane.key} /></span>
              <span className="rail-tick" />
              <span className="rail-card">
                <span className="rail-when">{top.when}</span>
                <span className="rail-who">
                  {lane.person
                    ? <span className="rail-avatar">{railInitials(top.name)}</span>
                    : <span className="rail-doc-ico"><Icon name="documents" size={13} /></span>}
                  <span className="rail-name">{top.name}</span>
                </span>
                <span className="rail-why">{top.why}</span>
                {lane.items.length > 1 &&
                  <span className="rail-more">+{lane.items.length - 1} more {lane.verb}</span>}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/** One kind of work. Empty lanes still show, so the shape of the day is the
 *  same every morning and a glance tells you which side is busy. */
function Lane({ kind, title, icon, blurb, items, href }) {
  const urgent = items.filter(i => i.urgent).length;
  return (
    <div className={'lane ' + kind + (items.length ? '' : ' quiet')}>
      <a className="lanehead" href={href}>
        <span className="laneicon">{icon}</span>
        <span className="lanetitle">
          {title}
          <span className="laneblurb">{blurb}</span>
        </span>
        <span className={'lanecount' + (urgent ? ' hot' : '')}>{items.length}</span>
      </a>

      {items.length === 0
        ? <p className="lanenone">Nothing outstanding</p>
        : <div className="lanelist">
            {items.slice(0, 4).map((i, n) => (
              <a key={n} className={'laneitem' + (i.urgent ? ' urgent' : '')} href={href}>
                <span className="liname">{i.name}</span>
                <span className="liwhen">{i.when}</span>
                <span className="liwhy">{i.why}</span>
              </a>
            ))}
            {items.length > 4 && (
              <a className="lanemore" href={href}>
                and {items.length - 4} more →
              </a>
            )}
          </div>}
    </div>
  );
}

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

  /* Leaving and joining are opposite jobs, so they are not mixed into one
     list. Within each, the longest-waiting comes first. */
  const leaving = [], joining = [], expiring = [];
  if (d) {
    d.dueLeavers.forEach(l => {
      const n = days(l.last_working_day);
      leaving.push({
        name: `${l.first_name} ${l.last_name}`,
        when: n === 0 ? 'Last day is today' : `Left ${n} day${n > 1 ? 's' : ''} ago`,
        why: n === 0
          ? 'Collect the device and close their access before the end of the day'
          : 'The checklist is still open',
        urgent: n > 0, sort: n
      });
    });
    d.joinerList.forEach(j => joining.push({
      name: j.name,
      when: j.days === 0 ? 'Starts today'
        : j.days < 0 ? `Starts in ${-j.days} days`
        : `Started ${j.days} day${j.days > 1 ? 's' : ''} ago`,
      why: `${j.steps} step${j.steps > 1 ? 's' : ''} still to do`,
      urgent: j.days >= 7, sort: j.days
    }));
    d.soon.forEach(x => {
      const n = -days(x.expiry_date);
      expiring.push({
        name: x.title,
        when: n < 0 ? `Expired ${-n} days ago` : n === 0 ? 'Expires today' : `Expires in ${n} days`,
        why: 'Needs renewing',
        urgent: n <= 7, sort: -n
      });
    });
  }
  leaving.sort((a, b) => b.sort - a.sort);
  joining.sort((a, b) => b.sort - a.sort);
  expiring.sort((a, b) => b.sort - a.sort);
  const total = leaving.length + joining.length + expiring.length;

  return (
    <div className="wrap">
      <style dangerouslySetInnerHTML={{ __html: homeCss }} />
      <Bar
        title="Bayzat Ops"
        sub="Internal tools for the IT and People teams"
        right={<>{email}<button className="mini" onClick={() => supabase.auth.signOut()}>
          Sign out</button></>}
      />

      <div className="hero">
        <svg className="hero-pattern" width="100%" height="100%" aria-hidden="true">
          <defs>
            <pattern id="heroDots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" style={{ fill: 'var(--accent)' }} opacity="0.12" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroDots)" />
        </svg>
        <div className="hero-inner">
          <p className="hero-eyebrow">Bayzat Ops</p>
          <h1 className="hero-title">
            {greeting()}
            {name ? <span className="hero-name">, {name.charAt(0).toUpperCase() + name.slice(1)}</span> : ''}
          </h1>
          <p className="hero-sub">
            {!d ? 'Checking what needs you…'
              : total === 0
                ? 'Nothing is waiting on you — every joiner, leaver and licence is up to date.'
                : `${total} thing${total > 1 ? 's need' : ' needs'} your attention.`}
          </p>
          {d && d.gaps.length > 0 && (
            <a className="hero-badge" href="/employees">
              {d.gaps.length} record{d.gaps.length > 1 ? 's' : ''} need attention
            </a>
          )}
          {d && <TodayRail leaving={leaving} joining={joining} expiring={expiring} />}
        </div>
      </div>

      {d && total > 0 && (
        <div className="lanes">
          <Lane kind="leaving" title="Leaving" icon={<LaneIcon kind="leaving" />}
            blurb="Collect the device, close their access"
            items={leaving} href="/offboarding" />
          <Lane kind="joining" title="Joining" icon={<LaneIcon kind="joining" />}
            blurb="Set them up before they start"
            items={joining} href="/onboarding" />
          <Lane kind="expiring" title="Expiring" icon={<LaneIcon kind="expiring" />}
            blurb="Licences and cards due for renewal"
            items={expiring} href="/documents" />
        </div>
      )}

      <div className="section-head">
        <h3>Everything you can do</h3>
        <span>{visible.length} tiles</span>
      </div>
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
