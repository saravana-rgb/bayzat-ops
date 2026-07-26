export const metadata = {
  title: 'Bayzat Ops',
  description: 'Internal tools for the IT and People Ops'
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* Colour carries meaning here: indigo is the product, emerald is done,
   amber is in progress, rose is waiting too long, teal is a source. */
:root{
  --canvas:#F6F7FB;
  --surface:#FFFFFF;
  --sunk:#FAFAFD;
  --line:#E4E6F0;
  --line2:#EFF1F8;

  --ink:#151726;
  --ink2:#565B75;
  --ink3:#8B90AB;

  --indigo:#4F46E5;  --indigo-ink:#3730A3;  --indigo-soft:#EEF0FE;
  --teal:#0D9488;    --teal-ink:#0F766E;    --teal-soft:#E6F6F4;
  --emerald:#059669; --emerald-soft:#E7F7F0;
  --amber:#D97706;   --amber-soft:#FEF4E6;
  --rose:#E11D48;    --rose-soft:#FEECF0;
  --violet:#7C3AED;  --violet-soft:#F3EDFE;

  --r:11px;
  --shadow:0 1px 2px rgba(21,23,38,.05), 0 10px 30px rgba(21,23,38,.07);
  --ease:cubic-bezier(.2,.8,.3,1);
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--canvas);color:var(--ink);font-family:Inter,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;font-feature-settings:'tnum' 1}
a{color:inherit;text-decoration:none}
h1,h2,h3,p{margin:0}
::selection{background:var(--indigo-soft)}
:focus-visible{outline:2px solid var(--indigo);outline-offset:2px;border-radius:6px}
.wrap{max-width:1060px;margin:0 auto;padding:26px 20px 70px}

/* ---------------------------------------------------------- top bar */
.bar{display:flex;align-items:center;gap:13px;background:var(--surface);border:1px solid var(--line);
  border-radius:14px;padding:14px 17px;margin-bottom:20px;flex-wrap:wrap;box-shadow:var(--shadow)}
.mark{width:34px;height:34px;border-radius:10px;
  background:linear-gradient(135deg,#4F46E5,#7C3AED);display:grid;place-items:center;
  color:#fff;font-weight:800;font-size:15px;flex:none;letter-spacing:-.3px}
.bar h1{font-size:16.5px;font-weight:700;letter-spacing:-.3px}
.bar .sub{font-size:11.5px;color:var(--ink3);font-weight:500;margin-top:3px}
.bar .right{margin-left:auto;display:flex;align-items:center;gap:10px;font-size:12px;
  color:var(--ink3);font-weight:500}
.back{font-size:12px;font-weight:600;color:var(--indigo);padding:6px 11px;border-radius:8px;
  background:var(--indigo-soft);transition:all .15s var(--ease)}
.back:hover{background:var(--indigo);color:#fff}

/* ------------------------------------------------------------ tiles */
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(258px,1fr));gap:14px;
  align-items:start}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:20px;
  display:block;position:relative;overflow:hidden;
  transition:border-color .18s var(--ease),transform .18s var(--ease),box-shadow .18s var(--ease)}
.tile::before{content:'';position:absolute;inset:0 0 auto 0;height:3px;
  background:linear-gradient(90deg,#4F46E5,#7C3AED)}
.tile:hover{border-color:var(--indigo);transform:translateY(-3px);box-shadow:var(--shadow)}
.tile:active{transform:translateY(-1px)}
.tile .ico{width:38px;height:38px;border-radius:10px;
  background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;
  display:grid;place-items:center;font-size:16px;font-weight:700;margin-bottom:14px}
.tile h2{font-size:15px;font-weight:700;letter-spacing:-.2px}
.tile p{font-size:12.5px;color:var(--ink3);font-weight:500;line-height:1.55;margin-top:6px}
.tile.soon{opacity:.55;pointer-events:none;border-style:dashed}
.tile.soon::before{background:var(--line)}
.tile.soon .ico{background:var(--line2);color:var(--ink3)}

/* compact variant — for utility tiles that should not shout */
.tile.compact{padding:14px 16px;display:flex;align-items:center;gap:12px}
.tile.compact::before{background:linear-gradient(90deg,#0D9488,#0F766E)}
.tile.compact:hover{border-color:var(--teal)}
.tile.compact .ico{width:30px;height:30px;border-radius:8px;margin:0;font-size:13px;
  background:linear-gradient(135deg,#0D9488,#0F766E)}
.tile.compact h2{font-size:13.5px}
.tile.compact p{font-size:11.5px;margin-top:2px}
.badges{display:flex;gap:6px;margin-top:13px;flex-wrap:wrap}
.lock{margin-left:auto;font-size:11px;color:var(--teal);font-weight:700;white-space:nowrap}

/* ------------------------------------------------- chips and counts */
.chip{font-size:10px;font-weight:700;letter-spacing:.2px;border-radius:6px;padding:4px 8px;
  white-space:nowrap;display:inline-block}
.chip.red{background:var(--rose-soft);color:var(--rose)}
.chip.amber{background:var(--amber-soft);color:var(--amber)}
.chip.green{background:var(--emerald-soft);color:var(--emerald)}
.chip.grey{background:var(--line2);color:var(--ink3)}
.chip.accent{background:var(--indigo-soft);color:var(--indigo-ink)}
.chip.teal{background:var(--teal-soft);color:var(--teal-ink)}

.stats{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:12px;
  padding:12px 16px;min-width:104px;border-left:3px solid var(--indigo)}
.stat b{display:block;font-size:22px;font-weight:700;line-height:1.1;letter-spacing:-.6px;
  color:var(--indigo)}
.stat span{font-size:9.5px;color:var(--ink3);text-transform:uppercase;letter-spacing:.6px;font-weight:700}
.stat.hot{border-left-color:var(--rose);background:var(--rose-soft)} .stat.hot b{color:var(--rose)}
.stat.warm{border-left-color:var(--amber);background:var(--amber-soft)} .stat.warm b{color:var(--amber)}
.stat.good{border-left-color:var(--emerald);background:var(--emerald-soft)} .stat.good b{color:var(--emerald)}
.stat.calm{border-left-color:var(--teal);background:var(--teal-soft)} .stat.calm b{color:var(--teal-ink)}

/* ------------------------------------------------ sections and rows */
.sec{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;
  margin:24px 0 11px;display:flex;align-items:center;gap:9px;color:var(--indigo-ink)}
.sec::after{content:'';flex:1;height:2px;border-radius:2px;
  background:linear-gradient(90deg,var(--indigo-soft),transparent)}
.sec.hot{color:var(--rose)}
.sec.hot::after{background:linear-gradient(90deg,var(--rose-soft),transparent)}
.sec.calm{color:var(--teal-ink)}
.sec.calm::after{background:linear-gradient(90deg,var(--teal-soft),transparent)}
.grid{display:grid;gap:11px}

.mini{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:8px;
  padding:7px 12px;font:600 11.5px Inter;cursor:pointer;transition:all .15s var(--ease)}
.mini:hover{border-color:var(--indigo);color:var(--indigo);background:var(--indigo-soft)}
.mini:active{transform:scale(.97)}
.mini.go{border-color:#A7E0C6;color:var(--emerald);background:var(--emerald-soft)}
.mini.go:hover{background:var(--emerald);border-color:var(--emerald);color:#fff}
.mini:disabled{opacity:.4;cursor:default;transform:none}

.btn{background:linear-gradient(135deg,#4F46E5,#6D28D9);border:0;border-radius:9px;color:#fff;
  font:600 12.5px Inter;padding:11px 20px;cursor:pointer;
  transition:filter .15s var(--ease),transform .1s var(--ease)}
.btn:hover{filter:brightness(1.1)}
.btn:active{transform:scale(.985)}
.btn:disabled{opacity:.5;cursor:default}
.btn.ghost{background:var(--surface);border:1px solid var(--line);color:var(--ink2)}
.btn.ghost:hover{background:var(--sunk);border-color:var(--indigo);color:var(--indigo)}
.btn.teal{background:linear-gradient(135deg,#0D9488,#0F766E)}

/* ------------------------------------------------------- progress */
.runway{display:flex;gap:3px}
.seg{height:6px;flex:1;border-radius:3px;background:var(--line);transition:background .3s var(--ease)}
.seg.done{background:linear-gradient(90deg,#059669,#10B981)}
.seg.progress{background:var(--amber)}
.seg.na{background:var(--line2);border:1px solid var(--line)}
.seg.late{background:#F5B7C4}

/* ---------------------------------------------------------- inputs */
input,select,textarea{width:100%;background:var(--surface);border:1px solid var(--line);
  border-radius:9px;color:var(--ink);font:500 13px Inter;padding:10px 12px;outline:none;
  transition:border-color .15s var(--ease),box-shadow .15s var(--ease)}
input:focus,select:focus,textarea:focus{border-color:var(--indigo);box-shadow:0 0 0 3px var(--indigo-soft)}
input::placeholder{color:var(--ink3)}
label{display:block;font-size:9.5px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;
  color:var(--ink3);margin-bottom:6px}

/* ----------------------------------------------------------- panel */
.veil{position:fixed;inset:0;background:rgba(21,23,38,.38);backdrop-filter:blur(3px);z-index:40;
  display:flex;align-items:center;justify-content:center;padding:18px;animation:fade .18s var(--ease)}
@keyframes fade{from{opacity:0}to{opacity:1}}
.panel{background:var(--surface);border-radius:16px;width:100%;max-width:620px;max-height:88vh;
  overflow:auto;padding:22px;box-shadow:0 24px 60px rgba(21,23,38,.26);animation:rise .22s var(--ease)}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.panel .ph{display:flex;align-items:flex-start;gap:12px}
.x{margin-left:auto;background:var(--surface);border:1px solid var(--line);color:var(--ink2);
  border-radius:8px;width:30px;height:30px;font-size:13px;cursor:pointer;flex:none;
  transition:all .15s var(--ease)}
.x:hover{background:var(--rose-soft);color:var(--rose);border-color:#F5C2CE}
.step{border:1px solid var(--line);border-radius:11px;padding:13px 14px;margin-top:9px;
  transition:border-color .18s var(--ease),background .18s var(--ease)}
.step.done{border-color:#B6E3CE;background:var(--emerald-soft)}
.step.late{border-color:#F5C2CE}
.step .st{font-size:13.5px;font-weight:600}
.num{width:22px;height:22px;border-radius:7px;background:var(--indigo-soft);display:grid;
  place-items:center;font:700 10px Inter;color:var(--indigo-ink);flex:none}
.ctl{display:flex;gap:5px;margin-top:11px;flex-wrap:wrap}
.ctl button{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:7px;
  padding:6px 12px;font:600 11.5px Inter;cursor:pointer;transition:all .15s var(--ease)}
.ctl button:hover{border-color:var(--indigo);color:var(--indigo)}
.ctl button[data-on="1"]{background:linear-gradient(135deg,#4F46E5,#6D28D9);
  border-color:transparent;color:#fff}
.note{margin-top:9px;font-size:12px;padding:9px 11px}

/* ------------------------------------------------------ misc */
.empty{background:var(--surface);border:1px dashed var(--line);border-radius:14px;
  padding:44px 20px;text-align:center}
.empty b{display:block;font-size:14.5px;font-weight:700;margin-bottom:6px}
.empty span{font-size:12.5px;color:var(--ink3)}
.center{min-height:82vh;display:grid;place-items:center;text-align:center;padding:20px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:30px;
  max-width:370px;width:100%;box-shadow:var(--shadow)}
.err{background:var(--rose-soft);color:var(--rose);border-radius:9px;padding:11px 14px;
  font-size:12.5px;font-weight:500;margin-bottom:14px;text-align:left}

/* ---------------------------------------------- onboarding tracker */
.toolbar{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-bottom:18px}
.tabset{display:flex;gap:6px;flex-wrap:wrap}
.tabset button{border:1px solid var(--line);background:var(--surface);color:var(--ink2);
  border-radius:9px;padding:9px 15px;font:700 12px Inter;cursor:pointer;white-space:nowrap;
  transition:all .15s var(--ease)}
.tabset button:hover{border-color:var(--indigo);color:var(--indigo);background:var(--indigo-soft)}
.tabset button[data-on="1"]{background:linear-gradient(135deg,#4F46E5,#6D28D9);
  border-color:transparent;color:#fff;box-shadow:0 4px 12px rgba(79,70,229,.28)}
.tabset button[data-on="1"]:hover{filter:brightness(1.08);color:#fff}
.search{flex:1;min-width:160px;max-width:290px}
.sync{margin-left:auto;display:flex;align-items:center;gap:9px;font:600 11px Inter;color:var(--ink3)}

.pcard{background:var(--surface);border:1px solid var(--line);border-radius:14px;overflow:hidden;
  transition:border-color .18s var(--ease),transform .18s var(--ease),box-shadow .18s var(--ease)}
.pcard:hover{border-color:var(--indigo);box-shadow:var(--shadow);transform:translateY(-1px)}
.pcard.late{border-color:#F5C2CE;background:#FFFCFD}
.pc-top{display:flex;align-items:flex-start;gap:12px;padding:16px 17px 0;flex-wrap:wrap}
.pc-name{font-size:15px;font-weight:700;letter-spacing:-.2px;display:flex;align-items:center;
  gap:8px;flex-wrap:wrap}
.pc-ref{font:700 10px Inter;letter-spacing:.4px;background:var(--indigo-soft);color:var(--indigo-ink);
  border-radius:6px;padding:3.5px 8px}
.pc-meta{font-size:11.5px;color:var(--ink3);font-weight:500;margin-top:5px}
.pc-right{margin-left:auto;display:flex;align-items:center;gap:9px}
.pc-count{font:700 11.5px Inter;color:var(--ink3)}
.pc-bar{padding:12px 17px 0}
.pc-steps{padding:5px 17px 14px}
.pstep{display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid var(--line2);
  flex-wrap:wrap}
.pstep:last-child{border-bottom:0}
.pnum{width:21px;height:21px;border-radius:6px;background:var(--indigo-soft);display:grid;
  place-items:center;font:700 10px Inter;color:var(--indigo-ink);flex:none}
.plabel{font-size:13px;font-weight:600;flex:1;min-width:120px}
.pacts{display:flex;gap:6px;margin-left:auto}
.pfoot{border-top:1px solid var(--line2);padding:11px 17px;display:flex;gap:8px;align-items:center;
  background:var(--sunk);flex-wrap:wrap}
.note-txt{font-size:11.5px;color:var(--ink3);font-weight:600}
.allgood{font-size:11.5px;color:var(--emerald);font-weight:700;padding:5px 0}

/* by-task view */
.stepchips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px}
.stepchip{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:9px;
  padding:8px 12px;font:600 12px Inter;cursor:pointer;display:flex;align-items:center;gap:8px;
  transition:all .15s var(--ease)}
.stepchip:hover{border-color:var(--indigo);color:var(--indigo);background:var(--indigo-soft)}
.stepchip[data-on="1"]{background:linear-gradient(135deg,#4F46E5,#6D28D9);border-color:transparent;
  color:#fff;box-shadow:0 4px 12px rgba(79,70,229,.28)}
.stepchip .n{font:700 11px Inter;background:var(--line2);color:var(--ink2);border-radius:20px;
  padding:2px 8px;min-width:22px;text-align:center}
.stepchip[data-on="1"] .n{background:rgba(255,255,255,.24);color:#fff}
.stepchip.empty{opacity:.45}

.batch{background:var(--surface);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.batch-h{display:flex;align-items:center;gap:11px;padding:16px 17px 13px;flex-wrap:wrap}
.batch-h .t{font-size:15px;font-weight:700;letter-spacing:-.2px}
.batch-h .c{font:600 11px Inter;color:var(--ink2);background:var(--line2);border-radius:20px;
  padding:4px 10px}
.prow{display:flex;align-items:center;gap:11px;padding:11px 17px;border-top:1px solid var(--line2);
  cursor:pointer;transition:background .12s var(--ease)}
.prow:hover{background:var(--indigo-soft)}
.prow input{width:16px;height:16px;flex:none;margin:0;accent-color:#4F46E5;cursor:pointer}
.ini{width:29px;height:29px;border-radius:50%;background:var(--indigo-soft);color:var(--indigo-ink);
  display:grid;place-items:center;font:700 10.5px Inter;flex:none}
.prow .nm{font-size:13.5px;font-weight:600;flex:1;min-width:110px}
.prow .sp{margin-left:auto;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.batch-f{display:flex;align-items:center;gap:11px;padding:13px 17px;background:var(--sunk);
  border-top:1px solid var(--line2);flex-wrap:wrap}

.bars{margin-top:28px}
.bar-row{display:flex;align-items:center;gap:12px;padding:6px 0}
.bar-lbl{font-size:12px;color:var(--ink2);font-weight:600;width:165px;flex:none;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bar-track{flex:1;height:9px;background:var(--line2);border-radius:5px;overflow:hidden}
.bar-fill{display:block;height:9px;border-radius:5px;transition:width .4s var(--ease)}
.bar-n{font:700 12px Inter;width:22px;text-align:right;color:var(--ink2)}

/* --------------------------------------------------------- sources */
.src{display:flex;align-items:flex-start;gap:13px;background:var(--surface);
  border:1px solid var(--line);border-radius:13px;padding:15px 16px;
  transition:border-color .18s var(--ease),transform .18s var(--ease),box-shadow .18s var(--ease)}
.src:hover{border-color:var(--teal);transform:translateY(-1px);box-shadow:var(--shadow)}
.src-ico{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;
  font-size:14px;flex:none;font-weight:700}
.src-ico.green{background:var(--emerald-soft);color:var(--emerald)}
.src-ico.amber{background:var(--amber-soft);color:var(--amber)}
.src-ico.accent{background:var(--indigo-soft);color:var(--indigo-ink)}
.src-ico.grey{background:var(--line2);color:var(--ink3)}
.src-body{flex:1;min-width:170px}
.src-name{font-size:14px;font-weight:700;letter-spacing:-.2px;display:flex;align-items:center;
  gap:8px;flex-wrap:wrap}
.src-desc{font-size:12.5px;color:var(--ink2);font-weight:500;line-height:1.5;margin-top:4px}
.src-detail{font:600 11px Inter;color:var(--ink3);margin-top:8px;background:var(--sunk);
  border:1px solid var(--line2);border-radius:7px;padding:6px 10px;display:inline-block}
.src-act{margin-left:auto;align-self:center}
.locked{background:var(--teal-soft);border:1px solid #B5E2DC;border-radius:12px;
  padding:13px 16px;margin-bottom:18px;display:flex;align-items:center;gap:10px}
.locked b{font-size:12.5px;font-weight:700;color:var(--teal-ink)}
.locked span{font-size:12px;color:var(--teal-ink);opacity:.85;font-weight:500}

@media(max-width:560px){.wrap{padding:16px 13px 44px}}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><style dangerouslySetInnerHTML={{ __html: css }} /></head>
      <body>{children}</body>
    </html>
  );
}
