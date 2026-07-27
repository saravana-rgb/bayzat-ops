'use client';
/* Everything the Sources tile lists. Add a group or a row and it shows up. */

/* --------------------------------------------------------- sources */
// Where everything actually lives. Grouped by tile, so as tiles are added
// their sources sit under their own heading.
export const sources = [
  {
    group: 'Onboarding',
    items: [
      {
        name: 'Onboarding Automation Sheet',
        kind: 'Google Sheet',
        tone: 'green',
        desc: 'The joiners feed. Apps Script reads it and turns each new row into a ticket.',
        detail: 'First Name \u00b7 Last Name \u00b7 DOJ \u00b7 Joining Location \u00b7 Laptop Request',
        url: 'https://docs.google.com/spreadsheets/d/1j05L-fbJY7fX8oCxJfu2rDoLBDp2NuVUNrUWplU8Zww/edit?gid=0#gid=0'
      },
      {
        name: 'Apps Script',
        kind: 'Automation',
        tone: 'amber',
        desc: 'Watches the sheet every five minutes, creates tickets, sends both emails.',
        detail: 'Open the sheet \u2192 Extensions \u2192 Apps Script',
        url: 'https://docs.google.com/spreadsheets/d/1j05L-fbJY7fX8oCxJfu2rDoLBDp2NuVUNrUWplU8Zww/edit?gid=0#gid=0'
      }
    ]
  },
  {
    group: 'Platform',
    items: [
      {
        name: 'Document storage',
        kind: 'Storage',
        tone: 'accent',
        desc: 'The private bucket holding every licence, card, letterhead and stamp.',
        detail: 'Supabase → Storage → company-docs',
        url: 'https://supabase.com/dashboard'
      },
      {
        name: 'GitHub repository',
        kind: 'Code',
        tone: 'grey',
        desc: 'This app. Committing to main redeploys it automatically.',
        detail: 'saravana-rgb/bayzat-ops',
        url: 'https://github.com/saravana-rgb/bayzat-ops'
      },
      {
        name: 'Supabase project',
        kind: 'Database',
        tone: 'accent',
        desc: 'Tickets, steps, users and access rules. The single source of truth.',
        detail: 'Tables: tickets \u00b7 ticket_steps \u00b7 view: v_pending_steps',
        url: 'https://supabase.com/dashboard'
      },
      {
        name: 'Vercel project',
        kind: 'Hosting',
        tone: 'grey',
        desc: 'Serves this app and rebuilds on every commit.',
        detail: 'bayzat-ops-vert.vercel.app',
        url: 'https://vercel.com/dashboard'
      }
    ]
  }
];

/* ----------------------------------------------------------- dates */
