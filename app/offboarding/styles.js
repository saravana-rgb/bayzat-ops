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

.guide{font-size:12.5px;color:var(--ink3);line-height:1.6;margin-top:8px}
.guiderow{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px}
.guiderow a.mini{text-decoration:none;display:inline-flex;align-items:center}

.evidence{margin-top:13px;border-top:1px solid var(--line2);padding-top:12px}
.evhead{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:9px}
.evtitle{font:600 11px var(--font);letter-spacing:.4px;text-transform:uppercase;
  color:var(--ink3)}
.evneed{font:400 11.5px var(--font);color:var(--ink3);flex-basis:100%}
.evlist{display:grid;gap:5px;margin-bottom:9px}
.evitem{display:flex;align-items:center;gap:10px;width:100%;text-align:left;
  background:var(--sunk);border:1px solid var(--line);border-radius:var(--r);
  padding:8px 10px;cursor:pointer;font-family:var(--font);
  transition:border-color .15s var(--ease)}
.evitem:hover{border-color:var(--ink3)}
.evkind{font:600 9px var(--font);letter-spacing:.5px;background:var(--s1-soft);
  color:var(--s1);border-radius:3px;padding:3px 6px;flex:none}
.evtext{font-size:12px;color:var(--ink);flex:1;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.evwho{font-size:10.5px;color:var(--ink3);flex:none}
.evadd{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
.evadd input{flex:1;min-width:180px;font-size:12px;padding:7px 10px;margin:0}

.clockhead{display:flex;gap:32px;flex-wrap:wrap;margin-bottom:18px;padding-bottom:16px;
  border-bottom:1px solid var(--line2)}
.clockbig b,.clockwarn b{display:block;font:600 30px var(--font);line-height:1;
  letter-spacing:-1px}
.clockbig b{color:var(--emerald)} .clockwarn b{color:var(--rose)}
.clockbig span,.clockwarn span{font-size:12.5px;color:var(--ink3);display:block;margin-top:6px}

/* the collection form — colour marks the sections, not decoration */
.panel.form{max-width:760px}
.formhead{display:flex;align-items:flex-start;gap:12px;padding-bottom:16px;
  border-bottom:1px solid var(--line);margin-bottom:18px}
.formhead h2{font-size:18px;font-weight:600;letter-spacing:-.3px}
.formhead p{font-size:12.5px;color:var(--ink3);margin-top:5px}

.fsec{border:1px solid var(--line);border-left:3px solid var(--line);
  border-radius:0 var(--r-lg) var(--r-lg) 0;padding:16px 18px;margin-bottom:14px}
.fsec h3{font:600 11px var(--font);letter-spacing:.7px;text-transform:uppercase;
  margin-bottom:14px}
.fsec.s-blue{border-left-color:var(--s1);background:#F7FAFA}
.fsec.s-blue h3{color:var(--s1)}
.fsec.s-amber{border-left-color:var(--s2);background:#FEFAF7}
.fsec.s-amber h3{color:var(--s2)}
.fsec.s-green{border-left-color:var(--s4);background:#F8FBF7}
.fsec.s-green h3{color:var(--s4)}
.fsec.s-violet{border-left-color:var(--s3);background:#FAF7FB}
.fsec.s-violet h3{color:var(--s3)}
.fsec.s-rose{border-left-color:var(--s5);background:#FDF8FA}
.fsec.s-rose h3{color:var(--s5)}

.ffield{margin-bottom:13px}
.ffield:last-child{margin-bottom:0}
.ffield label{display:block;font:500 11px var(--font);color:var(--ink3);
  text-transform:none;letter-spacing:0;margin-bottom:6px}
.ffield input,.ffield select,.ffield textarea{background:var(--surface)}
.ffield input:disabled{background:var(--sunk);color:var(--ink3)}
.fhint{display:block;font-size:11px;color:var(--ink3);margin-top:5px;line-height:1.5}
.fgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:13px}

.pills{display:flex;gap:6px;flex-wrap:wrap}
.pill{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:20px;padding:6px 13px;font:500 12px var(--font);cursor:pointer;
  transition:all .15s var(--ease)}
.pill:hover{border-color:var(--ink3);color:var(--ink)}
.pill[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}

.formacts{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px;padding-top:16px;
  border-top:1px solid var(--line2)}
.formacts .btn{flex:1;min-width:120px}
`;
