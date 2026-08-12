/* Styles owned by the Home page only. Nothing else uses these.
 * Loaded from inside page.js itself (Home has no nested layout.js of its
 * own, unlike the other tiles), after commonCss, so these rules layer on
 * top of it rather than replacing anything. Every selector below either
 * targets a new class, or adds a property commonCss does not already set
 * on that selector -- nothing here redeclares an existing rule. */
export const homeCss = `
@keyframes revealUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){
  .board-lane{animation:none}
  .tile{animation:none}
}

/* a little life on hover, matching the polish already given to the
 * Assets tile -- the numbers on this page are a dashboard, they should
 * feel like one */
.tile{transition:transform .15s var(--ease), border-color .18s var(--ease);
  animation:revealUp .45s var(--ease) both}
.tile:nth-child(1){animation-delay:.30s} .tile:nth-child(2){animation-delay:.34s}
.tile:nth-child(3){animation-delay:.38s} .tile:nth-child(4){animation-delay:.42s}
.tile:nth-child(5){animation-delay:.46s} .tile:nth-child(6){animation-delay:.50s}
.tile:nth-child(7){animation-delay:.54s}
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
 * own stylesheet is loaded.
 *
 * Kept deliberately tight this time -- one compact band, one row of
 * content, a quiet static tint rather than an animated multi-stop
 * gradient or a busy icon texture. Compact was the actual brief. */
.wrap{overflow-x:hidden}
.hero{position:relative;width:100vw;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;
  border-bottom:1px solid var(--line);padding:22px 0;margin-bottom:28px;
  background:linear-gradient(100deg,var(--accent-soft) 0%,var(--sunk) 70%)}
.hero-inner{max-width:1000px;margin:0 auto;padding:0 24px}
.hero-top{display:flex;align-items:center;justify-content:space-between;gap:22px;flex-wrap:wrap}
.hero-greet{display:flex;align-items:center;gap:12px}
.hero-title{font-size:22px;font-weight:600;letter-spacing:-.5px;color:var(--ink);
  line-height:1.25;margin:0}
.hero-name{color:var(--accent)}
.hero-sub{font-size:12.5px;color:var(--ink3);margin-top:2px}

.hero-right{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
.hero-cta{font:600 12.5px var(--font);color:#fff;background:var(--accent);
  padding:8px 16px;border-radius:999px;text-decoration:none;white-space:nowrap;
  transition:filter .15s var(--ease)}
.hero-cta:hover{filter:brightness(1.06)}
.hero-stats{display:flex;gap:20px}
.hstat{display:flex;flex-direction:column;line-height:1}
.hstat b{font-size:18px;font-weight:600;color:var(--ink)}
.hstat span{font-size:10px;color:var(--ink3);margin-top:3px;font-weight:600;
  text-transform:uppercase;letter-spacing:.3px}

@media(max-width:640px){
  .hero-top{flex-direction:column;align-items:flex-start}
}

/* the board -- one card per lane, and only one. The header carries the
 * icon, the title and a live count; the body carries every item that
 * lane has, two shown and the rest revealed in place by the toggle at
 * the bottom, never repeated somewhere else on the page. */
.board{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;
  max-width:1000px;margin:0 auto 34px;padding:0 24px}
.board-lane{background:var(--surface);border:1px solid var(--line);border-radius:var(--r-lg);
  border-top:3px solid var(--line);overflow:hidden;transition:border-color .18s var(--ease),
  transform .15s var(--ease);animation:revealUp .5s var(--ease) both}
.board-lane:nth-child(1){animation-delay:.30s}
.board-lane:nth-child(2){animation-delay:.36s}
.board-lane:nth-child(3){animation-delay:.42s}
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
