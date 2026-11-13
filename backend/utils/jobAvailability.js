export const publicJobFilter = (now = new Date()) => ({
  status: 'Active',
  $or: [
    { applicationDeadline: { $exists: false } },
    { applicationDeadline: null },
    { applicationDeadline: { $gt: now } }
  ]
});

export const isApplicationOpen = (job, now = new Date()) => {
  if (job.status !== 'Active') return false;
  if (!job.applicationDeadline) return true;
  return new Date(job.applicationDeadline).getTime() > now.getTime();
};
