export const formatJobDeadline = (deadline) => {
  if (!deadline) return 'Open until filled';
  return new Date(deadline).toLocaleDateString(undefined, { timeZone: 'UTC' });
};
