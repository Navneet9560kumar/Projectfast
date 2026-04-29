import { formatDistanceToNow, parseISO, addDays } from 'date-fns';

export const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

export const formatRelativeTime = (dateString) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
};

export const getDaysUntilPurge = (deletedAt) => {
  try {
    const deleted = parseISO(deletedAt);
    const purgeDate = addDays(deleted, 30);
    const now = new Date();
    const daysLeft = Math.ceil((purgeDate - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  } catch {
    return 0;
  }
};

export const getPurgeDate = (deletedAt) => {
  try {
    const deleted = parseISO(deletedAt);
    const purgeDate = addDays(deleted, 30);
    return formatDate(purgeDate.toISOString());
  } catch {
    return 'Unknown';
  }
};

export const getStatusColor = (daysLeft) => {
  if (daysLeft <= 0) return 'red';
  if (daysLeft <= 7) return 'orange';
  return 'green';
};

export const getStatusLabel = (daysLeft) => {
  if (daysLeft <= 0) return 'Purging soon';
  if (daysLeft <= 7) return 'Warning';
  return 'Safe';
};
