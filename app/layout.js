export const metadata = {
  title: 'Bayzat Ops',
  description: 'Internal tools for the IT and People teams'
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* One accent for anything you can click. Everything else is paper, ink and
   three desaturated status tones. Colour means something here — if it isn't
   interactive or a status, it stays neutral. */
:root{
  --canvas:#F7F7F5;
  --surface:#FFFFFF;
  --sunk:#FBFBF9;
  --line:#E7E6E1;
  --line2:#F1F0EC;

  --ink:#16181D;
  --ink2:#585D66;
  --ink3:#92969E;

  --accent:#2E5BFF;
  --accent-ink:#1E3FCC;
  --accent-soft:#EDF1FF;

  --red:#B93E33;   --red-soft:#FAEEEC;
  --amber:#9A6B15; --amber-soft:#FBF4E7;
  --green:#2E7355; --green-soft:#EBF4EF;

  --r:10px;
  --shadow:0 1px 2px rgba(22,24,29,.04), 0 8px 24px rgba(22,24,29,.06);
  --ease:cubic-bezier(.2,.8,.3,1);
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--canvas);color:var(--ink);font-family:Inter,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;font-feature-settings:'tnum' 1}
a{color:inherit;text-decoration:none}
h1,h2,h3,p{margin:0}
::selection{background:var(--accent-soft)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:6px}
.wrap{max-width:1060px;margin:0 auto;padding:26px 20px 70px}

/* ---------------------------------------------------------- top bar */
.bar{display:flex;align-items:center;gap:13px;background:var(--surface);border:1px solid var(--line);
  border-radius:14px;padding:14px 17px;margin-bottom:20px;flex-wrap:wrap}
.mark{width:34px;height:34px;border-radius:9px;background:var(--ink);display:grid;place-items:center;
  color:#fff;font-weight:800;font-size:15px;flex:none;letter-spacing:-.3px}
.bar h1{font-size:16.5px;font-weight:700;letter-spacing:-.3px}
.bar .sub{font-size:11.5px;color:var(--ink3);font-weight:500;margin-top:3px}
.bar .right{margin-left:auto;display:flex;align-items:center;gap:10px;font-size:12px;
  color:var(--ink3);font-weight:500}
.back{font-size:12px;font-weight:600;color:var(--ink2);padding:6px 10px;border-radius:8px;
  transition:background .15s var(--ease),color .15s var(--ease)}
.back:hover{background:var(--accent-soft);color:var(--accent-ink)}

/* ------------------------------------------------------------ tiles */
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(258px,1fr));gap:13px}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:19px;
  display:block;transition:border-color .18s var(--ease),transform .18s var(--ease),box-shadow .18s var(--ease)}
.tile:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:var(--shadow)}
.tile:active{transform:translateY(0)}
.tile .ico{width:36px;height:36px;border-radius:9px;background:var(--accent-soft);color:var(--accent-ink);
  display:grid;place-items:center;font-size:16px;font-weight:700;margin-bottom:14px;
  transition:background .18s var(--ease)}
.tile:hover .ico{background:var(--accent);color:#fff}
.tile h2{font-size:14.5px;font-weight:700;letter-spacing:-.2px}
.tile p{font-size:12.5px;color:var(--ink3);font-weight:500;line-height:1.55;margin-top:6px}
.tile.soon{opacity:.5;pointer-events:none;border-style:dashed}
.tile.soon .ico{background:var(--line2);color:var(--ink3)}
.badges{display:flex;gap:6px;margin-top:13px;flex-wrap:wrap}

/* ------------------------------------------------- chips and counts */
.chip{font-size:10px;font-weight:700;letter-spacing:.2px;border-radius:6px;padding:3.5px 8px;
  white-space:nowrap;display:inline-block}
.chip.red{background:var(--red-soft);color:var(--red)}
.chip.amber{background:var(--amber-soft);color:var(--amber)}
.chip.green{background:var(--green-soft);color:var(--green)}
.chip.grey{background:var(--line2);color:var(--ink3)}
.chip.accent{background:var(--accent-soft);color:var(--accent-ink)}

.stats{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:18px}
.stat{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px;
  min-width:96px;transition:border-color .15s var(--ease)}
.stat b{display:block;font-size:22px;font-weight:700;line-height:1.1;letter-spacing:-.6px}
.stat span{font-size:9.5px;color:var(--ink3);text-transform:uppercase;letter-spacing:.6px;font-weight:700}
.stat.hot b{color:var(--red)}
.stat.warm b{color:var(--amber)}

/* ------------------------------------------------ sections and rows */
.sec{font-size:10.5px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;
  color:var(--ink3);margin:24px 0 10px;display:flex;align-items:center;gap:8px}
.sec::after{content:'';flex:1;height:1px;background:var(--line)}
.sec.hot{color:var(--red)}
.grid{display:grid;gap:10px}

.mini{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:8px;
  padding:6px 11px;font:600 11.5px Inter;cursor:pointer;
  transition:all .15s var(--ease)}
.mini:hover{border-color:var(--ink3);color:var(--ink)}
.mini:active{transform:scale(.97)}
.mini.go{border-color:#BFDDCE;color:var(--green)}
.mini.go:hover{background:var(--green);border-color:var(--green);color:#fff}
.mini:disabled{opacity:.4;cursor:default;transform:none}

.btn{background:var(--accent);border:0;border-radius:9px;color:#fff;font:600 12.5px Inter;
  padding:11px 20px;cursor:pointer;transition:background .15s var(--ease),transform .1s var(--ease)}
.btn:hover{background:var(--accent-ink)}
.btn:active{transform:scale(.985)}
.btn:disabled{opacity:.5;cursor:default}
.btn.ghost{background:var(--surface);border:1px solid var(--line);color:var(--ink2)}
.btn.ghost:hover{background:var(--sunk);border-color:var(--ink3);color:var(--ink)}

/* ------------------------------------------------------- progress */
.runway{display:flex;gap:3px}
.seg{height:5px;flex:1;border-radius:2px;background:var(--line);transition:background .3s var(--ease)}
.seg.done{background:var(--accent)}
.seg.progress{background:var(--amber)}
.seg.na{background:var(--line2);border:1px solid var(--line)}
.seg.late{background:#E6BDB8}

/* ---------------------------------------------------------- inputs */
input,select,textarea{width:100%;background:var(--surface);border:1px solid var(--line);
  border-radius:9px;color:var(--ink);font:500 13px Inter;padding:10px 12px;outline:none;
  transition:border-color .15s var(--ease),box-shadow .15s var(--ease)}
input:focus,select:focus,textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
input::placeholder{color:var(--ink3)}
label{display:block;font-size:9.5px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;
  color:var(--ink3);margin-bottom:6px}

/* ----------------------------------------------------------- panel */
.veil{position:fixed;inset:0;background:rgba(22,24,29,.34);backdrop-filter:blur(3px);z-index:40;
  display:flex;align-items:center;justify-content:center;padding:18px;
  animation:fade .18s var(--ease)}
@keyframes fade{from{opacity:0}to{opacity:1}}
.panel{background:var(--surface);border-radius:16px;width:100%;max-width:620px;max-height:88vh;
  overflow:auto;padding:22px;box-shadow:0 24px 60px rgba(22,24,29,.22);
  animation:rise .22s var(--ease)}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.panel .ph{display:flex;align-items:flex-start;gap:12px}
.x{margin-left:auto;background:var(--surface);border:1px solid var(--line);color:var(--ink2);
  border-radius:8px;width:30px;height:30px;font-size:13px;cursor:pointer;flex:none;
  transition:all .15s var(--ease)}
.x:hover{background:var(--sunk);color:var(--ink)}
.step{border:1px solid var(--line);border-radius:11px;padding:13px 14px;margin-top:9px;
  transition:border-color .18s var(--ease),background .18s var(--ease)}
.step.done{border-color:#CBE3D7;background:var(--green-soft)}
.step.late{border-color:#E9C9C4}
.step .st{font-size:13.5px;font-weight:600}
.num{width:22px;height:22px;border-radius:6px;background:var(--line2);display:grid;place-items:center;
  font:700 10px Inter;color:var(--ink3);flex:none}
.ctl{display:flex;gap:4px;margin-top:11px;flex-wrap:wrap}
.ctl button{border:1px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:7px;
  padding:6px 11px;font:600 11.5px Inter;cursor:pointer;transition:all .15s var(--ease)}
.ctl button:hover{border-color:var(--ink3);color:var(--ink)}
.ctl button[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}
.note{margin-top:9px;font-size:12px;padding:9px 11px}

/* ------------------------------------------------------ misc */
.empty{background:var(--surface);border:1px dashed var(--line);border-radius:14px;
  padding:44px 20px;text-align:center}
.empty b{display:block;font-size:14.5px;font-weight:700;margin-bottom:6px}
.empty span{font-size:12.5px;color:var(--ink3)}
.center{min-height:82vh;display:grid;place-items:center;text-align:center;padding:20px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:30px;
  max-width:370px;width:100%;box-shadow:var(--shadow)}
.err{background:var(--red-soft);color:var(--red);border-radius:9px;padding:11px 14px;
  font-size:12.5px;font-weight:500;margin-bottom:14px;text-align:left}
.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:var(--ink);
  color:#fff;border-radius:10px;padding:11px 18px;font:500 12.5px Inter;z-index:60;
  box-shadow:0 10px 30px rgba(22,24,29,.3);animation:pop .2s var(--ease)}
@keyframes pop{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}
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
