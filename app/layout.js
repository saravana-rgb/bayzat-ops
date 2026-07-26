export const metadata = {
  title: 'Bayzat Ops',
  description: 'Internal tools for the IT and People teams'
};

const css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root{
  --purple:#9647FF; --blue:#475CFF;
  --grad:linear-gradient(90deg,#9647FF 0%,#475CFF 100%);
  --page:#F6F4FB; --card:#FFFFFF; --line:#E8E3F3;
  --ink:#1B1533; --ink2:#5C5670; --ink3:#8B85A0;
  --green:#0E9F6E; --greenbg:#E7F7F1;
  --amber:#B26A00; --amberbg:#FEF3E2;
  --red:#DC2B2B;   --redbg:#FDECEC;
  --lilac:#F3EEFF;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--page);color:var(--ink);font-family:Inter,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
h1,h2,h3,p{margin:0}
.wrap{max-width:1080px;margin:0 auto;padding:26px 20px 60px}

/* top bar */
.bar{display:flex;align-items:center;gap:13px;background:var(--card);border:1px solid var(--line);
  border-radius:16px;padding:14px 18px;margin-bottom:18px;flex-wrap:wrap}
.mark{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#9647FF,#5947FF);
  display:grid;place-items:center;color:#fff;font-weight:900;font-size:16px;flex:none}
.bar h1{font-size:17px;font-weight:800;letter-spacing:-.3px}
.bar .sub{font-size:11.5px;color:var(--ink3);font-weight:500;margin-top:2px}
.bar .right{margin-left:auto;display:flex;align-items:center;gap:10px;font-size:12px;color:var(--ink3);font-weight:600}
.back{font-size:12px;font-weight:700;color:var(--ink3)}
.back:hover{color:var(--purple)}

/* tiles */
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.tile{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;
  display:block;transition:.15s}
.tile:hover{border-color:#C9B6F5;box-shadow:0 6px 22px rgba(101,71,182,.10);transform:translateY(-2px)}
.tile .ico{width:40px;height:40px;border-radius:11px;background:var(--grad);display:grid;place-items:center;
  color:#fff;font-size:19px;margin-bottom:13px}
.tile h2{font-size:15px;font-weight:800;letter-spacing:-.2px}
.tile p{font-size:12.5px;color:var(--ink3);font-weight:500;line-height:1.55;margin-top:6px}
.tile.soon{opacity:.55;pointer-events:none;border-style:dashed}
.tile.soon .ico{background:#E3DEF0;color:var(--ink3)}
.tile .badges{display:flex;gap:6px;margin-top:13px;flex-wrap:wrap}

/* chips + stats */
.chip{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;
  border-radius:20px;padding:3.5px 9px;white-space:nowrap;display:inline-block}
.chip.red{background:var(--redbg);color:var(--red)}
.chip.amber{background:var(--amberbg);color:var(--amber)}
.chip.green{background:var(--greenbg);color:var(--green)}
.chip.grey{background:#F1EFF7;color:var(--ink3)}
.chip.purple{background:var(--lilac);color:#7B3FD4}
.stats{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:16px}
.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:11px 16px;min-width:92px}
.stat b{display:block;font-size:21px;font-weight:800;line-height:1.15}
.stat span{font-size:9px;color:var(--ink3);text-transform:uppercase;letter-spacing:.7px;font-weight:800}
.stat.hot{background:var(--redbg);border-color:#F6D5D5} .stat.hot b{color:var(--red)}
.stat.warm{background:var(--amberbg);border-color:#F7E2C2} .stat.warm b{color:var(--amber)}

/* sections + rows */
.sec{font-size:10px;font-weight:800;letter-spacing:1.1px;text-transform:uppercase;
  color:var(--ink3);margin:22px 0 9px}
.sec.hot{color:var(--red)}
.grid{display:grid;gap:9px}
.row{display:flex;align-items:center;gap:11px;background:var(--card);border:1px solid var(--line);
  border-radius:12px;padding:12px 14px;flex-wrap:wrap}
.row.late{border-color:#F3C6C6;background:#FFFCFC}
.num{width:24px;height:24px;border-radius:7px;background:var(--lilac);display:grid;place-items:center;
  font-size:10.5px;font-weight:800;color:#7B3FD4;flex:none}
.body{min-width:160px;flex:1}
.body .t{font-size:13px;font-weight:700}
.body .m{font-size:11.5px;color:var(--ink3);font-weight:500;margin-top:2px}
.acts{display:flex;gap:6px;margin-left:auto}
.mini{border:1px solid var(--line);background:var(--card);color:var(--ink2);border-radius:7px;
  padding:6px 11px;font:700 11px Inter;cursor:pointer}
.mini:hover{border-color:#D6CDEE;color:var(--ink)}
.mini.go{border-color:#B7E5D2;color:var(--green)} .mini.go:hover{background:var(--greenbg)}
.mini:disabled{opacity:.45;cursor:default}

/* ticket cards */
.tk{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:15px 16px;
  cursor:pointer;transition:.15s}
.tk:hover{border-color:#C9B6F5;box-shadow:0 4px 18px rgba(101,71,182,.09)}
.tk .head{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
.tk .name{font-size:14.5px;font-weight:700;letter-spacing:-.2px}
.tk .meta{font-size:11.5px;color:var(--ink3);font-weight:500}
.tk .r{margin-left:auto;display:flex;align-items:center;gap:9px}
.pct{font-size:11px;font-weight:800;color:var(--ink3)}
.runway{display:flex;gap:3px;margin-top:11px}
.seg{height:6px;flex:1;border-radius:3px;background:#EDE9F6}
.seg.done{background:var(--grad)} .seg.progress{background:#F0B429}
.seg.na{background:#D6D1E4} .seg.late{background:#F5A3A3}

/* panel */
.veil{position:fixed;inset:0;background:rgba(27,21,51,.42);backdrop-filter:blur(3px);z-index:40;
  display:flex;align-items:center;justify-content:center;padding:18px}
.panel{background:var(--card);border-radius:20px;width:100%;max-width:640px;max-height:88vh;
  overflow:auto;padding:22px;box-shadow:0 24px 70px rgba(27,21,51,.25)}
.panel .ph{display:flex;align-items:flex-start;gap:12px}
.x{margin-left:auto;background:var(--card);border:1px solid var(--line);color:var(--ink2);
  border-radius:8px;width:30px;height:30px;font-size:14px;cursor:pointer;flex:none}
.step{border:1px solid var(--line);border-radius:12px;padding:13px 14px;margin-top:9px}
.step.done{border-color:#BFE8D8;background:#FAFFFD}
.step.late{border-color:#F3C6C6}
.step .st{font-size:13.5px;font-weight:700}
.ctl{display:flex;gap:4px;margin-top:10px;flex-wrap:wrap}
.ctl button{border:1px solid var(--line);background:var(--card);color:var(--ink2);border-radius:7px;
  padding:6px 11px;font:700 11px Inter;cursor:pointer}
.ctl button:hover{color:var(--ink)}
.ctl button[data-on="1"]{background:var(--grad);border-color:transparent;color:#fff}
input.note{width:100%;margin-top:9px;background:#FCFBFE;border:1px solid var(--line);border-radius:9px;
  padding:8px 11px;font:500 12px Inter;color:var(--ink);outline:none}
input.note:focus{border-color:var(--purple);background:#fff}

/* misc */
.btn{background:var(--grad);border:0;border-radius:9px;color:#fff;font:700 12.5px Inter;
  padding:11px 20px;cursor:pointer}
.btn:hover{filter:brightness(1.07)}
.btn.ghost{background:var(--card);border:1px solid var(--line);color:var(--ink2)}
.empty{background:var(--card);border:1px dashed var(--line);border-radius:16px;padding:40px 20px;text-align:center}
.empty b{display:block;font-size:14.5px;font-weight:700;margin-bottom:5px}
.empty span{font-size:12.5px;color:var(--ink3)}
.center{min-height:80vh;display:grid;place-items:center;text-align:center}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:30px;max-width:380px}
.err{background:var(--redbg);border:1px solid #F6D5D5;color:var(--red);border-radius:10px;
  padding:11px 14px;font-size:12.5px;font-weight:600;margin-bottom:14px}
@media(max-width:560px){.wrap{padding:16px 13px 40px}}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><style dangerouslySetInnerHTML={{ __html: css }} /></head>
      <body>{children}</body>
    </html>
  );
}
