'use client';

import { useMemo } from 'react';
import { S, C, STATUS_COLOUR } from './styles';
import { Pill, Empty, ownershipLabel, pretty, describe, handle } from './shared';

/* Reports live inside the tile, as a switch on the same page. Nothing here
   fetches — the register is already loaded, so these are views of it. */

export default function Reports({ assets }) {
  const live = useMemo(function () {
    return assets.filter(function (a) {
      return ['retired', 'released', 'returned_to_lessor'].indexOf(a.status) === -1;
    });
  }, [assets]);

  const byCategory = useMemo(function () {
    const m = {};
    live.forEach(function (a) {
      const k = a.category_label || a.category;
      if (!m[k]) m[k] = { label: k, total: 0, free: 0 };
      m[k].total += 1;
      if (a.status === 'in_stock') m[k].free += 1;
    });
    return Object.values(m).sort(function (x, y) { return y.total - x.total; });
  }, [live]);

  const byOwnership = useMemo(function () {
    const m = {};
    live.forEach(function (a) {
      m[a.ownership] = (m[a.ownership] || 0) + 1;
    });
    return Object.keys(m).map(function (k) {
      return { key: k, label: ownershipLabel(k), n: m[k] };
    }).sort(function (x, y) { return y.n - x.n; });
  }, [live]);

  const expiring = useMemo(function () {
    return assets.filter(function (a) {
      if (['retired', 'released', 'returned_to_lessor'].indexOf(a.status) > -1) return false;
      return a.warranty_days !== null && a.warranty_days !== undefined
             && a.warranty_days <= 60;
    }).sort(function (x, y) { return x.warranty_days - y.warranty_days; });
  }, [assets]);

  const untracked = useMemo(function () {
    return live.filter(function (a) {
      return !a.serial || !String(a.serial).trim();
    });
  }, [live]);

  const longHeld = useMemo(function () {
    return assets.filter(function (a) {
      return a.assignment_id && a.days_held !== null && a.days_held >= 1095;
    }).sort(function (x, y) { return y.days_held - x.days_held; });
  }, [assets]);

  const missing = useMemo(function () {
    return assets.filter(function (a) { return a.status === 'missing'; });
  }, [assets]);

  const most = byCategory.length > 0 ? byCategory[0].total : 1;
  const mostOwn = byOwnership.length > 0 ? byOwnership[0].n : 1;

  if (assets.length === 0) {
    return <Empty>Nothing to report on yet.</Empty>;
  }

  return (
    <div style={S.grid}>

      <div style={S.cardBox}>
        <div style={S.cardTitle}>What we hold</div>
        <div style={S.cardSub}>In stock against the total, by kind.</div>
        {byCategory.map(function (c) {
          return (
            <div key={c.label} style={S.barRow}>
              <div style={S.barLabel}>{c.label}</div>
              <div style={S.barTrack}>
                <div style={{ ...S.barFill, width: (c.total / most * 100) + '%',
                              background: C.teal }} />
              </div>
              <div style={S.barValue}>{c.total}</div>
            </div>
          );
        })}
        <div style={{ ...S.cardSub, marginTop: 12, marginBottom: 0 }}>
          {byCategory.reduce(function (n, c) { return n + c.free; }, 0)} free to assign.
        </div>
      </div>

      <div style={S.cardBox}>
        <div style={S.cardTitle}>Who owns it</div>
        <div style={S.cardSub}>
          Employee-owned devices never come back — they are released.
        </div>
        {byOwnership.map(function (o) {
          const tone = o.key === 'byod' ? C.ochre
                     : o.key === 'leased' ? C.aubergine : C.teal;
          return (
            <div key={o.key} style={S.barRow}>
              <div style={S.barLabel}>{o.label}</div>
              <div style={S.barTrack}>
                <div style={{ ...S.barFill, width: (o.n / mostOwn * 100) + '%',
                              background: tone }} />
              </div>
              <div style={S.barValue}>{o.n}</div>
            </div>
          );
        })}
      </div>

      <div style={S.cardBox}>
        <div style={S.cardTitle}>Running out</div>
        <div style={S.cardSub}>
          Warranty or lease inside two months, the same horizon as documents.
        </div>
        {expiring.length > 0 ? expiring.slice(0, 12).map(function (a) {
          return (
            <div key={a.id} style={S.barRow}>
              <div style={{ ...S.barLabel, width: 'auto', flex: 1 }}>
                {handle(a)} <span style={S.eventWho}>{describe(a)}</span>
              </div>
              <div style={a.warranty_days < 0 ? S.alarm : S.warn}>
                {a.warranty_days < 0
                  ? 'ended ' + pretty(a.warranty_until)
                  : a.warranty_days + ' days'}
              </div>
            </div>
          );
        }) : <div style={S.cardSub}>All good.</div>}
      </div>

      <div style={S.cardBox}>
        <div style={S.cardTitle}>Held a long time</div>
        <div style={S.cardSub}>Three years or more with the same person.</div>
        {longHeld.length > 0 ? longHeld.slice(0, 12).map(function (a) {
          return (
            <div key={a.id} style={S.barRow}>
              <div style={{ ...S.barLabel, width: 'auto', flex: 1 }}>
                {handle(a)} <span style={S.eventWho}>{a.holder || a.holder_email}</span>
              </div>
              <div style={S.barValue}>
                {Math.floor(a.days_held / 365)}y
              </div>
            </div>
          );
        }) : <div style={S.cardSub}>Nothing that old.</div>}
      </div>

      <div style={S.cardBox}>
        <div style={S.cardTitle}>No serial recorded</div>
        <div style={S.cardSub}>
          Fine for a monitor. Not fine for anything that holds data.
        </div>
        {untracked.length > 0 ? untracked.slice(0, 12).map(function (a) {
          return (
            <div key={a.id} style={S.barRow}>
              <div style={{ ...S.barLabel, width: 'auto', flex: 1 }}>
                {handle(a)} <span style={S.eventWho}>{describe(a)}</span>
              </div>
              <Pill subtle tone={C.ochre}>{a.category_label}</Pill>
            </div>
          );
        }) : <div style={S.cardSub}>Everything has one.</div>}
      </div>

      <div style={S.cardBox}>
        <div style={S.cardTitle}>Unaccounted for</div>
        <div style={S.cardSub}>
          Closed out without coming back. These stay here until resolved.
        </div>
        {missing.length > 0 ? missing.map(function (a) {
          return (
            <div key={a.id} style={S.barRow}>
              <div style={{ ...S.barLabel, width: 'auto', flex: 1 }}>
                {handle(a)} <span style={S.eventWho}>{describe(a)}</span>
              </div>
              <div style={{ ...S.barValue, width: 'auto',
                            color: STATUS_COLOUR.missing }}>
                {a.holder || a.holder_email || '—'}
              </div>
            </div>
          );
        }) : <div style={S.cardSub}>Nothing missing.</div>}
      </div>

    </div>
  );
}
