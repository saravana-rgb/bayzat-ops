export const metadata = {
  title: 'Bayzat Ops',
  description: 'Internal tools for the IT and People teams'
};

/* ============================================================
   Paper — warm off-white, generous spacing, small radii, almost
   no decorative colour. Colour appears only where it carries
   meaning: the six steps, and three status tones.
   ============================================================ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root{
  --canvas:#FBF9F5; --surface:#FFFFFF; --sunk:#FAF7F2;
  --line:#E8E2D8; --line2:#F2EDE4;

  --ink:#1C1917; --ink2:#57534E; --ink3:#8C8377;

  --accent:#1E3A8A; --accent-ink:#172554; --accent-soft:#EDF1FA;
  --emerald:#15803D; --emerald-soft:#EDF6EE;
  --amber:#B45309;  --amber-soft:#FCF3E7;
  --rose:#9F1239;   --rose-soft:#FBEDF0;

  --s1:#1E40AF; --s1-soft:#ECF0FB;
  --s2:#B45309; --s2-soft:#FCF3E7;
  --s3:#5B21B6; --s3-soft:#F1ECFB;
  --s4:#0F766E; --s4-soft:#E9F5F3;
  --s5:#9D174D; --s5-soft:#FBECF1;
  --s6:#15803D; --s6-soft:#EDF6EE;

  --r:5px; --r-lg:7px;
  --ease:cubic-bezier(.2,.8,.3,1);
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--canvas);color:var(--ink);
  font-family:Inter,system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased;font-feature-settings:'tnum' 1;line-height:1.5}
a{color:inherit;text-decoration:none}
h1,h2,h3,p{margin:0}
::selection{background:var(--accent-soft)}
:focus-visible{outline:1.5px solid var(--accent);outline-offset:2px}
.wrap{max-width:1000px;margin:0 auto;padding:34px 24px 90px}

/* ------------------------------------------------------------ bar */
.bar{display:flex;align-items:center;gap:14px;padding:0 0 22px;margin-bottom:28px;
  border-bottom:1px solid var(--line);flex-wrap:wrap}
.mark{width:32px;height:32px;border-radius:var(--r);background:var(--ink);display:grid;
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
.tile .ico{width:34px;height:34px;border-radius:var(--r);background:var(--sunk);color:var(--ink2);
  display:grid;place-items:center;margin-bottom:18px;border:1px solid var(--line)}
.tile:hover .ico{background:var(--ink);color:#fff;border-color:var(--ink)}
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
.stat{padding:18px 24px;min-width:130px;flex:1;border-right:1px solid var(--line)}
.stat:last-child{border-right:0}
.stat b{display:block;font-size:26px;font-weight:600;line-height:1.05;letter-spacing:-.9px}
.stat span{font-size:11px;color:var(--ink3);letter-spacing:.2px;font-weight:400;margin-top:6px;
  display:block}
.stat.hot b{color:var(--rose)} .stat.warm b{color:var(--amber)}
.stat.good b{color:var(--emerald)} .stat.calm b{color:var(--accent)}

/* -------------------------------------------------------- headings */
.sec{font-size:12.5px;font-weight:600;letter-spacing:0;color:var(--ink);
  margin:34px 0 14px;display:flex;align-items:center;gap:10px;text-transform:none}
.sec::after{content:'';flex:1;height:1px;background:var(--line)}
.sec.hot{color:var(--rose)}
.grid{display:grid;gap:14px}

/* -------------------------------------------------------- controls */
.mini{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:var(--r);
  padding:7px 13px;font:500 12px Inter;cursor:pointer;transition:all .15s var(--ease)}
.mini:hover{border-color:var(--ink);color:var(--ink)}
.mini.go{border-color:#BEDCC5;color:var(--emerald);background:var(--emerald-soft)}
.mini.go:hover{background:var(--emerald);border-color:var(--emerald);color:#fff}
.mini:disabled{opacity:.35;cursor:default}
.btn{background:var(--ink);border:1px solid var(--ink);border-radius:var(--r);color:#fff;
  font:500 13px Inter;padding:10px 18px;cursor:pointer;transition:all .15s var(--ease)}
.btn:hover{background:#000;border-color:#000}
.btn:disabled{opacity:.35;cursor:default}
.btn.ghost{background:var(--surface);border-color:var(--line);color:var(--ink2)}
.btn.ghost:hover{border-color:var(--ink);color:var(--ink);background:var(--surface)}

/* -------------------------------------------------------- progress */
.runway{display:flex;gap:4px}
.seg{height:4px;flex:1;border-radius:2px;background:var(--line2);transition:background .3s var(--ease)}
.seg.done.p1{background:var(--s1)} .seg.done.p2{background:var(--s2)}
.seg.done.p3{background:var(--s3)} .seg.done.p4{background:var(--s4)}
.seg.done.p5{background:var(--s5)} .seg.done.p6{background:var(--s6)}
.seg.progress{background:var(--amber);opacity:.5}
.seg.na{background:var(--line)}
.seg.late{background:#E7C3CD}

/* ---------------------------------------------------------- inputs */
input,select,textarea{width:100%;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r);color:var(--ink);font:400 13.5px Inter;padding:10px 12px;outline:none;
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
.step{border:1px solid var(--line);border-left:2px solid var(--line);border-radius:0 var(--r) var(--r) 0;
  padding:16px 18px;margin-top:12px}
.step.e1{border-left-color:var(--s1)} .step.e2{border-left-color:var(--s2)}
.step.e3{border-left-color:var(--s3)} .step.e4{border-left-color:var(--s4)}
.step.e5{border-left-color:var(--s5)} .step.e6{border-left-color:var(--s6)}
.step.done{background:var(--sunk)}
.step.late{border-color:#E7C3CD}
.step .st{font-size:14px;font-weight:600}
.num{width:22px;height:22px;border-radius:3px;display:grid;place-items:center;
  font:600 11px Inter;flex:none}
.ctl{display:flex;gap:6px;margin-top:13px;flex-wrap:wrap}
.ctl button{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:var(--r);padding:6px 12px;font:500 12px Inter;cursor:pointer;
  transition:all .15s var(--ease)}
.ctl button:hover{border-color:var(--ink);color:var(--ink)}
.ctl button[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}
.note{margin-top:11px;font-size:12.5px;padding:9px 11px}

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

/* --------------------------------------------------------- tracker */
.viewswitch{display:inline-flex;gap:0;border:1px solid var(--line);border-radius:var(--r);
  overflow:hidden;margin-bottom:26px}
.viewswitch button{border:0;border-right:1px solid var(--line);background:var(--surface);
  color:var(--ink3);padding:9px 22px;font:500 13px Inter;cursor:pointer;
  transition:all .15s var(--ease)}
.viewswitch button:last-child{border-right:0}
.viewswitch button:hover{color:var(--ink);background:var(--sunk)}
.viewswitch button[data-on="1"]{background:var(--ink);color:#fff}

.toolbar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:24px}
.tabset{display:flex;gap:0;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.tabset button{border:0;border-right:1px solid var(--line);background:var(--surface);color:var(--ink3);
  padding:9px 15px;font:500 12.5px Inter;cursor:pointer;white-space:nowrap;
  transition:all .15s var(--ease)}
.tabset button:last-child{border-right:0}
.tabset button:hover{color:var(--ink);background:var(--sunk)}
.tabset button[data-on="1"]{background:var(--ink);color:#fff}
.search{flex:1;min-width:170px;max-width:300px}
.sync{margin-left:auto;display:flex;align-items:center;gap:11px;font:400 12px Inter;color:var(--ink3)}

.pcard{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  overflow:hidden;cursor:pointer;transition:border-color .18s var(--ease)}
.pcard:hover{border-color:var(--ink3)}
.pcard.late{border-color:#E7C3CD}
.pc-top{display:flex;align-items:flex-start;gap:12px;padding:20px 22px 0;flex-wrap:wrap}
.pc-name{font-size:16px;font-weight:600;letter-spacing:-.25px;display:flex;align-items:center;
  gap:9px;flex-wrap:wrap}
.pc-ref{font:500 11px Inter;background:var(--sunk);color:var(--ink3);border:1px solid var(--line);
  border-radius:3px;padding:2px 7px}
.pc-meta{font-size:12.5px;color:var(--ink3);font-weight:400;margin-top:6px}
.pc-right{margin-left:auto;display:flex;align-items:center;gap:10px}
.pc-count{font:500 12px Inter;color:var(--ink3)}
.pc-bar{padding:16px 22px 0}
.pc-steps{padding:8px 22px 16px}
.pstep{display:flex;align-items:center;gap:13px;padding:12px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap}
.pstep:last-child{border-bottom:0}
.pstep:hover{background:var(--sunk)}
.pnum{width:22px;height:22px;border-radius:3px;display:grid;place-items:center;
  font:600 11px Inter;flex:none}
.p1{background:var(--s1-soft);color:var(--s1)} .p2{background:var(--s2-soft);color:var(--s2)}
.p3{background:var(--s3-soft);color:var(--s3)} .p4{background:var(--s4-soft);color:var(--s4)}
.p5{background:var(--s5-soft);color:var(--s5)} .p6{background:var(--s6-soft);color:var(--s6)}
.plabel{font-size:13.5px;font-weight:500;flex:1;min-width:130px}
.pacts{display:flex;gap:7px;margin-left:auto}
.pfoot{border-top:1px solid var(--line2);padding:14px 22px;display:flex;gap:10px;
  align-items:center;background:var(--sunk);flex-wrap:wrap}
.allgood{font-size:12.5px;color:var(--emerald);font-weight:500;padding:6px 0}

.stepchips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.stepchip{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:var(--r);padding:9px 13px;font:500 12.5px Inter;cursor:pointer;display:flex;
  align-items:center;gap:9px;transition:all .15s var(--ease)}
.stepchip:hover{border-color:var(--ink);color:var(--ink)}
.stepchip[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}
.stepchip .sq{width:7px;height:7px;border-radius:2px;flex:none}
.stepchip.c1 .sq{background:var(--s1)} .stepchip.c2 .sq{background:var(--s2)}
.stepchip.c3 .sq{background:var(--s3)} .stepchip.c4 .sq{background:var(--s4)}
.stepchip.c5 .sq{background:var(--s5)} .stepchip.c6 .sq{background:var(--s6)}
.stepchip[data-on="1"] .sq{background:#fff}
.stepchip .n{font:500 11.5px Inter;color:var(--ink3)}
.stepchip[data-on="1"] .n{color:rgba(255,255,255,.7)}
.stepchip.empty{opacity:.4}

.batch{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden}
.batch-h{display:flex;align-items:center;gap:12px;padding:20px 22px 14px;flex-wrap:wrap}
.batch-h .t{font-size:15px;font-weight:600;letter-spacing:-.2px}
.batch-h .c{font:400 12px Inter;color:var(--ink3)}
.prow{display:flex;align-items:center;gap:13px;padding:13px 22px;border-top:1px solid var(--line2);
  cursor:pointer;transition:background .12s var(--ease)}
.prow:hover{background:var(--sunk)}
.prow input{width:15px;height:15px;flex:none;margin:0;accent-color:#1C1917;cursor:pointer}
.ini{width:28px;height:28px;border-radius:50%;background:var(--sunk);color:var(--ink2);
  border:1px solid var(--line);display:grid;place-items:center;font:500 11px Inter;flex:none}
.prow .nm{font-size:14px;font-weight:500;flex:1;min-width:120px}
.prow .sp{margin-left:auto;display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.batch-f{display:flex;align-items:center;gap:12px;padding:16px 22px;background:var(--sunk);
  border-top:1px solid var(--line2);flex-wrap:wrap}

.fold{margin-top:30px;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r-lg);overflow:hidden}
.fold-h{display:flex;align-items:center;gap:12px;padding:17px 20px;cursor:pointer;
  transition:background .12s var(--ease);user-select:none}
.fold-h:hover{background:var(--sunk)}
.fold-t{font-size:13.5px;font-weight:600}
.fold-c{font:400 12px Inter;color:var(--ink3)}
.caret{margin-left:auto;color:var(--ink3);font-size:11px;transition:transform .18s var(--ease)}
.caret[data-open="1"]{transform:rotate(180deg)}
.fold-b{padding:8px 20px 20px;border-top:1px solid var(--line2)}

.bar-row{display:flex;align-items:center;gap:14px;padding:8px 0}
.bar-lbl{font-size:12.5px;color:var(--ink2);font-weight:400;width:170px;flex:none;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-track{flex:1;height:6px;background:var(--line2);border-radius:3px;overflow:hidden}
.bar-fill{display:block;height:6px;border-radius:3px;transition:width .4s var(--ease)}
.bar-fill.p1{background:var(--s1)} .bar-fill.p2{background:var(--s2)} .bar-fill.p3{background:var(--s3)}
.bar-fill.p4{background:var(--s4)} .bar-fill.p5{background:var(--s5)} .bar-fill.p6{background:var(--s6)}
.bar-n{font:500 12.5px Inter;width:24px;text-align:right;color:var(--ink2)}

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

/* --------------------------------------------------------- reports */
.panelbox{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  padding:24px 26px}
.filters{display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;margin-bottom:24px}
.filters select{width:auto;min-width:150px}
.filters .dl{margin-left:auto;display:flex;gap:9px;align-items:center}
.months{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.monthchip{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:var(--r);padding:8px 14px;font:500 12.5px Inter;cursor:pointer}
.monthchip:hover{border-color:var(--ink);color:var(--ink)}
.monthchip[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}

.headline{border-left:2px solid var(--ink);padding:4px 0 4px 20px;margin-bottom:28px}
.headline p{font-size:15px;color:var(--ink2);line-height:1.85;font-weight:400}
.headline b{font-weight:600;color:var(--ink)}

.mrow{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap}
.mrow:last-child{border-bottom:0}
.mlbl{font-size:13.5px;font-weight:500;width:180px;flex:none;display:flex;align-items:center;gap:9px}
.mtrack{flex:1;min-width:130px;height:8px;background:var(--line2);border-radius:4px;overflow:hidden}
.mfill{display:block;height:8px;border-radius:4px;transition:width .4s var(--ease)}
.mfill.p1{background:var(--s1)} .mfill.p2{background:var(--s2)} .mfill.p3{background:var(--s3)}
.mfill.p4{background:var(--s4)} .mfill.p5{background:var(--s5)} .mfill.p6{background:var(--s6)}
.mval{font:600 13px Inter;width:72px;text-align:right;color:var(--ink)}
.msub{font-size:12px;color:var(--ink3);font-weight:400;width:132px;text-align:right}

.thead{display:flex;align-items:center;gap:14px;padding:0 0 11px;border-bottom:1px solid var(--line);
  font:500 11px Inter;color:var(--ink3);text-transform:none;letter-spacing:0}
.tcell{width:82px;flex:none;text-align:right;font:600 13px Inter;color:var(--ink)}
.thead .tcell{font:500 11px Inter;color:var(--ink3)}
.tcell.ok{color:var(--emerald)} .tcell.warn{color:var(--amber)} .tcell.bad{color:var(--rose)}
.tcell.dim{color:var(--ink3);font-weight:400}
.foot-note{font-size:12.5px;color:var(--ink3);font-weight:400;line-height:1.7;margin-top:18px;
  padding-top:16px;border-top:1px solid var(--line2)}

/* monthly columns */
.cols{display:flex;gap:10px;align-items:flex-end;padding:10px 0 0;min-height:200px}
.col{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;
  border-radius:var(--r);padding:8px 3px;transition:background .15s var(--ease)}
.col:hover{background:var(--sunk)}
.col.on{background:var(--sunk);box-shadow:inset 0 0 0 1px var(--line)}
.colv{font:500 11px Inter;color:var(--ink2);height:15px;white-space:nowrap}
.coltrack{width:100%;max-width:44px;height:126px;background:var(--line2);border-radius:3px;
  display:flex;align-items:flex-end;overflow:hidden}
.colbar{width:100%;border-radius:3px;transition:height .45s var(--ease)}
.coll{font:500 12px Inter;color:var(--ink2)}
.colc{font:400 11px Inter;color:var(--ink3)}

/* where the time goes */
.legend{display:flex;gap:22px;flex-wrap:wrap;margin-bottom:20px;font:400 12.5px Inter;
  color:var(--ink3);padding-bottom:16px;border-bottom:1px solid var(--line2)}
.legend i,.k{width:9px;height:9px;border-radius:2px;display:inline-block;margin-right:7px}
.k.touch{background:#D9DFF0} .k.work{background:var(--s1)}
.k.target{background:transparent;border-left:1px dashed var(--ink3);border-radius:0;width:3px}
.k.us{background:var(--rose)} .k.them{background:var(--amber)}
.srow{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap}
.srow:last-of-type{border-bottom:0}
.slabel{display:flex;align-items:center;gap:9px;width:190px;flex:none;font-size:13.5px;font-weight:500}
.sbar{flex:1;min-width:150px;height:14px;background:var(--line2);border-radius:3px;
  position:relative;display:flex;overflow:hidden}
.stouch{display:block;height:14px;background:#D9DFF0}
.swork{display:block;height:14px}
.swork.p1{background:var(--s1)} .swork.p2{background:var(--s2)} .swork.p3{background:var(--s3)}
.swork.p4{background:var(--s4)} .swork.p5{background:var(--s5)} .swork.p6{background:var(--s6)}
.starget{position:absolute;top:0;bottom:0;width:0;border-left:1px dashed var(--ink3)}
.stotal{width:84px;text-align:right;font:600 13px Inter;color:var(--ink);flex:none}

/* delays */
.split{margin-bottom:18px}
.splitbar{display:flex;height:8px;border-radius:4px;overflow:hidden;background:var(--line2)}
.sfill{display:block;height:8px}
.sfill.us{background:var(--rose)} .sfill.them{background:var(--amber)}
.splitkey{display:flex;gap:20px;margin-top:11px;font:400 12.5px Inter;color:var(--ink2);flex-wrap:wrap}
.donutwrap{display:flex;gap:28px;align-items:center;flex-wrap:wrap;margin-bottom:20px;
  padding-bottom:20px;border-bottom:1px solid var(--line2)}
.donutkey{display:grid;gap:14px}
.donutkey div{font:400 13.5px Inter;color:var(--ink2)}
.donutkey b{font-size:16px;font-weight:600;color:var(--ink);margin-right:5px}
.donutkey span{display:block;font:400 12px Inter;color:var(--ink3);margin-left:16px;margin-top:3px}
.drow{display:flex;align-items:center;gap:13px;padding:13px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap}
.drow:last-child{border-bottom:0}
.dtext{font-size:13px;color:var(--ink2);flex:1;min-width:200px;line-height:1.6}
.dwho{font-size:12px;color:var(--ink3);font-weight:400;white-space:nowrap}

/* --------------------------------------------------------- sources */
.locked{border:1px solid var(--line);background:var(--sunk);border-radius:var(--r-lg);
  padding:16px 20px;margin-bottom:26px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.locked b{font-size:13.5px;font-weight:600;color:var(--ink);display:block}
.locked span{font-size:12.5px;color:var(--ink3);font-weight:400}
.locked .tag{font:500 11px Inter;background:var(--ink);color:#fff;border-radius:3px;
  padding:4px 9px;flex:none}
.src{display:flex;align-items:center;gap:16px;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r-lg);padding:20px 22px;transition:border-color .18s var(--ease)}
.src:hover{border-color:var(--ink3)}
.src-ico{width:36px;height:36px;border-radius:var(--r);display:grid;place-items:center;
  font:600 12px Inter;flex:none}
.src-ico.green{background:var(--s6-soft);color:var(--s6)}
.src-ico.amber{background:var(--s2-soft);color:var(--s2)}
.src-ico.accent{background:var(--s3-soft);color:var(--s3)}
.src-ico.grey{background:var(--sunk);color:var(--ink2);border:1px solid var(--line)}
.src-body{flex:1;min-width:190px}
.src-name{font-size:15px;font-weight:600;letter-spacing:-.2px;display:flex;align-items:center;
  gap:9px;flex-wrap:wrap}
.src-desc{font-size:13px;color:var(--ink2);font-weight:400;line-height:1.6;margin-top:6px}
.src-detail{font:400 12px Inter;color:var(--ink3);margin-top:10px;background:var(--sunk);
  border:1px solid var(--line);border-radius:3px;padding:6px 10px;display:inline-block;
  max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.src-act{flex:none;margin-left:auto}

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
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><style dangerouslySetInnerHTML={{ __html: css }} /></head>
      <body>{children}</body>
    </html>
  );
}
