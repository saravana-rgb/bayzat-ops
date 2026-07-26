// The tile registry. Adding a tile later means one entry here and one
// folder under app/. Nothing else in the shell needs to change.
export const tiles = [
  {
    slug: 'onboarding',
    name: 'Onboarding tracker',
    blurb: 'Every new joiner, the six IT steps they need, and what is overdue.',
    href: '/onboarding',
    icon: '\u2713',
    live: true
  },
  {
    slug: 'next',
    name: 'Your next tile',
    blurb: 'Offboarding, asset register, access reviews — whatever comes next.',
    href: '#',
    icon: '+',
    live: false
  }
];
