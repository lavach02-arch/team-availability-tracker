import { STATUS_META } from '../utils/status';
import './StatusBadge.css';

export default function StatusBadge({ status, size = 'md', animated = false }) {
  const meta = STATUS_META[status] || STATUS_META.offline;
  return (
    <span
      className={`status-badge status-badge--${size}`}
      style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
    >
      <span className={`status-badge__dot ${animated && status === 'available' ? 'status-badge__dot--pulse' : ''}`}
            style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
}
