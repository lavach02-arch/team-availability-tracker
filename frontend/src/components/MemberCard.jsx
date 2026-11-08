import { useState } from 'react';
import StatusBadge from './StatusBadge';
import StatusToggle from './StatusToggle';
import { timeAgo } from '../utils/status';
import { api } from '../services/api';
import './MemberCard.css';

export default function MemberCard({ member, onStatusChange, onDelete, showToast }) {
  const [loading, setLoading]   = useState(false);
  const [flash,   setFlash]     = useState(false);

  const handleStatus = async (newStatus) => {
    setLoading(true);
    const r = await api.updateStatus(member.id, { status: newStatus, changed_by: 'dashboard' });
    setLoading(false);
    if (r.ok) {
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
      onStatusChange(r.data.member);
      showToast(`${member.name} is now ${newStatus}`, 'success');
    } else {
      showToast(r.data.error || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return;
    const r = await api.deleteMember(member.id);
    if (r.ok) {
      onDelete(member.id);
      showToast(`${member.name} removed`, 'info');
    } else {
      showToast(r.data.error || 'Failed to delete', 'error');
    }
  };

  return (
    <div className={`member-card ${flash ? 'member-card--flash' : ''}`}>
      {/* avatar */}
      <div className="mc-avatar" style={{ background: member.avatar_color }}>
        {member.avatar_initials}
        <span
          className="mc-status-dot"
          style={{ background: `var(--${member.status})` }}
        />
      </div>

      {/* info */}
      <div className="mc-info">
        <p className="mc-name">{member.name}</p>
        <p className="mc-role">{member.role}</p>
        <p className="mc-dept">{member.department}</p>
        {member.note && <p className="mc-note">"{member.note}"</p>}
      </div>

      {/* status toggle */}
      <div className="mc-toggle">
        <StatusToggle
          currentStatus={member.status}
          onSelect={handleStatus}
          loading={loading}
        />
        <span className="mc-lastseen">
          Last seen {timeAgo(member.last_seen)}
        </span>
      </div>

      {/* actions */}
      <button className="mc-delete" onClick={handleDelete} title="Remove member">✕</button>
    </div>
  );
}
