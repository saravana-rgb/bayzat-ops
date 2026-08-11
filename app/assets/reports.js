'use client';
import { useMemo } from 'react';
import { OWNERSHIP_LABEL, pretty, describe, handle } from './shared';

export default function Reports({ assets }) {
  const live = useMemo(() => assets.filter(a =>
    !['retired', 'released', 'returned_to_lessor'].includes(a.status)), [assets]);

  const byCategory = useMemo(() => {
    const m = {};
    live.forEach(a => {
      const k = a.category_label || a.category;
      m[k] = m[k] || { label: k, total: 0, free: 0 };
      m[k].total++;
      if (a.status === 'in_stock') m[k].free++;
    });
    return Object.values(m).sort((x, y) => y.total - x.total);
  }, [live]);
  const mostCat = byCategory[0]?.total || 1;

  const byOwn = useMemo(() => {
    const m = {};
    live.forEach(a => { m[a.ownership] = (m[a.ownership] || 0) + 1; });
    return Object.keys(m).map(k => ({ key: k, label: OWNERSHIP_LABEL[k] || k, n: m[k] }))
      .sort((x, y) => y.n - x.n);
  }, [live]);
  const mostOwn = byOwn[0]?.n || 1;

  const expiring = useMemo(() => assets.filter(a =>
    !['retired', 'released', 'returned_to_lessor'].includes(a.status)
    && a.warranty_days !== null && a.warranty_days !== undefined && a.warranty_days <= 60
  ).sort((x, y) => x.warranty_days - y.warranty_days), [assets]);

  const untracked = useMemo(() => live.filter(a => !a.serial || !String(a.serial).trim()), [live]);

  const longHeld = useMemo(() => assets.filter(a =>
    a.assignment_id && a.days_held !== null && a.days_held >= 1095
  ).sort((x, y) => y.days_held - x.days_held), [assets]);

  const missing = useMemo(() => assets.filter(a => a.status === 'missing'), [assets]);

  if (assets.length === 0) {
    return <div className="empty"><b>Nothing to report on yet</b></div>;
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>

      <div className="panelbox">
        <div className="bt">What we hold</div>
        <p className="note-txt" style={{ marginBottom: 14 }}>In stock against the total, by kind.</p>
        {byCategory.map(c => (
          <div className="mrow" key={c.label}>
            <span className="mlbl">{c.label}</span>
            <span className="mtrack"><span className="mfill p1" style={{ width: (c.total / mostCat * 100) + '%' }} /></span>
            <span className="mval">{c.total}</span>
          </div>
        ))}
        <p className="foot-note">
          {byCategory.reduce((n, c) => n + c.free, 0)} free to assign.
        </p>
      </div>

      <div className="panelbox">
        <div className="bt">Who owns it</div>
        <p className="note-txt" style={{ marginBottom: 14 }}>
          Personal devices never come back — they are released.
        </p>
        {byOwn.map(o => (
          <div className="mrow" key={o.key}>
            <span className="mlbl">{o.label}</span>
            <span className="mtrack"><span className="mfill p4" style={{ width: (o.n / mostOwn * 100) + '%' }} /></span>
            <span className="mval">{o.n}</span>
          </div>
        ))}
      </div>

      <div className="panelbox">
        <div className="bt">Running out</div>
        <p className="note-txt" style={{ marginBottom: 14 }}>
          Warranty or lease inside two months — the same horizon as documents.
        </p>
        {expiring.length === 0 ? <p className="note-txt">All good.</p> : expiring.slice(0, 12).map(a => (
          <div className="mrow" key={a.id}>
            <span className="mlbl" style={{ width: 'auto', flex: 1 }}>
              {handle(a)} <span className="note-txt">{describe(a)}</span>
            </span>
            <span className={a.warranty_days < 0 ? 'chip red' : 'chip amber'}>
              {a.warranty_days < 0 ? 'ended ' + pretty(a.warranty_until) : a.warranty_days + 'd'}
            </span>
          </div>
        ))}
      </div>

      <div className="panelbox">
        <div className="bt">Held a long time</div>
        <p className="note-txt" style={{ marginBottom: 14 }}>Three years or more with the same person.</p>
        {longHeld.length === 0 ? <p className="note-txt">Nothing that old.</p> : longHeld.slice(0, 12).map(a => (
          <div className="mrow" key={a.id}>
            <span className="mlbl" style={{ width: 'auto', flex: 1 }}>
              {handle(a)} <span className="note-txt">{a.holder || a.holder_email}</span>
            </span>
            <span className="mval">{Math.floor(a.days_held / 365)}y</span>
          </div>
        ))}
      </div>

      <div className="panelbox">
        <div className="bt">No serial recorded</div>
        <p className="note-txt" style={{ marginBottom: 14 }}>
          Fine for a monitor. Not fine for anything that holds data.
        </p>
        {untracked.length === 0 ? <p className="note-txt">Everything has one.</p> : untracked.slice(0, 12).map(a => (
          <div className="mrow" key={a.id}>
            <span className="mlbl" style={{ width: 'auto', flex: 1 }}>
              {handle(a)} <span className="note-txt">{describe(a)}</span>
            </span>
            <span className="chip grey">{a.category_label}</span>
          </div>
        ))}
      </div>

      <div className="panelbox">
        <div className="bt">Unaccounted for</div>
        <p className="note-txt" style={{ marginBottom: 14 }}>
          Closed out without coming back. Stays here until resolved.
        </p>
        {missing.length === 0 ? <p className="note-txt">Nothing missing.</p> : missing.map(a => (
          <div className="mrow" key={a.id}>
            <span className="mlbl" style={{ width: 'auto', flex: 1 }}>
              {handle(a)} <span className="note-txt">{describe(a)}</span>
            </span>
            <span className="chip red">{a.holder || a.holder_email || '—'}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
