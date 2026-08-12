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

/* -------------------------------------------------------- colour tones
 * One name per hue already in the palette. Reused for category icons,
 * report bars, and the donut, so the same category reads as the same
 * colour everywhere in the tile -- no gradients anywhere, flat soft
 * background plus solid ink, the same technique every chip in this app
 * already uses. */
.tone-a1{background:var(--s1-soft);color:var(--s1)}
.tone-a2{background:var(--accent-soft);color:var(--accent)}
.tone-a3{background:var(--s3-soft);color:var(--s3)}
.tone-a4{background:var(--s4-soft);color:var(--s4)}
.tone-a5{background:var(--s5-soft);color:var(--s5)}
.tone-a6{background:var(--s6-soft);color:var(--s6)}
.tone-muted{background:var(--line2);color:var(--ink3)}

/* the category badge itself -- a coloured icon tile, not a flat letter */
.a-ico{width:34px;height:34px;border-radius:var(--r);display:grid;place-items:center;
  flex:none;transition:transform .12s var(--ease)}
.assetrow:hover .a-ico{transform:scale(1.06)}

/* a small round avatar for whoever is holding something -- the same idea
 * as the Employees tile's own .ini circle, redrawn locally since a tile's
 * styles only load on its own route */
.avatar{width:22px;height:22px;border-radius:50%;background:var(--accent-soft);
  color:var(--accent);display:inline-grid;place-items:center;font:600 10px var(--font);
  flex:none;vertical-align:middle;margin-right:6px}

/* rows and cards lift very slightly on hover -- a hint of depth without a
 * shadow that reads as heavy */
.assetrow{transition:background .12s var(--ease), box-shadow .12s var(--ease)}
.assetrow:hover{box-shadow:inset 3px 0 0 0 transparent}

/* stat cards become press targets where a real filter exists behind the
 * number -- flagged with a pointer and a lift, so it reads as clickable
 * rather than decorative */
.stat.tappable{cursor:pointer;transition:transform .12s var(--ease), border-color .12s var(--ease)}
.stat.tappable:hover{transform:translateY(-2px);border-color:var(--ink3)}
.stat-ico{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;
  margin-bottom:8px}

/* each panel gets a thin coloured stripe down its own outer edge, so Add,
 * Assign, Edit and Return read as distinct moods at a glance. This lives
 * on the panel's own border, never on anything inside it -- an earlier
 * version put this on the header only, using a negative margin to pull
 * the bar flush, and that nudged the header text a few pixels out of line
 * with the labels below it. A colour on the outer box can never do that,
 * because it never touches the padding or position of anything inside. */
.panel.mood-add{border-left:3px solid var(--s4)}
.panel.mood-assign{border-left:3px solid var(--s1)}
.panel.mood-edit{border-left:3px solid var(--s3)}
.panel.mood-return{border-left:3px solid var(--accent)}
.panel.mood-history{border-left:3px solid var(--ink3)}

/* the empty state gets a soft icon instead of sitting on text alone */
.empty-ico{width:44px;height:44px;border-radius:50%;background:var(--sunk);
  color:var(--ink3);display:grid;place-items:center;margin:0 auto 14px}

/* ------------------------------------------------------------- donut */
.donut-wrap{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
.donut-legend{display:grid;gap:9px;flex:1;min-width:140px}
.donut-row{display:flex;align-items:center;gap:9px;font:400 13px var(--font);color:var(--ink2)}
.donut-dot{width:10px;height:10px;border-radius:50%;flex:none}
.donut-n{margin-left:auto;font:600 13px var(--font);color:var(--ink)}

/* one clear primary action per row, filled solid -- everything else is a
 * small round icon button, quiet until you hover it. Five equal-weight
 * text pills read as a wall of options; one bold action plus a few small
 * icons reads as designed. */
.a-primary{font:600 12.5px var(--font);padding:8px 16px;border-radius:999px;
  border:none;color:#fff;cursor:pointer;transition:filter .12s var(--ease),transform .12s var(--ease)}
.a-primary:hover{filter:brightness(0.93);transform:translateY(-1px)}
.a-primary.pri-return{background:var(--accent)}
.a-primary.pri-assign{background:var(--s1)}
.a-primary.pri-restore{background:var(--emerald)}

.a-icobtn{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;
  border:none;background:transparent;cursor:pointer;flex:none;
  transition:background .12s var(--ease),transform .12s var(--ease)}
.a-icobtn:hover{transform:translateY(-1px)}
.a-icobtn.ic-edit   {color:var(--s4)}    .a-icobtn.ic-edit:hover   {background:var(--s4-soft)}
.a-icobtn.ic-replace{color:var(--s3)}    .a-icobtn.ic-replace:hover{background:var(--s3-soft)}
.a-icobtn.ic-email  {color:var(--s6)}    .a-icobtn.ic-email:hover  {background:var(--s6-soft)}
.a-icobtn.ic-status {color:var(--s5)}    .a-icobtn.ic-status:hover {background:var(--s5-soft)}
.a-icobtn.ic-delete {color:var(--rose)}  .a-icobtn.ic-delete:hover {background:var(--rose-soft)}

/* pagination -- not a global class, replicated from the same rules the
 * Employees tile already uses for its own Pager, since a tile's styles
 * only load on its own route */
.pager{display:flex;align-items:center;gap:14px;margin-top:20px;flex-wrap:wrap}
.pinfo{font:400 12.5px var(--font);color:var(--ink3)}
.pbtns{display:flex;gap:6px;margin-left:auto;flex-wrap:wrap}
.pbtns .mini[data-on="1"]{background:var(--accent);border-color:var(--accent);color:#fff}
.pdots{color:var(--ink3);padding:0 2px;align-self:center}
`;
