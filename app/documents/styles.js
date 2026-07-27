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
.doccard.trade_license      {border-left-color:var(--s2)}
.doccard.establishment_card {border-left-color:var(--s1)}
.doccard.letterhead         {border-left-color:var(--s3)}
.doccard.stamp              {border-left-color:var(--s5)}
.doccard.other              {border-left-color:var(--s4)}
.doc-ico.trade_license      {background:var(--s2-soft);color:var(--s2)}
.doc-ico.establishment_card {background:var(--s1-soft);color:var(--s1)}
.doc-ico.letterhead         {background:var(--s3-soft);color:var(--s3)}
.doc-ico.stamp              {background:var(--s5-soft);color:var(--s5)}
.doc-ico.other              {background:var(--s4-soft);color:var(--s4)}
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

/* delete confirmation */
.panel.confirm{max-width:480px}
.confirm-head{display:flex;gap:15px;align-items:flex-start;margin-bottom:20px}
.confirm-head h2{font-size:17px;font-weight:600;letter-spacing:-.2px}
.confirm-head p{font-size:13px;color:var(--ink3);margin-top:6px;display:flex;align-items:center;
  gap:8px;flex-wrap:wrap}
.confirm-facts{list-style:none;margin:0 0 22px;padding:16px 18px;background:var(--sunk);
  border-radius:var(--r);display:grid;gap:10px}
.confirm-facts li{font-size:12.5px;color:var(--ink2);line-height:1.6;padding-left:18px;
  position:relative}
.confirm-facts li::before{content:'';position:absolute;left:0;top:7px;width:6px;height:6px;
  border-radius:50%;background:var(--ink3)}
.confirm-facts b{font-weight:600;color:var(--ink)}
.reasons{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}
.reason{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:var(--r);padding:8px 13px;font:500 12.5px var(--font);cursor:pointer;
  transition:all .15s var(--ease)}
.reason:hover{border-color:var(--ink3);color:var(--ink)}
.reason[data-on="1"]{background:var(--rose);border-color:var(--rose);color:#fff}
.confirm-acts{display:flex;gap:10px;margin-top:22px;flex-wrap:wrap}
.confirm-acts .btn{flex:1;min-width:150px}
.btn.danger{background:var(--rose);border-color:var(--rose)}
.btn.danger:hover{background:#7F2029;border-color:#7F2029}
.btn.danger:disabled{background:var(--line);border-color:var(--line);color:var(--ink3)}

.binline{font-size:11.5px;color:var(--rose);background:var(--rose-soft);border-radius:var(--r);
  padding:8px 11px;margin-top:9px;line-height:1.55;display:inline-block}
.doccard.deleted{border-left-color:var(--rose);background:#FFFDFD}
`;
