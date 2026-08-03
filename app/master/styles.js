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

.ini.big{width:52px;height:52px;border-radius:50%;background:var(--s1-soft);color:var(--s1);
  display:grid;place-items:center;font:600 17px var(--font);flex:none}

.rechead{display:flex;align-items:flex-start;gap:16px;padding-bottom:18px;
  border-bottom:1px solid var(--line)}
.recwho{flex:1;min-width:0}
.recwho h2{font-size:19px;font-weight:600;letter-spacing:-.4px}
.recwho p{font-size:13px;color:var(--ink2);margin-top:4px}
.recmeta{display:flex;gap:14px;flex-wrap:wrap;margin-top:7px}
.recmeta span{font-size:11.5px;color:var(--ink3)}

.recwarn{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}
.warnpill{display:grid;gap:2px;border-radius:var(--r);padding:9px 13px;
  border:1px solid transparent}
.warnpill b{font-size:12.5px;font-weight:600}
.warnpill span{font-size:11px;opacity:.75}
.warnpill.red{background:var(--rose-soft);border-color:#E7C3CD;color:var(--rose)}
.warnpill.amber{background:var(--amber-soft);border-color:#E8D5B4;color:var(--amber)}
.warnpill.grey{background:var(--sunk);border-color:var(--line);color:var(--ink3)}

.recfacts{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));
  gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--r);
  overflow:hidden;margin-top:18px}
.fact{background:var(--surface);padding:12px 14px;display:grid;gap:4px}
.fact span{font-size:10.5px;color:var(--ink3);letter-spacing:.3px}
.fact b{font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap}

.rtabs{display:flex;gap:6px;flex-wrap:wrap;margin:22px 0 4px;padding-bottom:16px;
  border-bottom:1px solid var(--line2)}
.rtabs button{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:var(--r);padding:7px 12px;font:500 12px var(--font);cursor:pointer;
  display:flex;align-items:center;gap:7px;transition:all .15s var(--ease)}
.rtabs button:hover{border-color:var(--ink3);color:var(--ink)}
.rtabs button[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}
.rtabs button.thin{opacity:.5}
.tabn{font:600 10px var(--font);background:var(--line2);color:var(--ink3);
  border-radius:20px;padding:1px 6px;min-width:18px;text-align:center}
.rtabs button[data-on="1"] .tabn{background:rgba(255,255,255,.22);color:#fff}
.rtabs button.conf{border-color:#E0C4B8;color:var(--s2)}
.rtabs button.conf[data-on="1"]{background:var(--s2);border-color:var(--s2);color:#fff}

.pairs{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
  gap:1px;background:var(--line2);border:1px solid var(--line2);border-radius:var(--r);
  overflow:hidden;margin-top:16px}
.pair{background:var(--surface);padding:12px 14px;display:grid;gap:4px}
.pk{font-size:11px;color:var(--ink3)}
.pv{font-size:13.5px;font-weight:500;color:var(--ink);word-break:break-word}
.none{color:var(--ink3);font-weight:400}

.locked{border:1px solid var(--line);border-radius:var(--r-lg);padding:26px 24px;
  margin-top:16px;text-align:center;background:var(--sunk)}
.lockmark{display:inline-block;font:600 10px var(--font);letter-spacing:.8px;
  text-transform:uppercase;background:var(--rose);color:#fff;border-radius:3px;
  padding:4px 9px;margin-bottom:13px}
.locked b{display:block;font-size:15px;font-weight:600;margin-bottom:8px}
.locked p{font-size:12.5px;color:var(--ink3);line-height:1.7;max-width:400px;margin:0 auto}
.lockwho{margin-top:10px !important;color:var(--ink2) !important}

.confnote{font-size:12.5px;color:var(--s2);background:var(--s2-soft);border-radius:var(--r);
  padding:11px 14px;margin-top:16px;line-height:1.6}

.pager{display:flex;align-items:center;gap:14px;margin-top:20px;flex-wrap:wrap}
.pinfo{font:400 12.5px var(--font);color:var(--ink3)}
.pbtns{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap}
.pbtns .mini[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}

@media(max-width:820px){.hide-sm{display:none}.kv td:first-child{width:auto}}
.panel.wide{max-width:760px}
.person .ini.leaver{background:var(--line2);color:var(--ink3)}
`;
