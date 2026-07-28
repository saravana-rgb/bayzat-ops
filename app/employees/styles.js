/* Styles owned by the Employees tile. Nothing else uses these. */
export const employeesCss = `
.facets{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:18px}
.facetsel,.sortsel{width:auto;min-width:150px;font-size:12.5px;padding:8px 11px}
.sortsel{min-width:140px}
.facets .count{margin-left:auto;font:400 12px var(--font);color:var(--ink3)}

/* the list */
.people{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);
  border-radius:var(--r-lg);overflow:hidden}
.person{display:flex;align-items:center;gap:14px;background:var(--surface);border:0;
  border-left:3px solid transparent;padding:13px 16px;cursor:pointer;text-align:left;
  width:100%;font-family:var(--font);transition:background .12s var(--ease)}
.person:hover{background:var(--sunk)}
.person.gap{border-left-color:var(--rose)}
.person .ini{width:34px;height:34px;border-radius:50%;background:var(--accent-soft);
  color:var(--accent);display:grid;place-items:center;font:600 12px var(--font);flex:none}
.person .ini.left{background:var(--line2);color:var(--ink3)}
.who{flex:1;min-width:150px;display:grid;gap:3px}
.who .nm{font-size:14px;font-weight:600;color:var(--ink);display:flex;align-items:center;
  gap:8px;flex-wrap:wrap}
.who .sub{font-size:12px;color:var(--ink3)}
.person .col{width:130px;flex:none;font-size:12.5px;color:var(--ink2)}
.person .asset{width:130px;flex:none}
.person .gapcount{width:104px;flex:none;text-align:right}

/* device colours, matching the document categories */
.chip.a-bayzat{background:var(--s1-soft);color:var(--s1)}
.chip.a-leasing{background:var(--s3-soft);color:var(--s3)}
.chip.a-personal{background:var(--s5-soft);color:var(--s5)}
.chip.a-none{background:var(--line2);color:var(--ink3)}

/* the drawer */
.panel.wide{max-width:760px}
.ini.big{width:46px;height:46px;border-radius:50%;background:var(--accent-soft);
  color:var(--accent);display:grid;place-items:center;font:600 16px var(--font);flex:none}
.drawer-sub{font-size:12.5px;color:var(--ink3);margin-top:5px}
.drawer-flags{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 4px}
.fgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}
.field.wide{grid-column:1/-1}
.field label{display:flex;align-items:center;gap:8px}
.field .req{font-style:normal;font-size:14px;font-weight:600;color:var(--rose);
  line-height:1;cursor:help}
.field input.gap,.field select.gap{border-color:var(--rose);background:var(--rose-soft)}
.field input.gap:focus,.field select.gap:focus{border-color:var(--rose);background:var(--surface)}
.drawer-acts{display:flex;gap:10px;margin-top:26px;padding-top:20px;
  border-top:1px solid var(--line2);flex-wrap:wrap}
.drawer-acts .btn{flex:1;min-width:150px}

@media(max-width:820px){
  .hide-sm{display:none}
  .person .asset{width:auto}
  .person .gapcount{width:auto}
}

/* pagination */
.pager{display:flex;align-items:center;gap:14px;margin-top:20px;flex-wrap:wrap}
.pinfo{font:400 12.5px var(--font);color:var(--ink3)}
.pbtns{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap}
.pbtns .mini[data-on="1"]{background:var(--accent);border-color:var(--accent);color:#fff}
.pdots{color:var(--ink3);padding:0 2px;align-self:center}

/* reports */
.splitcols{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:28px}
.bt{font:600 12.5px var(--font);color:var(--ink);margin:0 0 12px}

/* record health */
.health{display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap}
.ring{flex:none}
.healthside{flex:1;min-width:260px}
.hlead{font-size:15px;font-weight:600;color:var(--ink);margin-bottom:6px}
.fieldgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:10px;
  margin-top:16px}
.fcard{border:1px solid var(--line);background:var(--surface);border-radius:var(--r);
  padding:12px 13px;text-align:left;cursor:pointer;font-family:var(--font);
  transition:all .15s var(--ease);display:grid;gap:5px}
.fcard:hover:not(:disabled){border-color:var(--ink3);transform:translateY(-1px)}
.fcard:disabled{cursor:default;opacity:.75}
.fnum{font:600 20px var(--font);line-height:1}
.flabel{font:400 11.5px var(--font);color:var(--ink3)}
.fbar{display:block;height:3px;background:var(--line2);border-radius:2px;overflow:hidden}
.fbar span{display:block;height:3px;border-radius:2px}
.fcard.ok .fnum{color:var(--emerald)}   .fcard.ok .fbar span{background:var(--emerald)}
.fcard.warn .fnum{color:var(--amber)}   .fcard.warn .fbar span{background:var(--amber)}
.fcard.bad .fnum{color:var(--rose)}     .fcard.bad .fbar span{background:var(--rose)}

/* clickable chart rows and columns */
.bar-row.clickable{width:100%;border:0;background:transparent;cursor:pointer;
  font-family:var(--font);border-radius:var(--r);padding:6px 8px;margin-left:-8px;
  transition:background .12s var(--ease)}
.bar-row.clickable:hover{background:var(--sunk)}
button.col{border:0;font-family:var(--font)}
button.col:disabled{cursor:default;opacity:.6}

/* who is behind a number */
.drilllist{margin-top:16px;display:grid;gap:1px;background:var(--line);
  border:1px solid var(--line);border-radius:var(--r);overflow:hidden;max-height:52vh;
  overflow-y:auto}
.drillrow{display:flex;align-items:center;gap:13px;background:var(--surface);padding:11px 14px}
`;
