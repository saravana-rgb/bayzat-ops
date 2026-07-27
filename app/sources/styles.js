/* Styles owned by the Sources tile. Nothing else uses these. */
export const sourcesCss = `
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


/* ------------------------------------------------------- documents */
.busy{background:var(--sunk);border:1px solid var(--line);border-radius:var(--r);
  padding:11px 15px;font:400 13px Inter;color:var(--ink2);margin-bottom:18px}
.uprow{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end}

.doccard{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  overflow:hidden;transition:border-color .18s var(--ease)}
.doccard:hover{border-color:var(--ink3)}
.doc-top{display:flex;align-items:flex-start;gap:15px;padding:20px 22px;cursor:pointer;
  flex-wrap:wrap}
.doc-ico{width:42px;height:42px;border-radius:var(--r);background:var(--sunk);
  border:1px solid var(--line);color:var(--ink3);display:grid;place-items:center;
  font:600 10.5px Inter;letter-spacing:.4px;flex:none}
.doc-name{font-size:15px;font-weight:600;letter-spacing:-.2px;display:flex;align-items:center;
  gap:9px;flex-wrap:wrap}
.doc-meta{font-size:12.5px;color:var(--ink3);font-weight:400;margin-top:6px;line-height:1.6}
.doc-acts{display:flex;gap:8px;padding:14px 22px;border-top:1px solid var(--line2);
  background:var(--sunk);flex-wrap:wrap}
.mini.danger{border-color:#E7C3CD;color:var(--rose)}
.mini.danger:hover{background:var(--rose);border-color:var(--rose);color:#fff}

.ai-note{font-size:13px;color:var(--ink2);line-height:1.7;background:var(--sunk);
  border-left:2px solid var(--s3);border-radius:0 var(--r) var(--r) 0;padding:13px 16px;
  margin:16px 0 4px}
.kv{border-collapse:collapse;width:100%;margin-top:16px}
.kv td{padding:9px 0;border-bottom:1px solid var(--line2);font-size:13.5px;vertical-align:top}
.kv td:first-child{color:var(--ink3);font-weight:400;width:120px;font-size:12.5px;padding-right:16px}
.kv tr:last-child td{border-bottom:0}
`;
