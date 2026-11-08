export const STATUS_META = {
  available: { label: 'Available', color: 'var(--available)', bg: 'var(--available-bg)', border: 'var(--available-border)', dot: '#10B981' },
  busy:      { label: 'Busy',      color: 'var(--busy)',      bg: 'var(--busy-bg)',      border: 'var(--busy-border)',      dot: '#EF4444' },
  away:      { label: 'Away',      color: 'var(--away)',      bg: 'var(--away-bg)',       border: 'var(--away-border)',      dot: '#F59E0B' },
  offline:   { label: 'Offline',   color: 'var(--offline)',   bg: 'var(--offline-bg)',   border: 'var(--offline-border)',   dot: '#6B7280' },
};

export const STATUSES = ['available', 'busy', 'away', 'offline'];

export function timeAgo(isoString) {
  if (!isoString) return 'Never';
  const diff = (Date.now() - new Date(isoString + 'Z').getTime()) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}
