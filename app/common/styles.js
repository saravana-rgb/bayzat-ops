/* Shell styles: tokens, typography, buttons, tiles, panels.
   Shared by every tile — change with care, it affects all of them. */
export const commonCss = `
/* ============================================================
   THE PALETTE — everything colourful in the app comes from here.

   Default is Clay: burnt sienna on warm paper, with deep teal,
   aubergine, olive and steel as the supporting hues. Deliberately
   not a corporate blue.

   To try another, replace the four --accent lines and the six --s
   lines with one of the sets at the bottom of this block. Nothing
   else needs touching.
   ============================================================ */
:root{
  --canvas:#FBF9F5; --surface:#FFFFFF; --sunk:#F7F3EC;
  --line:#E6DFD3; --line2:#F1EBE1;

  --ink:#1F1B16; --ink2:#5A5348; --ink3:#8F8779;

  /* the one colour for things you can act on */
  --accent:#B14A2E; --accent-ink:#8C3820; --accent-soft:#FAEDE7;

  /* status — these keep their meaning whatever the accent is */
  --emerald:#3F6B3A; --emerald-soft:#EEF3EC;
  --amber:#A66A15;   --amber-soft:#FBF2E4;
  --rose:#9B2C36;    --rose-soft:#FAEBEC;

  /* the six onboarding steps and the document categories */
  --s1:#1F5F5B; --s1-soft:#E7F0EF;
  --s2:#B14A2E; --s2-soft:#FAEDE7;
  --s3:#6B2D5C; --s3-soft:#F4EBF2;
  --s4:#4A6B22; --s4-soft:#EFF3E7;
  --s5:#8C5A1E; --s5-soft:#F8F0E4;
  --s6:#2E5E8C; --s6-soft:#E9EFF6;

  --font:'DM Sans',system-ui,-apple-system,'Segoe UI',sans-serif;
  --r:5px; --r-lg:7px;
  --ease:cubic-bezier(.2,.8,.3,1);
}

/* ---- other palettes, swap in if Clay is not right ----------------

   AUBERGINE — deep purple on paper, cooler and more formal
   --accent:#6B2D5C; --accent-ink:#54234A; --accent-soft:#F4EBF2;
   --s1:#6B2D5C; --s2:#1F5F5B; --s3:#8C5A1E; --s4:#2E5E8C; --s5:#9B2C36; --s6:#4A6B22;

   FOREST — deep green, calm and quiet
   --accent:#2F5D3A; --accent-ink:#254B2E; --accent-soft:#EAF1EC;
   --s1:#2F5D3A; --s2:#8C5A1E; --s3:#1F5F5B; --s4:#6B2D5C; --s5:#B14A2E; --s6:#2E5E8C;

   INK — near-black with a single copper highlight, most restrained
   --accent:#2B2A28; --accent-ink:#000000; --accent-soft:#EFEDE9;
   --s1:#8C5A1E; --s2:#2B2A28; --s3:#1F5F5B; --s4:#6B2D5C; --s5:#4A6B22; --s6:#9B2C36;

   OCEAN — teal-led, brighter and more modern
   --accent:#0E6E68; --accent-ink:#0A5450; --accent-soft:#E5F2F1;
   --s1:#0E6E68; --s2:#B14A2E; --s3:#2E5E8C; --s4:#8C5A1E; --s5:#6B2D5C; --s6:#4A6B22;
   ------------------------------------------------------------------ */*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--canvas);color:var(--ink);
  font-family:var(--font);
  -webkit-font-smoothing:antialiased;font-feature-settings:'tnum' 1;line-height:1.5}
a{color:inherit;text-decoration:none}
h1,h2,h3,p{margin:0}
::selection{background:var(--accent-soft)}
:focus-visible{outline:1.5px solid var(--accent);outline-offset:2px}
.wrap{max-width:1000px;margin:0 auto;padding:34px 24px 90px}
/* ------------------------------------------------------------ bar */
.bar{display:flex;align-items:center;gap:14px;padding:0 0 22px;margin-bottom:28px;
  border-bottom:1px solid var(--line);flex-wrap:wrap}
.mark{width:32px;height:32px;border-radius:var(--r);background:var(--accent);display:grid;
  place-items:center;color:#fff;font-weight:600;font-size:13px;flex:none}
.bar h1{font-size:19px;font-weight:600;letter-spacing:-.35px}
.bar .sub{font-size:12.5px;color:var(--ink3);font-weight:400;margin-top:4px}
.bar .right{margin-left:auto;display:flex;align-items:center;gap:12px;font-size:12.5px;
  color:var(--ink3);font-weight:400}
.back{font-size:12.5px;font-weight:500;color:var(--ink2);padding:6px 0;border-bottom:1px solid var(--line)}
.back:hover{color:var(--ink);border-color:var(--ink)}

/* ---------------------------------------------------------- tiles */
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(262px,1fr));gap:16px}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  padding:24px;display:flex;flex-direction:column;min-height:196px;
  transition:border-color .18s var(--ease)}
.tile:hover{border-color:var(--ink3)}
.tile .badges{margin-top:auto;padding-top:16px}
.tile{border-top:3px solid var(--accent)}
.tile:nth-child(1){border-top-color:var(--s2)}
.tile:nth-child(2){border-top-color:var(--s1)}
.tile:nth-child(3){border-top-color:var(--s3)}
.tile:nth-child(4){border-top-color:var(--s4)}
.tile .ico{width:34px;height:34px;border-radius:var(--r);background:var(--accent-soft);
  color:var(--accent);display:grid;place-items:center;margin-bottom:18px;
  border:1px solid transparent}
.tile:nth-child(1) .ico{background:var(--s2-soft);color:var(--s2)}
.tile:nth-child(2) .ico{background:var(--s1-soft);color:var(--s1)}
.tile:nth-child(3) .ico{background:var(--s3-soft);color:var(--s3)}
.tile:nth-child(4) .ico{background:var(--s4-soft);color:var(--s4)}
.tile:hover .ico{background:var(--accent);color:#fff;border-color:var(--accent)}
.tile .ico.violet{background:var(--s3-soft);color:var(--s3);border-color:transparent}
.tile .ico.emerald{background:var(--s6-soft);color:var(--s6);border-color:transparent}
.tile h2{font-size:15.5px;font-weight:600;letter-spacing:-.2px}
.tile p{font-size:13px;color:var(--ink3);font-weight:400;line-height:1.6;margin-top:8px}
.tile.soon{opacity:.45;pointer-events:none;border-style:dashed}
.tile.soon .ico{background:var(--line2);color:var(--ink3)}
.badges{display:flex;gap:7px;flex-wrap:wrap}

/* ---------------------------------------------------------- chips */
.chip{font-size:11px;font-weight:500;border-radius:3px;padding:3px 7px;white-space:nowrap;
  display:inline-block;border:1px solid transparent}
.chip.red{background:var(--rose-soft);color:var(--rose)}
.chip.amber{background:var(--amber-soft);color:var(--amber)}
.chip.green{background:var(--emerald-soft);color:var(--emerald)}
.chip.grey{background:var(--sunk);color:var(--ink2);border-color:var(--line)}
.chip.accent{background:var(--accent-soft);color:var(--accent)}
.chip.violet{background:var(--s3-soft);color:var(--s3)}
.chip.teal{background:var(--s4-soft);color:var(--s4)}

/* ---------------------------------------------------------- stats */
.stats{display:flex;gap:0;flex-wrap:wrap;margin-bottom:30px;border:1px solid var(--line);
  border-radius:var(--r-lg);background:var(--surface);overflow:hidden}
.stat{padding:18px 24px;min-width:130px;flex:1;border-right:1px solid var(--line);
  position:relative}
.stat:last-child{border-right:0}
/* each counter takes the next hue, so a row of numbers reads as a row of
   distinct things rather than a wall of grey */
.stat::before{content:'';position:absolute;left:0;right:0;top:0;height:3px}
.stat:nth-child(1)::before{background:var(--s1)}
.stat:nth-child(2)::before{background:var(--s2)}
.stat:nth-child(3)::before{background:var(--s3)}
.stat:nth-child(4)::before{background:var(--s4)}
.stat:nth-child(5)::before{background:var(--s5)}
.stat:nth-child(1) b{color:var(--s1)} .stat:nth-child(2) b{color:var(--s2)}
.stat:nth-child(3) b{color:var(--s3)} .stat:nth-child(4) b{color:var(--s4)}
.stat:nth-child(5) b{color:var(--s5)}
.stat b{display:block;font-size:26px;font-weight:600;line-height:1.05;letter-spacing:-.9px;
  color:var(--accent-ink)}
.stat span{font-size:11px;color:var(--ink3);letter-spacing:.2px;font-weight:400;margin-top:6px;
  display:block}
.stat.hot::before{background:var(--rose)}   .stat.hot b{color:var(--rose)}
.stat.warm::before{background:var(--amber)} .stat.warm b{color:var(--amber)}
.stat.good::before{background:var(--emerald)} .stat.good b{color:var(--emerald)}
.stat.calm::before{background:var(--accent)}  .stat.calm b{color:var(--accent)}

/* -------------------------------------------------------- headings */
.sec{font-size:12.5px;font-weight:600;letter-spacing:0;color:var(--ink);
  margin:34px 0 14px;display:flex;align-items:center;gap:10px;text-transform:none}
.sec::before{content:'';width:8px;height:8px;border-radius:2px;background:var(--accent);flex:none}
.sec::after{content:'';flex:1;height:1px;background:var(--line)}
.sec.hot::before{background:var(--rose)}
.sec.hot{color:var(--rose)}
.grid{display:grid;gap:14px}

/* -------------------------------------------------------- controls */
.mini{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:var(--r);
  padding:7px 13px;font:500 12px var(--font);cursor:pointer;transition:all .15s var(--ease)}
.mini:hover{border-color:var(--ink);color:var(--ink)}
.mini.go{border-color:#BEDCC5;color:var(--emerald);background:var(--emerald-soft)}
.mini.go:hover{background:var(--emerald);border-color:var(--emerald);color:#fff}
.mini:disabled{opacity:.35;cursor:default}
.btn{background:var(--accent);border:1px solid var(--accent);border-radius:var(--r);color:#fff;
  font:500 13px var(--font);padding:10px 18px;cursor:pointer;transition:all .15s var(--ease)}
.btn:hover{background:var(--accent-ink);border-color:var(--accent-ink)}
.btn:disabled{opacity:.35;cursor:default}
.btn.ghost{background:var(--surface);border-color:var(--line);color:var(--ink2)}
.btn.ghost:hover{border-color:var(--ink);color:var(--ink);background:var(--surface)}
/* ---------------------------------------------------------- inputs */
input,select,textarea{width:100%;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r);color:var(--ink);font:400 13.5px var(--font);padding:10px 12px;outline:none;
  transition:border-color .15s var(--ease)}
input:focus,select:focus,textarea:focus{border-color:var(--ink)}
input::placeholder{color:var(--ink3)}
label{display:block;font-size:11px;font-weight:500;letter-spacing:0;color:var(--ink3);
  margin-bottom:7px;text-transform:none}

/* ----------------------------------------------------------- panel */
.veil{position:fixed;inset:0;background:rgba(28,25,23,.32);z-index:40;display:flex;
  align-items:center;justify-content:center;padding:20px;animation:fade .18s var(--ease)}
@keyframes fade{from{opacity:0}to{opacity:1}}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  width:100%;max-width:640px;max-height:88vh;overflow:auto;padding:28px}
.panel .ph{display:flex;align-items:flex-start;gap:12px}
.x{margin-left:auto;background:transparent;border:1px solid var(--line);color:var(--ink3);
  border-radius:var(--r);width:30px;height:30px;font-size:13px;cursor:pointer;flex:none}
.x:hover{border-color:var(--ink);color:var(--ink)}
/* ------------------------------------------------------------ misc */
.empty{background:var(--surface);border:1px dashed var(--line);border-radius:var(--r-lg);
  padding:56px 24px;text-align:center}
.empty b{display:block;font-size:15px;font-weight:600;margin-bottom:8px}
.empty span{font-size:13px;color:var(--ink3)}
.center{min-height:82vh;display:grid;place-items:center;text-align:center;padding:20px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  padding:36px;max-width:380px;width:100%}
.err{background:var(--rose-soft);color:var(--rose);border-radius:var(--r);padding:12px 15px;
  font-size:13px;font-weight:400;margin-bottom:16px;text-align:left}
.note-txt{font-size:12.5px;color:var(--ink3);font-weight:400}
.viewswitch{display:inline-flex;gap:0;border:1px solid var(--line);border-radius:var(--r);
  overflow:hidden;margin-bottom:26px}
.viewswitch button{border:0;border-right:1px solid var(--line);background:var(--surface);
  color:var(--ink3);padding:9px 22px;font:500 13px var(--font);cursor:pointer;
  transition:all .15s var(--ease)}
.viewswitch button:last-child{border-right:0}
.viewswitch button:hover{color:var(--ink);background:var(--sunk)}
.viewswitch button[data-on="1"]{background:var(--accent);color:#fff}
.toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:24px}
.tabset{display:flex;gap:0;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.tabset button{border:0;border-right:1px solid var(--line);background:var(--surface);color:var(--ink3);
  padding:9px 15px;font:500 12.5px var(--font);cursor:pointer;white-space:nowrap;
  transition:all .15s var(--ease)}
.tabset button:last-child{border-right:0}
.tabset button:hover{color:var(--ink);background:var(--sunk)}
.tabset button[data-on="1"]{background:var(--accent);color:#fff}
.search{flex:1;min-width:170px;max-width:300px}
.sync{margin-left:auto;display:flex;align-items:center;gap:11px;font:400 12px var(--font);color:var(--ink3)}
/* --------------------------------------------------- comments */
.cmt{margin-top:14px;border-top:1px solid var(--line2);padding-top:14px}
.cmt-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}
.cmt-row select{width:auto;min-width:150px;flex:none;font-size:12.5px;padding:8px 10px}
.cmt-row input{flex:1;min-width:170px;font-size:12.5px;padding:8px 11px}
.trail{margin-top:13px;display:grid;gap:9px}
.tr{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;color:var(--ink2);line-height:1.6}
.tr .dot{width:6px;height:6px;border-radius:50%;background:var(--line);margin-top:6px;flex:none}
.tr .dot.done{background:var(--emerald)}
.tr .dot.cmt{background:var(--amber)}
.tr .who{color:var(--ink3)}
.panelbox{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  padding:24px 26px}
.pc-ref{font:500 11px var(--font);background:var(--sunk);color:var(--ink3);border:1px solid var(--line);
  border-radius:3px;padding:2px 7px}
@media print{
  .viewswitch,.filters,.bar,.tabset,.toolbar{display:none !important}
  .panelbox,.headline{break-inside:avoid}
  body{background:#fff}
}
@media(max-width:700px){
  .wrap{padding:20px 16px 60px}
  .stat{border-right:0;border-bottom:1px solid var(--line)}
  .mlbl,.slabel,.bar-lbl{width:100%}
  .thead{display:none}
  .tcell{width:auto}
  .cols{overflow-x:auto}
  .src{align-items:flex-start;flex-wrap:wrap}
  .src-act{margin-left:0;width:100%}
}

/* used by more than one tile, so it lives here */
.note{margin-top:11px;font-size:12.5px;padding:9px 11px}
.busy{background:var(--sunk);border:1px solid var(--line);border-radius:var(--r);
  padding:11px 15px;font:400 13px var(--font);color:var(--ink2);margin-bottom:18px}

/* ---- chart primitives, drawn by more than one tile ---- */
.mrow{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap}
.mrow:last-child{border-bottom:0}
.mlbl{font-size:13.5px;font-weight:500;width:180px;flex:none;display:flex;align-items:center;gap:9px}
.mtrack{flex:1;min-width:130px;height:8px;background:var(--line2);border-radius:4px;overflow:hidden}
.mfill{display:block;height:8px;border-radius:4px;transition:width .4s var(--ease)}
.mfill.p1{background:var(--s1)}.mfill.p4{background:var(--s4)}.mval{font:600 13px var(--font);width:72px;text-align:right;color:var(--ink)}
.msub{font-size:12px;color:var(--ink3);font-weight:400;width:132px;text-align:right}
.foot-note{font-size:12.5px;color:var(--ink3);font-weight:400;line-height:1.7;margin-top:18px;
  padding-top:16px;border-top:1px solid var(--line2)}
.filters{display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;margin-bottom:24px}
.filters select{width:auto;min-width:150px}
.filters .dl{margin-left:auto;display:flex;gap:9px;align-items:center}
.headline{border-left:2px solid var(--ink);padding:4px 0 4px 20px;margin-bottom:28px}
.headline p{font-size:15px;color:var(--ink2);line-height:1.85;font-weight:400}
.headline b{font-weight:600;color:var(--ink)}
.cols{display:flex;gap:10px;align-items:flex-end;padding:10px 0 0;min-height:200px}
.col{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;
  border-radius:var(--r);padding:8px 3px;transition:background .15s var(--ease)}
.col:hover{background:var(--sunk)}
.col.on{background:var(--sunk);box-shadow:inset 0 0 0 1px var(--line)}
.colv{font:500 11px var(--font);color:var(--ink2);height:15px;white-space:nowrap}
.coltrack{width:100%;max-width:44px;height:126px;background:var(--line2);border-radius:3px;
  display:flex;align-items:flex-end;overflow:hidden}
.colbar{width:100%;border-radius:3px;transition:height .45s var(--ease)}
.coll{font:500 12px var(--font);color:var(--ink2)}
.colc{font:400 11px var(--font);color:var(--ink3)}
.bar-row{display:flex;align-items:center;gap:14px;padding:8px 0}
.bar-lbl{font-size:12.5px;color:var(--ink2);font-weight:400;width:170px;flex:none;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-track{flex:1;height:6px;background:var(--line2);border-radius:3px;overflow:hidden}
.bar-fill{display:block;height:6px;border-radius:3px;transition:width .4s var(--ease)}
.bar-fill.p1{background:var(--s1)}.bar-fill.p4{background:var(--s4)}.bar-n{font:500 12.5px var(--font);width:24px;text-align:right;color:var(--ink2)}
.months{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.monthchip{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:var(--r);padding:8px 14px;font:500 12.5px var(--font);cursor:pointer}
.monthchip:hover{border-color:var(--ink);color:var(--ink)}
.monthchip[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}

/* confirmation dialogs, used by more than one tile */
.danger-zone{display:flex;gap:16px;align-items:center;border:1px solid var(--line);
  border-left:2px solid var(--rose);border-radius:0 var(--r) var(--r) 0;padding:16px 18px;
  flex-wrap:wrap}
.danger-zone b{display:block;font-size:13.5px;font-weight:600;margin-bottom:5px}
.danger-zone span{font-size:12.5px;color:var(--ink3);line-height:1.6;display:block;max-width:440px}
.danger-zone .mini{margin-left:auto;flex:none}
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
.mini.danger{border-color:#E7C3CD;color:var(--rose)}
.mini.danger:hover{background:var(--rose);border-color:var(--rose);color:#fff}
.btn.danger{background:var(--rose);border-color:var(--rose)}
.btn.danger:hover{background:#7F2029;border-color:#7F2029}
.btn.danger:disabled{background:var(--line);border-color:var(--line);color:var(--ink3)}

/* ---- person cards and checklists, used by more than one tile ---- */
.pcard{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  overflow:hidden;cursor:pointer;transition:border-color .18s var(--ease)}
.pcard:hover{border-color:var(--ink3)}
.pcard.late{border-color:#E7C3CD}
.pc-top{display:flex;align-items:flex-start;gap:12px;padding:20px 22px 0;flex-wrap:wrap}
.pc-name{font-size:16px;font-weight:600;letter-spacing:-.25px;display:flex;align-items:center;
  gap:9px;flex-wrap:wrap}
.pc-meta{font-size:12.5px;color:var(--ink3);font-weight:400;margin-top:6px}
.pc-right{margin-left:auto;display:flex;align-items:center;gap:10px}
.pc-count{font:500 12px var(--font);color:var(--ink3)}
.pc-bar{padding:16px 22px 0}
.pc-steps{padding:8px 22px 16px}
.pstep{display:flex;align-items:center;gap:13px;padding:12px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap}
.pstep:last-child{border-bottom:0}
.pstep:hover{background:var(--sunk)}
.pnum{width:22px;height:22px;border-radius:3px;display:grid;place-items:center;
  font:600 11px var(--font);flex:none}
.plabel{font-size:13.5px;font-weight:500;flex:1;min-width:130px}
.pacts{display:flex;gap:7px;margin-left:auto}
.pfoot{border-top:1px solid var(--line2);padding:14px 22px;display:flex;gap:10px;
  align-items:center;background:var(--sunk);flex-wrap:wrap}
.allgood{font-size:12.5px;color:var(--emerald);font-weight:500;padding:6px 0}
.runway{display:flex;gap:4px}
.seg{height:4px;flex:1;border-radius:2px;background:var(--line2);transition:background .3s var(--ease)}
.seg.done.p1{background:var(--s1)}.seg.done.p3{background:var(--s3)}.seg.done.p5{background:var(--s5)}.seg.progress{background:var(--amber);opacity:.5}
.seg.na{background:var(--line)}
.seg.late{background:#E7C3CD}
.step{border:1px solid var(--line);border-left:2px solid var(--line);border-radius:0 var(--r) var(--r) 0;
  padding:16px 18px;margin-top:12px}
.step.e1{border-left-color:var(--s1)}.step.e3{border-left-color:var(--s3)}.step.e5{border-left-color:var(--s5)}.step.done{background:var(--sunk)}
.step.late{border-color:#E7C3CD}
.step .st{font-size:14px;font-weight:600}
.num{width:22px;height:22px;border-radius:3px;display:grid;place-items:center;
  font:600 11px var(--font);flex:none}
.ctl{display:flex;gap:6px;margin-top:13px;flex-wrap:wrap}
.ctl button{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:var(--r);padding:6px 12px;font:500 12px var(--font);cursor:pointer;
  transition:all .15s var(--ease)}
.ctl button:hover{border-color:var(--ink);color:var(--ink)}
.ctl button[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}
.p1{background:var(--s1-soft);color:var(--s1)}.swork.p1{background:var(--s1)} .seg.done.p2{background:var(--s2)}
 .p2{background:var(--s2-soft);color:var(--s2)}
 .bar-fill.p2{background:var(--s2)} .mfill.p2{background:var(--s2)} .swork.p2{background:var(--s2)}.p3{background:var(--s3-soft);color:var(--s3)} .bar-fill.p3{background:var(--s3)}
 .mfill.p3{background:var(--s3)}
 .swork.p3{background:var(--s3)}
 .seg.done.p4{background:var(--s4)}
 .p4{background:var(--s4-soft);color:var(--s4)}
.swork.p4{background:var(--s4)}.p5{background:var(--s5-soft);color:var(--s5)} .bar-fill.p5{background:var(--s5)} .mfill.p5{background:var(--s5)} .swork.p5{background:var(--s5)} .seg.done.p6{background:var(--s6)}
 .p6{background:var(--s6-soft);color:var(--s6)}
 .bar-fill.p6{background:var(--s6)}
 .mfill.p6{background:var(--s6)}
 .swork.p6{background:var(--s6)}
 .step.e2{border-left-color:var(--s2)}
 .step.e4{border-left-color:var(--s4)}
 .step.e6{border-left-color:var(--s6)}
.tcell{width:82px;flex:none;text-align:right;font:600 13px var(--font);color:var(--ink)}
.thead .tcell{font:500 11px var(--font);color:var(--ink3)}
.tcell.ok{color:var(--emerald)} .tcell.warn{color:var(--amber)}
.tcell.bad{color:var(--rose)} .tcell.dim{color:var(--ink3);font-weight:400}
.thead{display:flex;align-items:center;gap:14px;padding:0 0 11px;border-bottom:1px solid var(--line);
  font:500 11px var(--font);color:var(--ink3);text-transform:none;letter-spacing:0}
`;
