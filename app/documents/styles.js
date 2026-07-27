/* Styles owned by the Documents tile. Nothing else uses these. */
export const documentsCss = `
/* ------------------------------------------------------- documents */
.busy{background:var(--sunk);border:1px solid var(--line);border-radius:var(--r);
  padding:11px 15px;font:400 13px var(--font);color:var(--ink2);margin-bottom:18px}
.uprow{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end}

.doccard{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  overflow:hidden;transition:border-color .18s var(--ease)}
.doccard:hover{border-color:var(--ink3)}
.doc-top{display:flex;align-items:flex-start;gap:15px;padding:20px 22px;cursor:pointer;
  flex-wrap:wrap}
.doc-ico{width:42px;height:42px;border-radius:var(--r);display:grid;place-items:center;
  font:600 10.5px var(--font);letter-spacing:.4px;flex:none}

/* every category gets its own colour, so the shelf reads at a glance */
.doccard{border-left:2px solid var(--line)}
.doccard.trade_license      {border-left-color:#1D4ED8}
.doccard.establishment_card {border-left-color:#B45309}
.doccard.letterhead         {border-left-color:#0F766E}
.doccard.stamp              {border-left-color:#9D174D}
.doccard.other              {border-left-color:#57534E}
.doc-ico.trade_license      {background:#EAF0FE;color:#1D4ED8}
.doc-ico.establishment_card {background:#FCF3E7;color:#B45309}
.doc-ico.letterhead         {background:#E9F5F3;color:#0F766E}
.doc-ico.stamp              {background:#FBECF1;color:#9D174D}
.doc-ico.other              {background:var(--sunk);color:var(--ink2);border:1px solid var(--line)}
.doc-name{font-size:15px;font-weight:600;letter-spacing:-.2px;display:flex;align-items:center;
  gap:9px;flex-wrap:wrap}
.doc-meta{font-size:12.5px;color:var(--ink3);font-weight:400;margin-top:6px;line-height:1.6}
.doc-acts{display:flex;gap:8px;padding:14px 22px;border-top:1px solid var(--line2);
  background:var(--sunk);flex-wrap:wrap}
.mini.danger{border-color:#E7C3CD;color:var(--rose)}
.mini.danger:hover{background:var(--rose);border-color:var(--rose);color:#fff}

.ai-note{font-size:13px;color:var(--ink2);line-height:1.7;background:var(--sunk);
  border-left:2px solid var(--s3);border-radius:0 var(--r) var(--r) 0;padding:13px 16px;
  margin:16px 0 4px}
.kv{border-collapse:collapse;width:100%;margin-top:16px}
.kv td{padding:9px 0;border-bottom:1px solid var(--line2);font-size:13.5px;vertical-align:top}
.kv td:first-child{color:var(--ink3);font-weight:400;width:120px;font-size:12.5px;padding-right:16px}
.kv tr:last-child td{border-bottom:0}

.fields{margin-top:18px;border-top:1px solid var(--line2);padding-top:18px}
.frow{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px}
.frow > div{flex:1;min-width:150px}
.frow .note-txt{flex:1;min-width:180px}
.frow .btn{flex:none}
`;
