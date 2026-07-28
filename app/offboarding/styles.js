/* Styles owned by the Offboarding tile. Nothing else uses these. */
export const offboardingCss = `
/* the seven checklist colours */
.seg.ofb{background:var(--line)}
.seg.ofb.done{background:var(--emerald)}
.seg.ofb.progress{background:var(--amber)}
.seg.ofb.na{background:var(--line2);border:1px solid var(--line)}
.seg.ofb.blocked{background:var(--rose)}

.blockline{font-size:12.5px;color:var(--rose);background:var(--rose-soft);
  border-radius:var(--r);padding:8px 11px;margin-top:10px;line-height:1.55}

.assetbox{border:1px solid var(--line);border-left:2px solid var(--s2);
  border-radius:0 var(--r) var(--r) 0;padding:14px 16px;margin:16px 0 4px}
.assetbox b{display:block;font-size:14px;font-weight:600;margin-bottom:4px}
.assetbox span{font-size:12.5px;color:var(--ink3);line-height:1.6}

.people{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);
  border-radius:var(--r-lg);overflow:hidden}
.person{display:flex;align-items:center;gap:14px;background:var(--surface);
  padding:13px 16px;flex-wrap:wrap}
.person .ini{width:34px;height:34px;border-radius:50%;background:var(--accent-soft);
  color:var(--accent);display:grid;place-items:center;font:600 12px var(--font);flex:none}
.who{flex:1;min-width:160px;display:grid;gap:3px}
.who .nm{font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.who .sub{font-size:12px;color:var(--ink3)}
.person .col{flex:none}

.ini.big{width:46px;height:46px;border-radius:50%;background:var(--accent-soft);
  color:var(--accent);display:grid;place-items:center;font:600 16px var(--font);flex:none}
.drawer-sub{font-size:12.5px;color:var(--ink3);margin-top:5px}
.drawer-flags{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 4px}
.panel.wide{max-width:720px}
.frow{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:4px}
.frow > div{flex:1;min-width:170px}

.bar-row.clickable{width:100%;border:0;background:transparent;cursor:pointer;
  font-family:var(--font);border-radius:var(--r);padding:6px 8px;margin-left:-8px;
  transition:background .12s var(--ease)}
.bar-row.clickable:hover:not(:disabled){background:var(--sunk)}
.bar-row.clickable:disabled{cursor:default;opacity:.55}
button.col{border:0;font-family:var(--font)}
button.col:disabled{cursor:default;opacity:.6}

.drilllist{margin-top:16px;display:grid;gap:1px;background:var(--line);
  border:1px solid var(--line);border-radius:var(--r);overflow:hidden;max-height:52vh;
  overflow-y:auto}
.drillrow{display:flex;align-items:center;gap:13px;background:var(--surface);padding:11px 14px}

@media(max-width:820px){.hide-sm{display:none}}
`;
