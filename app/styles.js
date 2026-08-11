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

/* the composition strip -- a one-glance read of how today is made up,
 * directly under the greeting. Built from the same three counts already
 * driving the lanes below it; nothing new is fetched for this. */
.compstrip{display:flex;gap:3px;height:6px;border-radius:4px;overflow:hidden;
  margin-top:16px;max-width:360px}
.compseg{transition:flex-grow .3s var(--ease)}
.complegend{display:flex;gap:18px;flex-wrap:wrap;margin-top:10px}
.compitem{display:flex;align-items:center;gap:7px;font:400 12.5px var(--font);
  color:var(--ink2)}
.compdot{width:8px;height:8px;border-radius:50%;flex:none}

/* small inline icons standing in for the plain arrow characters the
 * lanes used before -- same stroke language as every other icon in the
 * app */
.laneicon svg{display:block}
`;
