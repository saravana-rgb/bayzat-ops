/* Styles owned by the Onboarding tile. Nothing else uses these. */
export const onboardingCss = `
/* -------------------------------------------------------- progress */
.runway{display:flex;gap:4px}
.seg{height:4px;flex:1;border-radius:2px;background:var(--line2);transition:background .3s var(--ease)}
.seg.done.p1{background:var(--s1)} .seg.done.p2{background:var(--s2)}
.seg.done.p3{background:var(--s3)} .seg.done.p4{background:var(--s4)}
.seg.done.p5{background:var(--s5)} .seg.done.p6{background:var(--s6)}
.seg.progress{background:var(--amber);opacity:.5}
.seg.na{background:var(--line)}
.seg.late{background:#E7C3CD}
.step{border:1px solid var(--line);border-left:2px solid var(--line);border-radius:0 var(--r) var(--r) 0;
  padding:16px 18px;margin-top:12px}
.step.e1{border-left-color:var(--s1)} .step.e2{border-left-color:var(--s2)}
.step.e3{border-left-color:var(--s3)} .step.e4{border-left-color:var(--s4)}
.step.e5{border-left-color:var(--s5)} .step.e6{border-left-color:var(--s6)}
.step.done{background:var(--sunk)}
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
  border-radius:var(--r);padding:9px 13px;font:500 12.5px var(--font);cursor:pointer;display:flex;
  align-items:center;gap:9px;transition:all .15s var(--ease)}
.stepchip:hover{border-color:var(--ink);color:var(--ink)}
.stepchip[data-on="1"]{background:var(--ink);border-color:var(--ink);color:#fff}
.stepchip .sq{width:7px;height:7px;border-radius:2px;flex:none}
.stepchip.c1 .sq{background:var(--s1)} .stepchip.c2 .sq{background:var(--s2)}
.stepchip.c3 .sq{background:var(--s3)} .stepchip.c4 .sq{background:var(--s4)}
.stepchip.c5 .sq{background:var(--s5)} .stepchip.c6 .sq{background:var(--s6)}
.stepchip[data-on="1"] .sq{background:#fff}
.stepchip .n{font:500 11.5px var(--font);color:var(--ink3)}
.stepchip[data-on="1"] .n{color:rgba(255,255,255,.7)}
.stepchip.empty{opacity:.4}

.batch{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden}
.batch-h{display:flex;align-items:center;gap:12px;padding:20px 22px 14px;flex-wrap:wrap}
.batch-h .t{font-size:15px;font-weight:600;letter-spacing:-.2px}
.batch-h .c{font:400 12px var(--font);color:var(--ink3)}
.prow{display:flex;align-items:center;gap:13px;padding:13px 22px;border-top:1px solid var(--line2);
  cursor:pointer;transition:background .12s var(--ease)}
.prow:hover{background:var(--sunk)}
.prow input{width:15px;height:15px;flex:none;margin:0;accent-color:#1C1917;cursor:pointer}
.ini{width:28px;height:28px;border-radius:50%;background:var(--sunk);color:var(--ink2);
  border:1px solid var(--line);display:grid;place-items:center;font:500 11px var(--font);flex:none}
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
.fold-c{font:400 12px var(--font);color:var(--ink3)}
.caret{margin-left:auto;color:var(--ink3);font-size:11px;transition:transform .18s var(--ease)}
.caret[data-open="1"]{transform:rotate(180deg)}
.fold-b{padding:8px 20px 20px;border-top:1px solid var(--line2)}

 .bar-fill.p2{background:var(--s2)} .bar-fill.p3{background:var(--s3)}
 .bar-fill.p5{background:var(--s5)} .bar-fill.p6{background:var(--s6)}
/* --------------------------------------------------------- reports */

 .mfill.p2{background:var(--s2)} .mfill.p3{background:var(--s3)}
 .mfill.p5{background:var(--s5)} .mfill.p6{background:var(--s6)}

.thead{display:flex;align-items:center;gap:14px;padding:0 0 11px;border-bottom:1px solid var(--line);
  font:500 11px var(--font);color:var(--ink3);text-transform:none;letter-spacing:0}
.tcell{width:82px;flex:none;text-align:right;font:600 13px var(--font);color:var(--ink)}
.thead .tcell{font:500 11px var(--font);color:var(--ink3)}
.tcell.ok{color:var(--emerald)} .tcell.warn{color:var(--amber)} .tcell.bad{color:var(--rose)}
.tcell.dim{color:var(--ink3);font-weight:400}

/* monthly columns */

/* where the time goes */
.legend{display:flex;gap:22px;flex-wrap:wrap;margin-bottom:20px;font:400 12.5px var(--font);
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
.stotal{width:84px;text-align:right;font:600 13px var(--font);color:var(--ink);flex:none}

/* delays */
.split{margin-bottom:18px}
.splitbar{display:flex;height:8px;border-radius:4px;overflow:hidden;background:var(--line2)}
.sfill{display:block;height:8px}
.sfill.us{background:var(--rose)} .sfill.them{background:var(--amber)}
.splitkey{display:flex;gap:20px;margin-top:11px;font:400 12.5px var(--font);color:var(--ink2);flex-wrap:wrap}
.donutwrap{display:flex;gap:28px;align-items:center;flex-wrap:wrap;margin-bottom:20px;
  padding-bottom:20px;border-bottom:1px solid var(--line2)}
.donutkey{display:grid;gap:14px}
.donutkey div{font:400 13.5px var(--font);color:var(--ink2)}
.donutkey b{font-size:16px;font-weight:600;color:var(--ink);margin-right:5px}
.donutkey span{display:block;font:400 12px var(--font);color:var(--ink3);margin-left:16px;margin-top:3px}
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
.locked .tag{font:500 11px var(--font);background:var(--ink);color:#fff;border-radius:3px;
  padding:4px 9px;flex:none}
.src{display:flex;align-items:center;gap:16px;background:var(--surface);border:1px solid var(--line);
  border-radius:var(--r-lg);padding:20px 22px;transition:border-color .18s var(--ease)}
.src:hover{border-color:var(--ink3)}
.src-ico{width:36px;height:36px;border-radius:var(--r);display:grid;place-items:center;
  font:600 12px var(--font);flex:none}
.src-ico.green{background:var(--s6-soft);color:var(--s6)}
.src-ico.amber{background:var(--s2-soft);color:var(--s2)}
.src-ico.accent{background:var(--s3-soft);color:var(--s3)}
.src-ico.grey{background:var(--sunk);color:var(--ink2);border:1px solid var(--line)}
.src-body{flex:1;min-width:190px}
.src-name{font-size:15px;font-weight:600;letter-spacing:-.2px;display:flex;align-items:center;
  gap:9px;flex-wrap:wrap}
.src-desc{font-size:13px;color:var(--ink2);font-weight:400;line-height:1.6;margin-top:6px}
.src-detail{font:400 12px var(--font);color:var(--ink3);margin-top:10px;background:var(--sunk);
  border:1px solid var(--line);border-radius:3px;padding:6px 10px;display:inline-block;
  max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.src-act{flex:none;margin-left:auto}
`;
