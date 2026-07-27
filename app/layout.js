export const metadata = {
  title: 'Bayzat Ops',
  description: 'Internal tools for the IT and People Ops'
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Flat surfaces, no gradients. One blue for anything you can act on,
   and three status tones that mean exactly one thing each. */
:root{
  --canvas:#F8FAFC; --surface:#FFFFFF; --sunk:#F8FAFC;
  --line:#E2E8F0; --line2:#F1F5F9;
  --ink:#0F172A; --ink2:#475569; --ink3:#94A3B8;

  --blue:#2563EB; --blue-ink:#1D4ED8; --blue-soft:#EFF6FF;
  --emerald:#047857; --emerald-soft:#ECFDF5;
  --amber:#B45309;  --amber-soft:#FFFBEB;
  --rose:#BE123C;   --rose-soft:#FFF1F2;
  --violet:#6D28D9; --violet-soft:#F5F3FF;

  --s1:#2563EB; --s1-soft:#EFF6FF;
  --s2:#EA580C; --s2-soft:#FFF7ED;
  --s3:#7C3AED; --s3-soft:#F5F3FF;
  --s4:#0D9488; --s4-soft:#F0FDFA;
  --s5:#DB2777; --s5-soft:#FDF2F8;
  --s6:#16A34A; --s6-soft:#F0FDF4;

  --shadow:0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06);
  --ease:cubic-bezier(.2,.8,.3,1);
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--canvas);color:var(--ink);font-family:Inter,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;font-feature-settings:'tnum' 1}
a{color:inherit;text-decoration:none}
h1,h2,h3,p{margin:0}
::selection{background:var(--blue-soft)}
:focus-visible{outline:2px solid var(--blue);outline-offset:2px;border-radius:6px}
.wrap{max-width:1060px;margin:0 auto;padding:24px 20px 70px}

.bar{display:flex;align-items:center;gap:13px;background:var(--surface);border:1px solid var(--line);
  border-radius:12px;padding:14px 17px;margin-bottom:20px;flex-wrap:wrap}
.mark{width:33px;height:33px;border-radius:8px;background:var(--ink);display:grid;place-items:center;
  color:#fff;font-weight:700;font-size:14px;flex:none}
.bar h1{font-size:16.5px;font-weight:700;letter-spacing:-.3px}
.bar .sub{font-size:11.5px;color:var(--ink3);font-weight:500;margin-top:3px}
.bar .right{margin-left:auto;display:flex;align-items:center;gap:10px;font-size:12px;
  color:var(--ink3);font-weight:500}
.back{font-size:12px;font-weight:600;color:var(--blue);padding:6px 11px;border-radius:7px;
  background:var(--blue-soft);transition:all .15s var(--ease)}
.back:hover{background:var(--blue);color:#fff}

.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:13px}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:20px;
  display:flex;flex-direction:column;min-height:186px;transition:all .17s var(--ease)}
.tile:hover{border-color:var(--blue);box-shadow:var(--shadow);transform:translateY(-2px)}
.tile .badges{margin-top:auto;padding-top:13px}
.tile .ico{width:40px;height:40px;border-radius:10px;background:var(--blue-soft);color:var(--blue);
  display:grid;place-items:center;margin-bottom:14px;transition:all .17s var(--ease)}
.tile:hover .ico{background:var(--blue);color:#fff}
.tile .ico.violet{background:var(--s3-soft);color:var(--s3)}
.tile:hover .ico.violet{background:var(--s3);color:#fff}
.tile .ico.emerald{background:var(--s6-soft);color:var(--s6)}
.tile:hover .ico.emerald{background:var(--s6);color:#fff}
.tile h2{font-size:14.5px;font-weight:700;letter-spacing:-.2px}
.tile p{font-size:12.5px;color:var(--ink3);font-weight:500;line-height:1.55;margin-top:6px}
.tile.soon{opacity:.5;pointer-events:none;border-style:dashed}
.tile.soon .ico{background:var(--line2);color:var(--ink3)}
.badges{display:flex;gap:6px;flex-wrap:wrap}

.chip{font-size:10.5px;font-weight:600;border-radius:6px;padding:4px 8px;white-space:nowrap;
  display:inline-block}
.chip.red{background:var(--rose-soft);color:var(--rose)}
.chip.amber{background:var(--amber-soft);color:var(--amber)}
.chip.green{background:var(--emerald-soft);color:var(--emerald)}
.chip.grey{background:var(--line2);color:var(--ink2)}
.chip.accent{background:var(--blue-soft);color:var(--blue-ink)}
.chip.violet{background:var(--violet-soft);color:var(--violet)}

.stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:11px;padding:13px 16px;
  min-width:104px}
.stat b{display:block;font-size:21px;font-weight:700;line-height:1.1;letter-spacing:-.5px}
.stat span{font-size:9.5px;color:var(--ink3);text-transform:uppercase;letter-spacing:.5px;font-weight:600}
.stat.hot b{color:var(--rose)} .stat.warm b{color:var(--amber)}
.stat.good b{color:var(--emerald)} .stat.calm b{color:var(--blue)}

.sec{font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:var(--ink3);
  margin:24px 0 11px;display:flex;align-items:center;gap:9px}
.sec::after{content:'';flex:1;height:1px;background:var(--line)}
.sec.hot{color:var(--rose)}
.grid{display:grid;gap:10px}

.mini{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:7px;
  padding:7px 12px;font:600 11.5px Inter;cursor:pointer;transition:all .15s var(--ease)}
.mini:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-soft)}
.mini:active{transform:scale(.97)}
.mini.go{border-color:#A7D8C4;color:var(--emerald);background:var(--emerald-soft)}
.mini.go:hover{background:var(--emerald);border-color:var(--emerald);color:#fff}
.mini:disabled{opacity:.4;cursor:default;transform:none}
.btn{background:var(--blue);border:0;border-radius:8px;color:#fff;font:600 12.5px Inter;
  padding:11px 19px;cursor:pointer;transition:all .15s var(--ease)}
.btn:hover{background:var(--blue-ink)}
.btn:active{transform:scale(.985)}
.btn:disabled{opacity:.45;cursor:default}
.btn.ghost{background:var(--surface);border:1px solid var(--line);color:var(--ink2)}
.btn.ghost:hover{border-color:var(--blue);color:var(--blue)}

.runway{display:flex;gap:3px}
.seg{height:7px;flex:1;border-radius:4px;background:var(--line);transition:background .3s var(--ease)}
.seg.done.p1{background:var(--s1)} .seg.done.p2{background:var(--s2)}
.seg.done.p3{background:var(--s3)} .seg.done.p4{background:var(--s4)}
.seg.done.p5{background:var(--s5)} .seg.done.p6{background:var(--s6)}
.seg.progress{background:var(--amber)}
.seg.na{background:var(--line2);border:1px solid var(--line)}
.seg.late{background:#F1A9BB}

input,select,textarea{width:100%;background:var(--surface);border:1px solid var(--line);
  border-radius:8px;color:var(--ink);font:500 13px Inter;padding:10px 12px;outline:none;
  transition:all .15s var(--ease)}
input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-soft)}
input::placeholder{color:var(--ink3)}
label{display:block;font-size:9.5px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;
  color:var(--ink3);margin-bottom:6px}

.veil{position:fixed;inset:0;background:rgba(15,23,42,.38);backdrop-filter:blur(2px);z-index:40;
  display:flex;align-items:center;justify-content:center;padding:18px;animation:fade .18s var(--ease)}
@keyframes fade{from{opacity:0}to{opacity:1}}
.panel{background:var(--surface);border-radius:14px;width:100%;max-width:620px;max-height:88vh;
  overflow:auto;padding:22px;box-shadow:0 24px 60px rgba(15,23,42,.24);animation:rise .2s var(--ease)}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.panel .ph{display:flex;align-items:flex-start;gap:12px}
.x{margin-left:auto;background:var(--surface);border:1px solid var(--line);color:var(--ink2);
  border-radius:7px;width:30px;height:30px;font-size:13px;cursor:pointer;flex:none}
.x:hover{background:var(--rose-soft);color:var(--rose);border-color:#F3C3CF}
.step{border:1px solid var(--line);border-left:3px solid var(--line);border-radius:0 10px 10px 0;
  padding:13px 14px;margin-top:9px}
.step.e1{border-left-color:var(--s1)} .step.e2{border-left-color:var(--s2)}
.step.e3{border-left-color:var(--s3)} .step.e4{border-left-color:var(--s4)}
.step.e5{border-left-color:var(--s5)} .step.e6{border-left-color:var(--s6)}
.step.done{border-color:#B7E0CD;background:var(--emerald-soft)}
.step.late{border-color:#F3C3CF}
.step .st{font-size:13.5px;font-weight:600}
.num{width:23px;height:23px;border-radius:7px;display:grid;place-items:center;
  font:700 10.5px Inter;flex:none}
.ctl{display:flex;gap:5px;margin-top:11px;flex-wrap:wrap}
.ctl button{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:7px;
  padding:6px 12px;font:600 11.5px Inter;cursor:pointer;transition:all .15s var(--ease)}
.ctl button:hover{border-color:var(--blue);color:var(--blue)}
.ctl button[data-on="1"]{background:var(--blue);border-color:var(--blue);color:#fff}
.note{margin-top:9px;font-size:12px;padding:9px 11px}

.empty{background:var(--surface);border:1px dashed var(--line);border-radius:12px;
  padding:42px 20px;text-align:center}
.empty b{display:block;font-size:14.5px;font-weight:700;margin-bottom:6px}
.empty span{font-size:12.5px;color:var(--ink3)}
.center{min-height:82vh;display:grid;place-items:center;text-align:center;padding:20px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:30px;
  max-width:370px;width:100%;box-shadow:var(--shadow)}
.err{background:var(--rose-soft);color:var(--rose);border-radius:8px;padding:11px 14px;
  font-size:12.5px;font-weight:500;margin-bottom:14px;text-align:left}

/* ---------------------------------------------- onboarding tracker */
.toolbar{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:18px}
.tabset{display:flex;gap:6px;flex-wrap:wrap}
.tabset button{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:8px;padding:9px 14px;font:600 12px Inter;cursor:pointer;white-space:nowrap;
  transition:all .15s var(--ease)}
.tabset button:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-soft)}
.tabset button[data-on="1"]{background:var(--blue);border-color:var(--blue);color:#fff}
.search{flex:1;min-width:160px;max-width:290px}
.sync{margin-left:auto;display:flex;align-items:center;gap:9px;font:600 11px Inter;color:var(--ink3)}

.pcard{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;
  transition:all .17s var(--ease);cursor:pointer}
.pcard:hover{border-color:var(--blue);box-shadow:var(--shadow);transform:translateY(-1px)}
.pstep:hover{background:var(--sunk)}
.pcard.late{border-color:#F3C3CF}
.pc-top{display:flex;align-items:flex-start;gap:12px;padding:15px 16px 0;flex-wrap:wrap}
.pc-name{font-size:14.5px;font-weight:700;letter-spacing:-.2px;display:flex;align-items:center;
  gap:8px;flex-wrap:wrap}
.pc-ref{font:600 10px Inter;background:var(--line2);color:var(--ink2);border-radius:5px;padding:3px 7px}
.pc-meta{font-size:11.5px;color:var(--ink3);font-weight:500;margin-top:5px}
.pc-right{margin-left:auto;display:flex;align-items:center;gap:9px}
.pc-count{font:700 11.5px Inter;color:var(--ink3)}
.pc-bar{padding:12px 16px 0}
.pc-steps{padding:5px 16px 13px}
.pstep{display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap}
.pstep:last-child{border-bottom:0}
.pnum{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;
  font:700 10.5px Inter;flex:none}
.p1{background:var(--s1-soft);color:var(--s1)} .p2{background:var(--s2-soft);color:var(--s2)}
.p3{background:var(--s3-soft);color:var(--s3)} .p4{background:var(--s4-soft);color:var(--s4)}
.p5{background:var(--s5-soft);color:var(--s5)} .p6{background:var(--s6-soft);color:var(--s6)}
.plabel{font-size:13px;font-weight:600;flex:1;min-width:120px}
.pacts{display:flex;gap:6px;margin-left:auto}
.pfoot{border-top:1px solid var(--line2);padding:11px 16px;display:flex;gap:8px;align-items:center;
  background:var(--sunk);flex-wrap:wrap}
.note-txt{font-size:11.5px;color:var(--ink3);font-weight:500}
.allgood{font-size:11.5px;color:var(--emerald);font-weight:600;padding:5px 0}

.stepchips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px}
.stepchip{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:8px;
  padding:8px 12px;font:600 12px Inter;cursor:pointer;display:flex;align-items:center;gap:8px;
  transition:all .15s var(--ease)}
.stepchip:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-soft)}
.stepchip[data-on="1"]{color:#fff}
.stepchip[data-on="1"].c1{background:var(--s1);border-color:var(--s1)}
.stepchip[data-on="1"].c2{background:var(--s2);border-color:var(--s2)}
.stepchip[data-on="1"].c3{background:var(--s3);border-color:var(--s3)}
.stepchip[data-on="1"].c4{background:var(--s4);border-color:var(--s4)}
.stepchip[data-on="1"].c5{background:var(--s5);border-color:var(--s5)}
.stepchip[data-on="1"].c6{background:var(--s6);border-color:var(--s6)}
.stepchip .sq{width:8px;height:8px;border-radius:3px;flex:none}
.stepchip.c1 .sq{background:var(--s1)} .stepchip.c2 .sq{background:var(--s2)}
.stepchip.c3 .sq{background:var(--s3)} .stepchip.c4 .sq{background:var(--s4)}
.stepchip.c5 .sq{background:var(--s5)} .stepchip.c6 .sq{background:var(--s6)}
.stepchip[data-on="1"] .sq{background:rgba(255,255,255,.85)}
.stepchip .n{font:700 11px Inter;background:var(--line2);color:var(--ink2);border-radius:20px;
  padding:2px 8px;min-width:22px;text-align:center}
.stepchip[data-on="1"] .n{background:rgba(255,255,255,.22);color:#fff}
.stepchip.empty{opacity:.45}

.batch{background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden}
.batch-h{display:flex;align-items:center;gap:11px;padding:15px 16px 12px;flex-wrap:wrap}
.batch-h .t{font-size:14.5px;font-weight:700;letter-spacing:-.2px}
.batch-h .c{font:600 11px Inter;color:var(--ink2);background:var(--line2);border-radius:20px;padding:4px 10px}
.prow{display:flex;align-items:center;gap:11px;padding:11px 16px;border-top:1px solid var(--line2);
  cursor:pointer;transition:background .12s var(--ease)}
.prow:hover{background:var(--blue-soft)}
.prow input{width:16px;height:16px;flex:none;margin:0;accent-color:#2563EB;cursor:pointer}
.ini{width:29px;height:29px;border-radius:50%;background:var(--blue-soft);color:var(--blue-ink);
  display:grid;place-items:center;font:700 10.5px Inter;flex:none}
.prow .nm{font-size:13.5px;font-weight:600;flex:1;min-width:110px}
.prow .sp{margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.batch-f{display:flex;align-items:center;gap:11px;padding:13px 16px;background:var(--sunk);
  border-top:1px solid var(--line2);flex-wrap:wrap}

/* collapsible section */
.fold{margin-top:26px;background:var(--surface);border:1px solid var(--line);border-radius:12px;
  overflow:hidden}
.fold-h{display:flex;align-items:center;gap:10px;padding:14px 16px;cursor:pointer;
  transition:background .12s var(--ease);user-select:none}
.fold-h:hover{background:var(--sunk)}
.fold-t{font-size:13px;font-weight:600}
.fold-c{font:600 11px Inter;color:var(--ink2);background:var(--line2);border-radius:20px;padding:3px 9px}
.caret{margin-left:auto;color:var(--ink3);font-size:12px;transition:transform .18s var(--ease)}
.caret[data-open="1"]{transform:rotate(180deg)}
.fold-b{padding:4px 16px 16px;border-top:1px solid var(--line2)}

.bar-row{display:flex;align-items:center;gap:12px;padding:6px 0}
.bar-lbl{font-size:12px;color:var(--ink2);font-weight:500;width:160px;flex:none;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-track{flex:1;height:8px;background:var(--line2);border-radius:4px;overflow:hidden}
.bar-fill{display:block;height:8px;border-radius:4px;transition:width .4s var(--ease)}
.bar-fill.p1{background:var(--s1)} .bar-fill.p2{background:var(--s2)} .bar-fill.p3{background:var(--s3)}
.bar-fill.p4{background:var(--s4)} .bar-fill.p5{background:var(--s5)} .bar-fill.p6{background:var(--s6)}
.bar-n{font:700 12px Inter;width:22px;text-align:right;color:var(--ink2)}

/* comments + timeline */
.cmt{margin-top:11px;border-top:1px solid var(--line2);padding-top:11px}
.cmt-row{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
.cmt-row select{width:auto;min-width:130px;flex:none;font-size:12px;padding:8px 10px}
.cmt-row input{flex:1;min-width:160px;font-size:12px;padding:8px 11px}
.trail{margin-top:10px;display:grid;gap:7px}
.tr{display:flex;gap:9px;align-items:flex-start;font-size:11.5px;color:var(--ink2);line-height:1.5}
.tr .dot{width:7px;height:7px;border-radius:50%;background:var(--line);margin-top:5px;flex:none}
.tr .dot.done{background:var(--emerald)}
.tr .dot.cmt{background:var(--amber)}
.tr .who{color:var(--ink3)}

/* reports */
.mrow{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap}
.mrow:last-child{border-bottom:0}
.mlbl{font-size:13px;font-weight:600;width:170px;flex:none}
.mtrack{flex:1;min-width:120px;height:22px;background:var(--line2);border-radius:5px;overflow:hidden;
  position:relative}
.mfill{display:block;height:22px;border-radius:5px;transition:width .4s var(--ease)}
.mfill.p1{background:var(--s1)} .mfill.p2{background:var(--s2)} .mfill.p3{background:var(--s3)}
.mfill.p4{background:var(--s4)} .mfill.p5{background:var(--s5)} .mfill.p6{background:var(--s6)}
.mval{font:700 12.5px Inter;width:64px;text-align:right;color:var(--ink)}
.msub{font-size:11px;color:var(--ink3);font-weight:500;width:96px;text-align:right}
.panelbox{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:17px 18px}
.months{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px}
.monthchip{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:8px;
  padding:8px 14px;font:600 12px Inter;cursor:pointer;transition:all .15s var(--ease)}
.monthchip:hover{border-color:var(--blue);color:var(--blue);background:var(--blue-soft)}
.monthchip[data-on="1"]{background:var(--blue);border-color:var(--blue);color:#fff}

/* --------------------------------------------------------- sources */
.locked{background:var(--emerald-soft);border:1px solid #B7E0CD;border-radius:10px;
  padding:12px 15px;margin-bottom:20px;display:flex;align-items:center;gap:11px;flex-wrap:wrap}
.locked b{font-size:12.5px;font-weight:600;color:var(--emerald);display:block}
.locked span{font-size:11.5px;color:var(--emerald);opacity:.8;font-weight:500}
.locked .tag{font:600 10px Inter;background:var(--emerald);color:#fff;border-radius:5px;
  padding:4px 8px;letter-spacing:.3px;flex:none}

.src{display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--line);
  border-radius:12px;padding:15px 16px;transition:all .17s var(--ease)}
.src:hover{border-color:var(--blue);box-shadow:var(--shadow);transform:translateY(-1px)}
.src-ico{width:36px;height:36px;border-radius:9px;display:grid;place-items:center;
  font:700 12px Inter;flex:none;letter-spacing:.3px}
.src-ico.green{background:var(--s6-soft);color:var(--s6)}
.src-ico.amber{background:var(--s2-soft);color:var(--s2)}
.src-ico.accent{background:var(--s3-soft);color:var(--s3)}
.src-ico.grey{background:var(--line2);color:var(--ink2)}
.src-body{flex:1;min-width:180px}
.src-name{font-size:14px;font-weight:700;letter-spacing:-.2px;display:flex;align-items:center;
  gap:8px;flex-wrap:wrap}
.src-desc{font-size:12.5px;color:var(--ink2);font-weight:500;line-height:1.5;margin-top:4px}
.src-detail{font:500 11px Inter;color:var(--ink3);margin-top:7px;background:var(--sunk);
  border:1px solid var(--line2);border-radius:6px;padding:5px 9px;display:inline-block;
  max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.src-act{flex:none;margin-left:auto}
@media(max-width:560px){.src{align-items:flex-start;flex-wrap:wrap}.src-act{margin-left:0;width:100%}}


/* ------------------------------------------------- reports + switch */
.viewswitch{display:inline-flex;gap:4px;background:var(--line2);border-radius:10px;padding:4px;
  margin-bottom:18px}
.viewswitch button{border:0;background:transparent;color:var(--ink2);border-radius:7px;
  padding:8px 18px;font:600 12.5px Inter;cursor:pointer;transition:all .15s var(--ease)}
.viewswitch button:hover{color:var(--ink)}
.viewswitch button[data-on="1"]{background:var(--surface);color:var(--ink);
  box-shadow:0 1px 2px rgba(15,23,42,.12)}

.filters{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-bottom:18px}
.filters select{width:auto;min-width:140px}
.filters .dl{margin-left:auto}

.thead{display:flex;align-items:center;gap:12px;padding:0 0 9px;border-bottom:1px solid var(--line);
  font:600 10px Inter;text-transform:uppercase;letter-spacing:.5px;color:var(--ink3)}
.tcell{width:74px;flex:none;text-align:right;font:700 12.5px Inter;color:var(--ink)}
.thead .tcell{font:600 10px Inter;color:var(--ink3)}
.tcell.ok{color:var(--emerald)} .tcell.warn{color:var(--amber)} .tcell.bad{color:var(--rose)}
.tcell.dim{color:var(--ink3);font-weight:600}
.mlbl{display:flex;align-items:center;gap:8px}
.foot-note{font-size:11.5px;color:var(--ink3);font-weight:500;line-height:1.6;margin-top:13px;
  padding-top:12px;border-top:1px solid var(--line2)}

.split{margin-bottom:14px}
.splitbar{display:flex;height:10px;border-radius:5px;overflow:hidden;background:var(--line2)}
.sfill{display:block;height:10px}
.sfill.us{background:var(--rose)} .sfill.them{background:var(--amber)}
.splitkey{display:flex;gap:16px;margin-top:8px;font:600 11.5px Inter;color:var(--ink2);flex-wrap:wrap}
.splitkey i,.k{width:9px;height:9px;border-radius:3px;display:inline-block;margin-right:6px}
.k.us{background:var(--rose)} .k.them{background:var(--amber)}

.drow{display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap}
.drow:last-child{border-bottom:0}
.dtext{font-size:12.5px;color:var(--ink2);flex:1;min-width:180px;line-height:1.5}
.dwho{font-size:11px;color:var(--ink3);font-weight:500;white-space:nowrap}
@media(max-width:640px){.thead{display:none}.tcell{width:auto}}

@media(max-width:560px){.wrap{padding:16px 13px 44px}.mlbl{width:100%}.bar-lbl{width:100%}}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><style dangerouslySetInnerHTML={{ __html: css }} /></head>
      <body>{children}</body>
    </html>
  );
}
