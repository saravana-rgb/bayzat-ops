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

function nameInitials(name) {
  const parts = String(name || '').trim().split(/\s+/);
  return (((parts[0] || '?')[0] || '') + ((parts[1] || '')[0] || '')).toUpperCase();
}

/* One place per lane, not two. This replaces what used to be a compact
 * "rail" summary above a separate, more complete lane list below -- with
 * only a couple of people in a lane, those two sections showed the same
 * thing twice, styled two different ways. Now there is exactly one card
 * per lane, carrying everything: a real icon and count in the header,
 * every item in the body, and a press-to-expand for anything past the
 * first two rather than a link elsewhere that repeats the same names. */
function BoardLane({ tone, kind, title, blurb, href, items, person }) {
  const [open, setOpen] = useState(false);
  const urgent = items.filter(i => i.urgent).length;
  const shown = open ? items : items.slice(0, 2);
  const rest = items.length - shown.length;

  return (
    <div className={'board-lane ' + tone}>
      <a className="board-head" href={href}>
        <span className="board-ico"><LaneIcon kind={kind} /></span>
        <span className="board-title">
          {title}
          <span className="board-blurb">{blurb}</span>
        </span>
        <span className={'board-count' + (urgent ? ' hot' : '')}>{items.length}</span>
      </a>

      {items.length === 0 ? (
        <p className="board-empty">Nothing outstanding</p>
      ) : (
        <div className="board-list">
          {shown.map((it, i) => (
            <a key={i} className={'board-item' + (it.urgent ? ' urgent' : '')} href={href}>
              <span className="board-when">{it.when}</span>
              <span className="board-who">
                {person
                  ? <span className="board-avatar">{nameInitials(it.name)}</span>
                  : <span className="board-doc-ico"><Icon name="documents" size={13} /></span>}
                <span className="board-name">{it.name}</span>
              </span>
              <span className="board-why">{it.why}</span>
            </a>
          ))}
          {items.length > 2 && (
            <button className="board-toggle" onClick={() => setOpen(o => !o)}>
              {open ? 'Show less' : `+${rest} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function OpsBoard({ leaving, joining, expiring }) {
  return (
    <div className="board">
      <BoardLane tone="rose" kind="leaving" title="Leaving" href="/offboarding"
        blurb="Collect the device, close their access" items={leaving} person />
      <BoardLane tone="olive" kind="joining" title="Joining" href="/onboarding"
        blurb="Set them up before they start" items={joining} person />
      <BoardLane tone="amber" kind="expiring" title="Expiring" href="/documents"
        blurb="Licences and cards due for renewal" items={expiring} />
    </div>
  );
}

/** One kind of work. Empty lanes still show, so the shape of the day is the
 *  same every morning and a glance tells you which side is busy. */
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

function TimeIcon() {
  const h = new Date().getHours();
  const day = h >= 6 && h < 18;
  const d = day
    ? 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4'
    : 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z';
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: day ? 'var(--amber)' : 'var(--s6)' }} aria-hidden="true">
      {d.split(' M').map((seg, i) => <path key={i} d={(i ? 'M' : '') + seg} />)}
    </svg>
  );
}

function Shell() {
  const [email, setEmail] = useState('');
  const [d, setD] = useState(null);

  const load = useCallback(async () => {
    const [pending, leavers, docs, emp, assetCount] = await Promise.all([
      supabase.from('v_pending_steps').select('ref,days_open,name,label'),
      supabase.from('leavers').select('id,ref,first_name,last_name,status,last_working_day'),
      supabase.from('company_documents').select('id,title,expiry_date,status'),
      supabase.from('employees').select('id,status,asset_type,first_name,last_name,work_email,' +
        'employee_id,hiring_date,location,entity,department,title,reports_to'),
      supabase.from('assets').select('id', { count: 'exact', head: true })
        .is('deleted_at', null)
        .neq('status', 'retired').neq('status', 'released').neq('status', 'returned_to_lessor')
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

    setD({ joinerList, openLeavers, dueLeavers, soon, active, gaps,
           deviceCount: assetCount.count ?? null });
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
            <pattern id="heroTexture" width="88" height="88" patternUnits="userSpaceOnUse">
              <g opacity="0.13" style={{ color: 'var(--accent)' }} stroke="currentColor"
                strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <g transform="translate(6,8) scale(0.7)">
                  <path d="M4 4h16v10H4z" /><path d="M2 18h20l-2-4H4z" />
                </g>
              </g>
              <g opacity="0.11" style={{ color: 'var(--s1)' }} stroke="currentColor"
                strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <g transform="translate(52,10) scale(0.6)">
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><path d="M4 20a8 8 0 0 1 16 0" />
                </g>
              </g>
              <g opacity="0.11" style={{ color: 'var(--s4)' }} stroke="currentColor"
                strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <g transform="translate(28,52) scale(0.6)">
                  <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" />
                </g>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroTexture)" />
        </svg>
        <div className="hero-inner">
          <p className="hero-eyebrow reveal r1">Bayzat Ops</p>
          <div className="hero-row reveal r2">
            <TimeIcon />
            <h1 className="hero-title">
              {greeting()}
              {name ? <span className="hero-name">, {name.charAt(0).toUpperCase() + name.slice(1)}</span> : ''}
            </h1>
          </div>
          <p className="hero-sub reveal r3">
            {!d ? 'Checking what needs you…'
              : total === 0
                ? 'Nothing is waiting on you — every joiner, leaver and licence is up to date.'
                : `${total} thing${total > 1 ? 's need' : ' needs'} your attention.`}
          </p>

          {d && leaving.length > 0 && (
            <a className="hero-cta reveal r3" href="/offboarding">Open the leaver checklist</a>
          )}

          {d && (
            <div className="hero-stats reveal r4">
              <div className="hstat"><b>{d.active.length}</b><span>People</span></div>
              {d.deviceCount !== null && (
                <div className="hstat"><b>{d.deviceCount}</b><span>Devices</span></div>
              )}
            </div>
          )}
        </div>
      </div>

      {d && <OpsBoard leaving={leaving} joining={joining} expiring={expiring} />}

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
