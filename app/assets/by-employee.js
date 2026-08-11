'use client';
import { useMemo, useState } from 'react';
import { STATUS_LABEL, statusClass, pretty, describe, handle } from './shared';

/* Not a fetch — v_assets already carries the open assignment on every row,
 * so grouping by holder is a reshape of what the register already loaded.
 * An asset with no open assignment has no holder and does not appear here;
 * that is what makes this "who has what now" rather than "everything". */
export default function ByEmployee({ assets }) {
  const [q, setQ] = useState('');

  const groups = useMemo(() => {
    const m = new Map();
    assets.forEach(a => {
      if (!a.assignment_id) return;
      const key = a.holder_id || (a.holder_email || '').toLowerCase() || a.holder || a.id;
      if (!m.has(key)) {
        m.set(key, { key, name: a.holder || a.holder_email || 'Unknown',
                      email: a.holder_email || '', items: [] });
      }
      m.get(key).items.push(a);
    });
    return [...m.values()].sort((x, y) => x.name.localeCompare(y.name));
  }, [assets]);

  const needle = q.trim().toLowerCase();
  const shown = !needle ? groups : groups.filter(g =>
    (g.name + ' ' + g.email).toLowerCase().includes(needle)
    || g.items.some(a => (handle(a) + ' ' + describe(a)).toLowerCase().includes(needle)));

  return (
    <>
      <div className="toolbar">
        <input className="search" value={q} placeholder="Employee name, email, or an asset"
          onChange={e => setQ(e.target.value)} />
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <b>{groups.length === 0 ? 'Nothing is assigned to anyone yet' : 'No one matches that'}</b>
        </div>
      ) : shown.map(g => (
        <div key={g.key} className="panelbox" style={{ marginBottom: 10 }}>
          <div className="grp-head">
            <div>
              <span className="grp-name">{g.name}</span>
              {g.email && <span className="grp-email">{g.email}</span>}
            </div>
            <span className="grp-count">{g.items.length} asset{g.items.length === 1 ? '' : 's'}</span>
          </div>
          <div className="grp-list">
            {g.items.map(a => (
              <div key={a.id} className={'grp-item ' + statusClass(a.status)}>
                <span className="a-ref">{handle(a)}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{describe(a)}</span>
                <span className="note-txt">since {pretty(a.assigned_on)}</span>
                <span className={'chip ' + statusClass(a.status)}>
                  {STATUS_LABEL[a.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
