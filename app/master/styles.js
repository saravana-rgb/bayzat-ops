/* Styles owned by the Master employees tile. Nothing else uses these. */
export const masterCss = `
.facets{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:18px}
.facetsel{width:auto;min-width:150px;font-size:12.5px;padding:8px 11px}
.facets .count{margin-left:auto;font:400 12px var(--font);color:var(--ink3)}

.people{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);
  border-radius:var(--r-lg);overflow:hidden}
.person{display:flex;align-items:center;gap:14px;background:var(--surface);border:0;
  padding:13px 16px;cursor:pointer;text-align:left;width:100%;font-family:var(--font);
  transition:background .12s var(--ease)}
.person:hover{background:var(--sunk)}
.person .ini{width:34px;height:34px;border-radius:50%;background:var(--s1-soft);
  color:var(--s1);display:grid;place-items:center;font:600 12px var(--font);flex:none}
.person .ini.left{background:var(--line2);color:var(--ink3)}
.who{flex:1;min-width:170px;display:grid;gap:3px}
.who .nm{font-size:14px;font-weight:600;color:var(--ink);display:flex;align-items:center;
  gap:8px;flex-wrap:wrap}
.who .sub{font-size:12px;color:var(--ink3)}
.person .col{width:130px;flex:none;font-size:12.5px;color:var(--ink2)}
.flags{margin-left:auto;flex:none}

.ini.big{width:46px;height:46px;border-radius:50%;background:var(--s1-soft);color:var(--s1);
  display:grid;place-items:center;font:600 16px var(--font);flex:none}
.drawer-sub{font-size:12.5px;color:var(--ink3);margin-top:5px}
.drawer-flags{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 4px}
.panel.wide{max-width:720px}

.rtabs{display:flex;gap:6px;flex-wrap:wrap;margin:18px 0 4px;padding-bottom:14px;
  border-bottom:1px solid var(--line2)}
.rtabs button{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:var(--r);padding:7px 12px;font:500 12px var(--font);cursor:pointer;
  transition:all .15s var(--ease)}
.rtabs button:hover{border-color:var(--ink3);color:var(--ink)}
.rtabs button[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}
.rtabs button.conf{border-color:#E0C4B8;color:var(--s2)}
.rtabs button.conf[data-on="1"]{background:var(--s2);border-color:var(--s2);color:#fff}

.kv{border-collapse:collapse;width:100%;margin-top:14px}
.kv td{padding:9px 0;border-bottom:1px solid var(--line2);font-size:13.5px;vertical-align:top}
.kv td:first-child{color:var(--ink3);font-weight:400;width:200px;font-size:12.5px;
  padding-right:18px}
.kv tr:last-child td{border-bottom:0}
.none{color:var(--ink3);font-style:normal;font-size:12.5px}

.confnote{font-size:12.5px;color:var(--s2);background:var(--s2-soft);border-radius:var(--r);
  padding:11px 14px;margin-top:16px;line-height:1.6}
.confnote.muted{color:var(--ink3);background:var(--sunk);margin-top:20px}

.pager{display:flex;align-items:center;gap:14px;margin-top:20px;flex-wrap:wrap}
.pinfo{font:400 12.5px var(--font);color:var(--ink3)}
.pbtns{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap}
.pbtns .mini[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}

@media(max-width:820px){.hide-sm{display:none}.kv td:first-child{width:auto}}
`;
