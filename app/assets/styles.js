/* Styles owned by the Assets tile. Nothing else uses these.
   Reuses .wrap, .bar, .back, .stats/.stat, .tabset, .toolbar, .search,
   .chip, .mini/.btn, .veil/.panel/.ph/.x, .frow/label/input, .empty,
   .headline, .trail/.tr, .panelbox, .mrow family and .grid from the shared
   stylesheet — everything below is new. */
export const assetsCss = `
/* ---------------------------------------------------------- the list */
.assets{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);
  border-radius:var(--r-lg);overflow:hidden}
.assetrow{display:flex;align-items:center;gap:14px;background:var(--surface);border:0;
  border-left:3px solid transparent;padding:13px 16px;cursor:pointer;text-align:left;
  width:100%;font-family:var(--font);transition:background .12s var(--ease)}
.assetrow:hover{background:var(--sunk)}

/* left rule follows status, the same idea as a document's category rule.
   Bare classes, not scoped to .assetrow, so .grp-item in the by-employee
   view can use the same names. */
.st-instock {border-left-color:var(--emerald)}
.st-assigned{border-left-color:var(--s1)}
.st-repair  {border-left-color:var(--amber)}
.st-missing {border-left-color:var(--rose)}
.st-retired {border-left-color:var(--ink3)}
.st-gone    {border-left-color:var(--s3)}

.a-ico{width:34px;height:34px;border-radius:var(--r);background:var(--sunk);
  color:var(--ink2);display:grid;place-items:center;font:600 12px var(--font);flex:none}
.a-who{flex:1;min-width:150px;display:grid;gap:3px}
.a-who .nm{font-size:14px;font-weight:600;color:var(--ink);display:flex;
  align-items:center;gap:8px;flex-wrap:wrap}
.a-who .sub{font-size:12px;color:var(--ink3)}
.a-ref{font:500 11px var(--font);background:var(--sunk);color:var(--ink3);
  border:1px solid var(--line);border-radius:3px;padding:2px 7px}
.a-acts{display:flex;gap:8px;flex:none;flex-wrap:wrap;justify-content:flex-end}
.a-warn{font-size:11.5px;font-weight:500;color:var(--amber)}
.a-alarm{font-size:11.5px;font-weight:500;color:var(--rose)}

/* device ownership, the same three colours employees uses for the same
   three values — defined again here because a tile's styles only load on
   its own route */
.chip.a-bayzat  {background:var(--s1-soft);color:var(--s1)}
.chip.a-leasing {background:var(--s3-soft);color:var(--s3)}
.chip.a-personal{background:var(--s5-soft);color:var(--s5)}

.chip.st-instock {background:var(--emerald-soft);color:var(--emerald)}
.chip.st-assigned{background:var(--s1-soft);color:var(--s1)}
.chip.st-repair  {background:var(--amber-soft);color:var(--amber)}
.chip.st-missing {background:var(--rose-soft);color:var(--rose)}
.chip.st-retired {background:var(--line2);color:var(--ink3)}
.chip.st-gone    {background:var(--s3-soft);color:var(--s3)}

.panel.wide{max-width:760px}
.req{font-style:normal;font-size:14px;font-weight:600;color:var(--rose);line-height:1}

/* a field that appears because of a choice just made should say so, not
   just snap into place */
@keyframes assetAppear{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.appear{animation:assetAppear .16s var(--ease)}

/* ------------------------------------------------------- by employee */
.grp-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;
  flex-wrap:wrap;margin-bottom:10px}
.grp-name{font-size:14.5px;font-weight:600;color:var(--ink)}
.grp-email{font-size:12px;color:var(--ink3);margin-left:8px}
.grp-count{font:500 11.5px var(--font);color:var(--ink2);background:var(--sunk);
  padding:3px 10px;border-radius:99px;flex:none}
.grp-list{display:grid;gap:6px}
.grp-item{display:flex;align-items:center;gap:10px;padding:9px 11px;
  background:var(--sunk);border:0;border-radius:var(--r);border-left:3px solid transparent;
  width:100%;text-align:left;cursor:pointer;font-family:var(--font)}
.grp-item:hover{background:var(--line2)}

/* small heading inside a .panelbox card, used by the reports view */
.bt{font:600 12.5px var(--font);color:var(--ink);margin:0 0 12px}
`;
