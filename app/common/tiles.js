'use client';
/* The tile registry, and who may see what. Adding a tile means a folder under
   app/ plus one entry here — nothing else in the shell changes. */
/* ---------------------------------------------------------- access */
// Only these people see the Sources tile. Everyone else gets the tracker.
export const ADMINS = ['saravana@bayzat.com'];
/* ---------------------------------------------------------- access */
// Only these people see the Sources tile. Everyone else gets the tracker.
export const isAdmin = (email) => ADMINS.includes((email || '').toLowerCase());
/* ------------------------------------------------------------ icons */
/* Drawn inline so nothing depends on a font shipping the right glyph. */
const PATHS = {
  onboarding: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 M9 14l2 2 4-4',
  reports:    'M18 20V10 M12 20V4 M6 20v-6',
  sources:    'M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  documents:  'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h4',
  assets:     'M4 16V8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4 M12 12v8',
  plus:       'M12 5v14 M5 12h14'
};
/* ----------------------------------------------------------- tiles */
// Adding a tile later means one entry here and one folder under app/.
export const tiles = [
  {
    slug: 'employees',
    name: 'Employees',
    blurb: 'Everyone who works here, what we know about them, and what is missing.',
    href: '/employees',
    icon: 'employees',
    live: true
  },
  {
    slug: 'master',
    name: 'Master employees',
    blurb: 'The full HR record — role, contract, visa, insurance — synced from the Master sheet.',
    href: '/master',
    icon: 'master',
    live: true
  },
  {
    slug: 'onboarding',
    name: 'Onboarding',
    blurb: 'New joiners, the six IT steps they need, and the monthly report.',
    href: '/onboarding',
    icon: 'onboarding',
    live: true
  },
  {
    slug: 'offboarding',
    name: 'Offboarding',
    blurb: 'Who is leaving, what we need back from them, and what is still open.',
    href: '/offboarding',
    icon: 'offboarding',
    live: true
  },
  {
    slug: 'documents',
    name: 'Company documents',
    blurb: 'Trade licences, establishment cards, letterheads and stamps, with expiry watched.',
    href: '/documents',
    icon: 'documents',
    live: true,
    tone: 'violet'
  },
  {
    slug: 'sources',
    name: 'Sources',
    blurb: 'The sheets, repo and database behind every tile.',
    href: '/sources',
    icon: 'sources',
    live: true,
    tone: 'emerald',
    adminOnly: true
  },
  {
    slug: 'assets',
    name: 'Assets',
    blurb: 'Every device, who has it, and what came back — built from what onboarding and offboarding already know.',
    href: '/assets',
    icon: 'assets',
    live: true
  }
];
