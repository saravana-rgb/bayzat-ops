/* Shell styles: tokens, typography, buttons, tiles, panels.
   Shared by every tile — change with care, it affects all of them. */
export const commonCss = `
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
.pc-ref{font:500 11px Inter;background:var(--sunk);color:var(--ink3);border:1px solid var(--line);
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
`;
