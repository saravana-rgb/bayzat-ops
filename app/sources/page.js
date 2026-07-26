'use client';
import { useEffect, useState } from 'react';
import { AuthGate, Bar, isAdmin, sources, supabase } from '../shared';

/* The list lives in shared.js under `sources` — add an entry there and it
   appears here, under whichever group you give it. */

const CSS = `
.src{display:flex;align-items:flex-start;gap:13px;background:var(--surface);
  border:1px solid var(--line);border-radius:13px;padding:15px 16px;
  transition:border-color .18s var(--ease),transform .18s var(--ease),box-shadow .18s var(--ease)}
.src:hover{border-color:var(--teal);transform:translateY(-1px);box-shadow:var(--shadow)}
.src-ico{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;
  font-size:14px;flex:none;font-weight:700}
.src-ico.green{background:var(--emerald-soft);color:var(--emerald)}
.src-ico.amber{background:var(--amber-soft);color:var(--amber)}
.src-ico.accent{background:var(--indigo-soft);color:var(--indigo-ink)}
.src-ico.grey{background:var(--line2);color:var(--ink3)}
.src-body{flex:1;min-width:170px}
.src-name{font-size:14px;font-weight:700;letter-spacing:-.2px;display:flex;align-items:center;
  gap:8px;flex-wrap:wrap}
.src-desc{font-size:12.5px;color:var(--ink2);font-weight:500;line-height:1.5;margin-top:4px}
.src-detail{font:600 11px Inter;color:var(--ink3);margin-top:8px;background:var(--sunk);
  border:1px solid var(--line2);border-radius:7px;padding:6px 10px;display:inline-block}
.src-act{margin-left:auto;align-self:center}
.locked{background:var(--teal-soft);border:1px solid #B5E2DC;border-radius:12px;
  padding:13px 16px;margin-bottom:18px;display:flex;align-items:center;gap:10px}
.locked b{font-size:12.5px;font-weight:700;color:var(--teal-ink)}
.locked span{font-size:12px;color:var(--teal-ink);opacity:.85;font-weight:500}
`;

export default function SourcesPage() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  const [email, setEmail] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);

  if (email === null) return <div className="center"><p>Loading…</p></div>;

  if (!isAdmin(email)) {
    return (
      <div className="center">
        <div className="card">
          <h1 style={{ fontSize: 17, fontWeight: 700 }}>Not your page</h1>
          <p style={{ fontSize: 13, color: 'var(--ink3)', margin: '9px 0 20px', lineHeight: 1.55 }}>
            Sources is limited to the person who maintains these systems.
          </p>
          <a className="btn" href="/">Back to tiles</a>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Bar
        title="Sources"
        sub="Everything these tiles are built on"
        right={<a className="back" href="/">← All tiles</a>}
      />

      <div className="locked">
        <span style={{ fontSize: 15 }}>⚷</span>
        <div>
          <b>Only you can see this page</b><br />
          <span>Each service still asks for its own login when you open it.</span>
        </div>
      </div>

      {sources.map(g => (
        <div key={g.group}>
          <div className="sec calm">{g.group}</div>
          <div className="grid">
            {g.items.map(s => (
              <div key={s.name + s.url} className="src">
                <div className={'src-ico ' + (s.tone || 'grey')}>▤</div>
                <div className="src-body">
                  <div className="src-name">
                    {s.name}
                    <span className={'chip ' + (s.tone === 'green' ? 'green'
                      : s.tone === 'amber' ? 'amber' : s.tone === 'accent' ? 'accent' : 'grey')}>
                      {s.kind}
                    </span>
                  </div>
                  <div className="src-desc">{s.desc}</div>
                  {s.detail && <div className="src-detail">{s.detail}</div>}
                </div>
                <a className="btn teal src-act" href={s.url} target="_blank" rel="noopener noreferrer">
                  Open
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
