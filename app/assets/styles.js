/* Assets tile — its own stylesheet. Clay, as everywhere else: burnt sienna
   on warm paper. Colour carries state and nothing else, so a card's left
   rule tells you where the thing is before you read a word of it.

   Sienna, paper and ink are the values already in use in the reminder mail
   in master-sync.gs. The other five are the tile's own — swap them here if
   they sit wrong against the rest of the app. */

export const C = {
  paper    : '#FBF9F5',
  card     : '#FFFFFF',
  inset    : '#FAF8F5',
  ink      : '#1F1B16',
  body     : '#3A3A3A',
  soft     : '#5A5348',
  muted    : '#8F8779',
  rule     : '#E7E1D8',

  sienna   : '#B14A2E',   // missing, and every heading rule
  teal     : '#2E6F6A',   // in use
  olive    : '#6B7A4A',   // in stock
  ochre    : '#B98B2E',   // repair, and a warranty running out
  aubergine: '#5C3A52',   // gone, but not ours to keep
  steel    : '#55606B'    // retired
};

export const STATUS_COLOUR = {
  in_stock          : C.olive,
  assigned          : C.teal,
  repair            : C.ochre,
  retired           : C.steel,
  returned_to_lessor: C.aubergine,
  released          : C.aubergine,
  missing           : C.sienna
};

const FONT = "'DM Sans', system-ui, sans-serif";

export const S = {
  shell : { fontFamily: FONT, background: C.paper, minHeight: '100vh',
            padding: '34px 30px 80px' },
  inner : { maxWidth: 1080, margin: '0 auto' },

  /* heading — the sienna rule is the tile's signature, same as the mail */
  head      : { borderLeft: '2px solid ' + C.sienna, paddingLeft: 18,
                marginBottom: 26 },
  title     : { font: '600 26px ' + FONT, color: C.ink, letterSpacing: '-0.01em' },
  subtitle  : { font: '400 13.5px ' + FONT, color: C.muted, marginTop: 6 },

  switcher  : { display: 'flex', gap: 4, marginBottom: 22 },
  tab       : { font: '500 13px ' + FONT, padding: '7px 15px', borderRadius: 999,
                border: '1px solid ' + C.rule, background: 'transparent',
                color: C.soft, cursor: 'pointer' },
  tabOn     : { font: '500 13px ' + FONT, padding: '7px 15px', borderRadius: 999,
                border: '1px solid ' + C.ink, background: C.ink,
                color: C.paper, cursor: 'pointer' },

  /* counts are filters — a number you cannot press is just decoration */
  counts    : { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  count     : { display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 2, padding: '10px 16px', borderRadius: 10,
                border: '1px solid ' + C.rule, cursor: 'pointer',
                fontFamily: FONT, minWidth: 92, textAlign: 'left' },
  countNum  : { font: '600 21px ' + FONT, letterSpacing: '-0.02em' },
  countLabel: { font: '400 11.5px ' + FONT, color: C.muted },

  bar       : { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18,
                flexWrap: 'wrap' },
  search    : { flex: 1, minWidth: 220, font: '400 13.5px ' + FONT,
                padding: '10px 14px', borderRadius: 9,
                border: '1px solid ' + C.rule, background: C.card, color: C.ink },
  select    : { font: '400 13px ' + FONT, padding: '10px 12px', borderRadius: 9,
                border: '1px solid ' + C.rule, background: C.card, color: C.body },
  primary   : { font: '500 13px ' + FONT, padding: '10px 18px', borderRadius: 9,
                border: 'none', background: C.sienna, color: '#FFF', cursor: 'pointer' },
  ghost     : { font: '500 12.5px ' + FONT, padding: '7px 13px', borderRadius: 8,
                border: '1px solid ' + C.rule, background: 'transparent',
                color: C.soft, cursor: 'pointer' },

  /* the register itself — cards, not rows. This must not read as a sheet. */
  list      : { display: 'flex', flexDirection: 'column', gap: 10 },
  item      : { display: 'flex', gap: 16, background: C.card, borderRadius: 11,
                border: '1px solid ' + C.rule, padding: '15px 18px' },
  rule      : { width: 3, borderRadius: 2, flexShrink: 0 },
  itemBody  : { flex: 1, minWidth: 0 },
  itemTop   : { display: 'flex', alignItems: 'baseline', gap: 10,
                flexWrap: 'wrap', marginBottom: 4 },
  handle    : { font: '600 14.5px ' + FONT, color: C.ink },
  what      : { font: '400 13.5px ' + FONT, color: C.body },
  meta      : { font: '400 12.5px ' + FONT, color: C.muted, lineHeight: 1.75 },
  holder    : { font: '500 13px ' + FONT, color: C.teal },
  warn      : { font: '500 12.5px ' + FONT, color: C.ochre },
  alarm     : { font: '500 12.5px ' + FONT, color: C.sienna },
  actions   : { display: 'flex', flexDirection: 'column', gap: 6,
                alignItems: 'flex-end', flexShrink: 0 },

  pill      : { font: '500 11px ' + FONT, color: '#FFF', padding: '3px 9px',
                borderRadius: 999, whiteSpace: 'nowrap' },
  pillSubtle: { font: '500 11px ' + FONT, padding: '2px 8px', borderRadius: 999,
                border: '1px solid', background: 'transparent', whiteSpace: 'nowrap' },

  /* panels */
  scrim     : { position: 'fixed', inset: 0, background: 'rgba(31,27,22,0.34)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                padding: '48px 20px', overflowY: 'auto', zIndex: 50 },
  panel     : { background: C.paper, borderRadius: 14, padding: 26,
                width: '100%', maxWidth: 520, fontFamily: FONT },
  panelHead : { display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', gap: 16, marginBottom: 20 },
  panelTitle: { font: '600 18px ' + FONT, color: C.ink },
  panelSub  : { font: '400 13px ' + FONT, color: C.muted, marginTop: 5 },
  close     : { font: '500 12.5px ' + FONT, background: 'transparent',
                border: '1px solid ' + C.rule, borderRadius: 8,
                padding: '6px 12px', color: C.soft, cursor: 'pointer' },

  field     : { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 },
  fieldLabel: { font: '500 12px ' + FONT, color: C.soft },
  fieldHint : { font: '400 11.5px ' + FONT, color: C.muted },
  input     : { font: '400 13.5px ' + FONT, padding: '9px 12px', borderRadius: 8,
                border: '1px solid ' + C.rule, background: C.card, color: C.ink },
  textarea  : { font: '400 13.5px ' + FONT, padding: '9px 12px', borderRadius: 8,
                border: '1px solid ' + C.rule, background: C.card, color: C.ink,
                minHeight: 66, resize: 'vertical' },
  row2      : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },

  note      : { font: '400 12.5px ' + FONT, color: C.soft, background: C.inset,
                borderLeft: '2px solid ' + C.sienna, padding: '11px 14px',
                borderRadius: 6, lineHeight: 1.7, marginBottom: 16 },
  error     : { font: '500 12.5px ' + FONT, color: C.sienna, background: '#FBF1ED',
                padding: '10px 13px', borderRadius: 7, marginBottom: 14 },

  /* history */
  event     : { display: 'flex', gap: 12, padding: '10px 0',
                borderBottom: '1px solid ' + C.rule },
  eventWhen : { font: '400 12px ' + FONT, color: C.muted, minWidth: 92, flexShrink: 0 },
  eventWhat : { font: '400 13px ' + FONT, color: C.body, flex: 1 },
  eventWho  : { font: '400 11.5px ' + FONT, color: C.muted },

  /* reports */
  grid      : { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 14 },
  cardBox   : { background: C.card, borderRadius: 12, border: '1px solid ' + C.rule,
                padding: '18px 20px' },
  cardTitle : { font: '600 14px ' + FONT, color: C.ink, marginBottom: 3 },
  cardSub   : { font: '400 12px ' + FONT, color: C.muted, marginBottom: 14 },
  barRow    : { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 },
  barLabel  : { font: '400 12.5px ' + FONT, color: C.body, width: 108, flexShrink: 0 },
  barTrack  : { flex: 1, height: 7, background: C.inset, borderRadius: 4,
                overflow: 'hidden' },
  barFill   : { height: '100%', borderRadius: 4 },
  barValue  : { font: '500 12.5px ' + FONT, color: C.soft, width: 34,
                textAlign: 'right', flexShrink: 0 },

  empty     : { font: '400 13.5px ' + FONT, color: C.muted, background: C.card,
                border: '1px dashed ' + C.rule, borderRadius: 11,
                padding: '30px 22px', textAlign: 'center' },

  gate      : { fontFamily: FONT, background: C.paper, minHeight: '100vh',
                padding: '80px 30px', textAlign: 'center', color: C.muted },
  gateTitle : { font: '600 19px ' + FONT, color: C.ink, marginBottom: 8 },
  gateBody  : { font: '400 13.5px ' + FONT, color: C.muted }
};
