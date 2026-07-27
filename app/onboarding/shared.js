'use client';
/* How the Onboarding tile talks about time and status. */

/* ----------------------------------------------------------- dates */
export const today = () => new Date().toISOString().slice(0, 10);

const diff = (a, b) =>
  Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 864e5);

/** Days since the joining date. Negative means they have not started yet. */

/** Days since the joining date. Negative means they have not started yet. */
export const daysSince = (doj) => diff(doj, today());

export const pretty = (iso) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }) : '';

/** How a ticket reads at a glance. There is no deadline any more, so this
 *  shows how long it has been sitting: quiet at first, louder as it ages. */

/** How a ticket reads at a glance. There is no deadline any more, so this
 *  shows how long it has been sitting: quiet at first, louder as it ages. */
export function ageChip(doj) {
  const d = daysSince(doj);
  if (d < 0)   return { cls: 'grey',  text: d === -1 ? 'Joins tomorrow' : `Joins in ${-d}d` };
  if (d === 0) return { cls: 'accent', text: 'Joins today' };
  if (d < 3)   return { cls: 'grey',  text: `Open ${d}d` };
  if (d < 7)   return { cls: 'amber', text: `Open ${d}d` };
  return { cls: 'red', text: `Open ${d}d` };
}

export const STATUS = { todo: 'To do', progress: 'In progress', done: 'Done', na: 'N/A' };

/* ------------------------------------------------------------ auth */
/** Wraps every page. Signed-out visitors get the sign-in form; anyone
 *  outside bayzat.com is turned away here and again by row level security
 *  in Postgres, so the database is the real gate. */
