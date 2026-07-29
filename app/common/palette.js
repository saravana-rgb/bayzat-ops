'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './shared';

/* Press Cmd+K, or / anywhere outside a text field, and search everything at
   once — people, leavers, documents, joiners. Type a few letters of a name
   and go straight there rather than picking a tile and then searching again.

   Nothing loads until it is opened, so it costs nothing on pages that never
   use it. */

const KINDS = {
  employee: { label: 'Person',   href: '/employees',   tone: 's1' },
  leaver:   { label: 'Leaver',   href: '/offboarding', tone: 's5' },
  document: { label: 'Document', href: '/documents',   tone: 's3' },
  joiner:   { label: 'Joiner',   href: '/onboarding',  tone: 's4' }
};

const ACTIONS = [
  { id: 'a1', title: 'Onboarding board',      sub: 'Who is joining and what IT owes them', href: '/onboarding' },
  { id: 'a2', title: 'Offboarding board',     sub: 'Who is leaving and what we need back', href: '/offboarding' },
  { id: 'a3', title: 'Employee directory',    sub: 'Everyone, and what is missing',        href: '/employees' },
  { id: 'a4', title: 'Company documents',     sub: 'Licences, cards, letterheads, stamps', href: '/documents' },
  { id: 'a5', title: 'Records needing attention', sub: 'Employees with gaps',              href: '/employees' },
  { id: 'a6', title: 'Documents expiring',    sub: 'Anything due for renewal',             href: '/documents' }
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [rows, setRows] = useState(null);
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault(); setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const load = useCallback(async () => {
    const [emp, lv, doc, tix] = await Promise.all([
      supabase.from('employees').select('id,first_name,last_name,work_email,title,department,status'),
      supabase.from('leavers').select('id,ref,first_name,last_name,department,status,last_working_day'),
      supabase.from('company_documents').select('id,ref,title,category,entity,status,expiry_date'),
      supabase.from('tickets').select('id,ref,first_name,last_name,location,status,doj')
    ]);
    const out = [];
    (emp.data || []).filter(e => e.status !== 'deleted').forEach(e => out.push({
      id: 'e' + e.id, kind: 'employee',
      title: [e.first_name, e.last_name].filter(Boolean).join(' '),
      sub: [e.title, e.department, e.work_email].filter(Boolean).join(' · '),
      hay: [e.first_name, e.last_name, e.work_email, e.title, e.department].join(' ')
    }));
    (lv.data || []).forEach(l => out.push({
      id: 'l' + l.id, kind: 'leaver',
      title: [l.first_name, l.last_name].filter(Boolean).join(' '),
      sub: [l.ref, l.department, l.status].filter(Boolean).join(' · '),
      hay: [l.first_name, l.last_name, l.ref, l.department].join(' ')
    }));
    (doc.data || []).filter(d => d.status !== 'deleted').forEach(d => out.push({
      id: 'd' + d.id, kind: 'document', title: d.title,
      sub: [d.ref, d.entity, d.category?.replace('_', ' ')].filter(Boolean).join(' · '),
      hay: [d.title, d.ref, d.entity, d.category].join(' ')
    }));
    (tix.data || []).forEach(t => out.push({
      id: 't' + t.id, kind: 'joiner',
      title: [t.first_name, t.last_name].filter(Boolean).join(' '),
      sub: [t.ref, t.location, t.status].filter(Boolean).join(' · '),
      hay: [t.first_name, t.last_name, t.ref, t.location].join(' ')
    }));
    setRows(out);
  }, []);

  useEffect(() => {
    if (!open) { setQ(''); setSel(0); return; }
    if (!rows) load();
    setTimeout(() => inputRef.current?.focus(), 30);
  }, [open, rows, load]);

  if (!open) return null;

  const term = q.trim().toLowerCase();
  const hits = !term
    ? ACTIONS.map(a => ({ ...a, kind: 'action' }))
    : (rows || []).filter(r => r.hay.toLowerCase().includes(term)).slice(0, 40);

  function go(hit) {
    setOpen(false);
    const href = hit.kind === 'action' ? hit.href : KINDS[hit.kind].href;
    window.location.href = href;
  }

  function keys(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, hits.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && hits[sel]) { e.preventDefault(); go(hits[sel]); }
  }

  return (
    <div className="pveil" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="palette">
        <input ref={inputRef} className="pinput" value={q} onKeyDown={keys}
          placeholder="Search anyone, any document, any reference…"
          onChange={e => { setQ(e.target.value); setSel(0); }} />

        <div className="plist">
          {!rows && term
            ? <p className="pempty">Looking…</p>
            : hits.length === 0
              ? <p className="pempty">Nothing matches “{q}”.</p>
              : hits.map((h, i) => (
                  <button key={h.id} className="prow" data-on={i === sel ? '1' : '0'}
                    onMouseEnter={() => setSel(i)} onClick={() => go(h)}>
                    <span className={'pkind ' + (h.kind === 'action' ? 'act' : KINDS[h.kind].tone)}>
                      {h.kind === 'action' ? 'GO' : KINDS[h.kind].label}
                    </span>
                    <span className="pbody">
                      <span className="ptitle">{h.title}</span>
                      {h.sub && <span className="psub">{h.sub}</span>}
                    </span>
                  </button>
                ))}
        </div>

        <div className="pfoot">
          <span><kbd>↑</kbd><kbd>↓</kbd> to move</span>
          <span><kbd>enter</kbd> to open</span>
          <span><kbd>esc</kbd> to close</span>
          <span style={{ marginLeft: 'auto' }}>{rows ? rows.length + ' searchable' : ''}</span>
        </div>
      </div>
    </div>
  );
}
