export const today = () => new Date().toISOString().slice(0, 10);

export const daysLeft = (due) =>
  Math.round((new Date(due + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5);

export const pretty = (iso) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export function dueChip(due) {
  const d = daysLeft(due);
  if (d < 0)  return { cls: 'red',   text: `${-d}d overdue` };
  if (d === 0) return { cls: 'amber', text: 'Due today' };
  return { cls: 'grey', text: `${d}d left` };
}

export const STATUS = { todo: 'To do', progress: 'In progress', done: 'Done', na: 'N/A' };
