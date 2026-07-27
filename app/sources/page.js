'use client';
import { useEffect, useState } from 'react';
import { AuthGate, Bar, supabase } from '../common/shared';
import { isAdmin } from '../common/tiles';
import { sources } from './shared';

/* The list lives in shared.js under `sources` — add an entry there and it
   appears here, under whichever group you give it. */


/** Two letters standing in for an icon, so nothing depends on a font glyph. */
function initials(kind) {
  const map = { 'Google Sheet': 'GS', 'Automation': 'AS', 'Code': 'GH',
                'Database': 'DB', 'Hosting': 'VC' };
  return map[kind] || (kind || '?').slice(0, 2).toUpperCase();
}

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
      <Bar
        title="Sources"
        sub="Everything these tiles are built on"
        right={<a className="back" href="/">← All tiles</a>}
      />

      <div className="locked">
        <span className="tag">PRIVATE</span>
        <div>
          <b>Only you can see this page</b>
          <span>Each service still asks for its own login when you open it.</span>
        </div>
      </div>

      {sources.map(g => (
        <div key={g.group}>
          <div className="sec">{g.group}</div>
          <div className="grid">
            {g.items.map(s => (
              <div key={s.name + s.url} className="src">
                <div className={'src-ico ' + (s.tone || 'grey')}>{initials(s.kind)}</div>
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
                <a className="btn src-act" href={s.url} target="_blank" rel="noopener noreferrer">
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
