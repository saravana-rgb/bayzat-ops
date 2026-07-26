'use client';
import { AuthGate, Bar, sheets } from '../shared';

/* The list itself lives in shared.js under `sheets` — add a row there and it
   shows up here. Nothing else needs changing. */

const CSS = `
.sheet-row{display:flex;align-items:flex-start;gap:14px;background:var(--surface);
  border:1px solid var(--line);border-radius:14px;padding:17px 18px;
  transition:border-color .18s var(--ease),transform .18s var(--ease),box-shadow .18s var(--ease)}
.sheet-row:hover{border-color:var(--accent);transform:translateY(-1px);box-shadow:var(--shadow)}
.sheet-ico{width:36px;height:36px;border-radius:9px;background:var(--green-soft);color:var(--green);
  display:grid;place-items:center;font-size:15px;flex:none}
.sheet-body{flex:1;min-width:170px}
.sheet-name{font-size:14.5px;font-weight:700;letter-spacing:-.2px;display:flex;
  align-items:center;gap:8px;flex-wrap:wrap}
.sheet-desc{font-size:12.5px;color:var(--ink2);font-weight:500;line-height:1.55;margin-top:5px}
.sheet-cols{font:600 11px Inter;color:var(--ink3);margin-top:8px;background:var(--sunk);
  border:1px solid var(--line2);border-radius:7px;padding:7px 10px;display:inline-block}
.sheet-act{margin-left:auto;align-self:center}
.note-box{background:var(--surface);border:1px solid var(--line);border-radius:14px;
  padding:17px 18px;margin-top:18px}
.note-box h3{font-size:12.5px;font-weight:700;margin-bottom:7px}
.note-box p{font-size:12.5px;color:var(--ink3);font-weight:500;line-height:1.6}
`;

export default function SheetsPage() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  return (
    <div className="wrap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Bar
        title="Onboarding sheets"
        sub="The Google Sheets this flow reads from"
        right={<a className="back" href="/">← All tiles</a>}
      />

      <div className="grid">
        {sheets.map(s => (
          <div key={s.url} className="sheet-row">
            <div className="sheet-ico">▤</div>
            <div className="sheet-body">
              <div className="sheet-name">
                {s.name}
                {s.tag && <span className="chip accent">{s.tag}</span>}
              </div>
              <div className="sheet-desc">{s.desc}</div>
              {s.columns && <div className="sheet-cols">{s.columns}</div>}
            </div>
            <a className="btn sheet-act" href={s.url} target="_blank" rel="noopener noreferrer">
              Open sheet
            </a>
          </div>
        ))}
      </div>

      <div className="note-box">
        <h3>How a row becomes a ticket</h3>
        <p>
          Apps Script checks the source sheet every five minutes, including rows that arrive
          through IMPORTRANGE. Anything it has not seen before becomes a ticket with six steps,
          and you get an email straight away. Nothing here needs to be edited by hand — add the
          joiner to the sheet and the rest follows.
        </p>
      </div>
    </div>
  );
}
