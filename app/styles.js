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
.lane{transition:border-color .18s var(--ease)}
.lane:hover{border-color:var(--ink3)}

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
.hero-sub{font-size:15px;color:var(--ink2);margin-top:12px;max-width:520px;line-height:1.6}
.hero-numbers{display:flex;gap:34px;flex-wrap:wrap;margin-top:30px}
.hero-num{display:flex;flex-direction:column}
.hero-num b{font-size:40px;font-weight:600;letter-spacing:-1.4px;line-height:1}
.hero-num span{font-size:12.5px;color:var(--ink3);margin-top:6px;font-weight:500}
.hero-num.rose b{color:var(--rose)}
.hero-num.olive b{color:var(--s4)}
.hero-num.amber b{color:var(--amber)}

/* a small heading gives the tile grid its own second act, rather than
 * letting the hero trail straight into a wall of cards */
.section-head{display:flex;align-items:baseline;gap:10px;margin:0 0 16px}
.section-head h3{font-size:15px;font-weight:600;color:var(--ink);margin:0}
.section-head span{font-size:12.5px;color:var(--ink3)}

@media(max-width:640px){
  .hero{padding:34px 0 30px}
  .hero-title{font-size:30px}
  .hero-num b{font-size:32px}
}

/* small inline icons standing in for the plain arrow characters the
 * lanes used before -- same stroke language as every other icon in the
 * app */
.laneicon svg{display:block}
`;
