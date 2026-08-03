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

/* the documents view */
.person.doc{gap:13px}
.person input[type=checkbox]{width:16px;height:16px;flex:none;margin:0;accent-color:#B14A2E;
  cursor:pointer}
.person.doc.expired{border-left:3px solid var(--rose);background:#FFFCFC}
.person.doc.critical{border-left:3px solid var(--rose)}
.person.doc.soon{border-left:3px solid var(--amber)}
.person.doc.inactive{opacity:.55}
.docname{width:130px;flex:none;font-size:12.5px;font-weight:500;color:var(--ink2)}
.docdate{width:170px;flex:none;display:flex;align-items:center;gap:9px;font-size:12.5px;
  color:var(--ink2)}

.bulkbar{display:flex;align-items:center;gap:12px;background:var(--ink);color:#fff;
  border-radius:var(--r-lg);padding:13px 18px;margin-bottom:14px;flex-wrap:wrap}
.bulkbar b{font-size:15px}
.bulkbar span{font-size:13px}
.bulkbar .btn{margin-left:auto;background:#fff;color:var(--ink);border-color:#fff}
.bulkbar .btn:hover{background:var(--sunk)}
.bulkbar .mini{background:transparent;border-color:rgba(255,255,255,.3);color:#fff}
.bulkbar .mini:hover{background:rgba(255,255,255,.12);color:#fff;border-color:#fff}

textarea{width:100%;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r);padding:10px 12px;font:400 13px var(--font);color:var(--ink);
  outline:none;resize:vertical;line-height:1.6}
textarea:focus{border-color:var(--ink)}
@media(max-width:820px){.docname,.docdate{width:auto}}

.insbar{display:flex;height:34px;border-radius:var(--r);overflow:hidden;border:1px solid var(--line)}
.insseg{display:flex;align-items:center;justify-content:center;font:600 11.5px var(--font);
  color:#fff;white-space:nowrap;overflow:hidden}
.insseg.covered{background:var(--s4)}
.insseg.none{background:var(--rose)}
.insseg.unknown{background:var(--ink3)}

/* pressable counters */
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:11px;
  margin-bottom:20px}
.card{background:var(--surface);border:1px solid var(--line);border-top:3px solid var(--line);
  border-radius:0 0 var(--r-lg) var(--r-lg);padding:15px 16px;text-align:left;cursor:pointer;
  font-family:var(--font);display:grid;gap:3px;transition:all .15s var(--ease)}
.card:hover:not(:disabled){border-color:var(--ink3);transform:translateY(-2px)}
.card:disabled{cursor:default;opacity:.5}
.card b{font-size:25px;font-weight:600;line-height:1.1;letter-spacing:-.7px}
.card .cl{font-size:12px;font-weight:500;color:var(--ink2)}
.card .cn{font-size:11px;color:var(--ink3)}
.card.red{border-top-color:var(--rose)} .card.red b{color:var(--rose)}
.card.amber{border-top-color:var(--amber)} .card.amber b{color:var(--amber)}
.card.on{background:var(--ink);border-color:var(--ink)}
.card.on b,.card.on .cl,.card.on .cn{color:#fff}
.card.on .cn{opacity:.7}

/* document type chips */
.docchips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}
.docchip{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:var(--r);padding:8px 13px;font:500 12.5px var(--font);cursor:pointer;
  display:flex;align-items:center;gap:8px;transition:all .15s var(--ease)}
.docchip:hover{border-color:var(--ink3);color:var(--ink)}
.docchip[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}
.dn{font:600 11px var(--font);background:var(--line2);color:var(--ink3);border-radius:20px;
  padding:1px 7px;min-width:20px;text-align:center}
.docchip[data-on="1"] .dn{background:rgba(255,255,255,.2);color:#fff}

.docdate b{font-weight:600;color:var(--ink)}

.gaprow{align-items:flex-start}
.gapchips{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;
  max-width:60%}
.gapchips .chip{cursor:default}
.nocheck{width:16px;flex:none}
`;
