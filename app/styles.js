/* Styles owned by the Home page only. Nothing else uses these.
 * Loaded from inside page.js itself (Home has no nested layout.js of its
 * own, unlike the other tiles), after commonCss, so these rules layer on
 * top of it rather than replacing anything. Every selector below either
 * targets a new class, or adds a property commonCss does not already set
 * on that selector -- nothing here redeclares an existing rule. */
export const homeCss = `
/* a little life on hover, matching the polish already given to the
 * Assets tile -- the numbers on this page are a dashboard, they should
 * feel like one */
.tile{transition:transform .15s var(--ease), border-color .18s var(--ease)}
.tile:hover{transform:translateY(-3px)}
.tile:hover .ico{transform:scale(1.08)}

/* a hero band that breaks out to the full width of the browser, not just
 * .wrap's own constrained column. The technique: give it the viewport's
 * full width, then pull it back into position with a negative margin
 * calculated from that same viewport width. This works regardless of what
 * .wrap's own max-width or padding happen to be -- it never needs to know.
 * The one common side effect of this trick is a possible 1px horizontal
 * scrollbar on some browsers; overflow-x:hidden on .wrap guards against
 * it, scoped to this page only since this rule only exists while Home's
 * own stylesheet is loaded. */
.wrap{overflow-x:hidden}
.hero{position:relative;width:100vw;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;
  background:var(--sunk);border-bottom:1px solid var(--line);overflow:hidden;
  padding:46px 0 40px;margin-bottom:34px}
.hero-pattern{position:absolute;inset:0;pointer-events:none}
.hero-inner{max-width:1000px;margin:0 auto;padding:0 24px;position:relative}
.hero-eyebrow{font:600 11.5px var(--font);letter-spacing:.6px;text-transform:uppercase;
  color:var(--accent);margin-bottom:10px}
.hero-title{font-size:42px;font-weight:600;letter-spacing:-1.2px;color:var(--ink);
  line-height:1.08;margin:0}
.hero-name{color:var(--accent)}
.hero-row{display:flex;align-items:center;gap:14px}
.hero-sub{font-size:15px;color:var(--ink2);margin-top:12px;max-width:520px;line-height:1.6}

/* the board -- one card per lane, and only one. The header carries the
 * icon, the title and a live count; the body carries every item that
 * lane has, two shown and the rest revealed in place by the toggle at
 * the bottom, never repeated somewhere else on the page. */
.board{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;
  max-width:1000px;margin:0 auto 34px;padding:0 24px}
.board-lane{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  border-top:3px solid var(--line);overflow:hidden;transition:border-color .18s var(--ease),
  transform .15s var(--ease)}
.board-lane:hover{border-color:var(--ink3);transform:translateY(-2px)}
.board-lane.rose{border-top-color:var(--rose)}
.board-lane.olive{border-top-color:var(--s4)}
.board-lane.amber{border-top-color:var(--amber)}

.board-head{display:flex;align-items:center;gap:12px;padding:16px 18px;text-decoration:none;
  border-bottom:1px solid var(--line2)}
.board-head:hover{background:var(--sunk)}
.board-ico{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;flex:none;
  transition:transform .15s var(--ease)}
.board-head:hover .board-ico{transform:scale(1.08)}
.board-ico svg{display:block}
.board-lane.rose .board-ico{background:var(--rose-soft);color:var(--rose)}
.board-lane.olive .board-ico{background:var(--s4-soft);color:var(--s4)}
.board-lane.amber .board-ico{background:var(--amber-soft);color:var(--amber)}
.board-title{flex:1;min-width:0;font:600 14.5px var(--font);color:var(--ink);display:grid;gap:2px}
.board-blurb{font:400 11.5px var(--font);color:var(--ink3);font-weight:400}
.board-count{font:600 13px var(--font);color:var(--ink3);background:var(--line2);
  border-radius:999px;min-width:24px;height:24px;padding:0 8px;display:grid;place-items:center;
  flex:none}
.board-count.hot{background:var(--rose);color:#fff}

.board-empty{padding:22px 18px;font-size:12.5px;color:var(--ink3);text-align:center}
.board-list{display:grid}
.board-item{display:grid;gap:2px;padding:12px 18px;border-bottom:1px solid var(--line2);
  text-decoration:none;transition:background .12s var(--ease)}
.board-item:last-child{border-bottom:0}
.board-item:hover{background:var(--sunk)}
.board-when{font:600 11px var(--font);color:var(--ink3)}
.board-item.urgent .board-when{color:var(--rose)}
.board-who{display:flex;align-items:center;gap:8px;margin-top:2px}
.board-avatar{width:22px;height:22px;border-radius:50%;background:var(--line2);
  color:var(--ink2);display:grid;place-items:center;font:600 9.5px var(--font);flex:none}
.board-doc-ico{width:22px;height:22px;border-radius:50%;background:var(--line2);
  color:var(--ink2);display:grid;place-items:center;flex:none}
.board-name{font:600 14px var(--font);color:var(--ink)}
.board-why{font:400 12px var(--font);color:var(--ink3);margin-left:30px}

.board-toggle{display:block;width:100%;text-align:left;padding:11px 18px;
  font:500 12.5px var(--font);color:var(--ink2);background:var(--sunk);border:0;
  border-top:1px solid var(--line2);cursor:pointer;transition:color .12s var(--ease)}
.board-toggle:hover{color:var(--ink)}

/* a small heading gives the tile grid its own second act, rather than
 * letting the hero trail straight into a wall of cards */
.section-head{display:flex;align-items:baseline;gap:10px;margin:0 0 16px}
.section-head h3{font-size:15px;font-weight:600;color:var(--ink);margin:0}
.section-head span{font-size:12.5px;color:var(--ink3)}

@media(max-width:640px){
  .hero{padding:34px 0 30px}
  .hero-title{font-size:30px}
  .board{grid-template-columns:1fr}
}
`;
