import { useState } from 'react';
import { STATUS_META, STATUSES } from '../utils/status';
import './StatusToggle.css';

export default function StatusToggle({ currentStatus, onSelect, loading }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[currentStatus] || STATUS_META.offline;

  const select = (s) => {
    setOpen(false);
    if (s !== currentStatus) onSelect(s);
  };

  return (
    <div className="st-wrap">
      <button
        className="st-trigger"
        style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
        onClick={() => setOpen(p => !p)}
        disabled={loading}
      >
        <span className="st-dot" style={{ background: meta.dot }} />
        <span>{meta.label}</span>
        {loading
          ? <span className="st-spinner" />
          : <span className="st-caret">{open ? '▲' : '▼'}</span>}
      </button>

      {open && (
        <ul className="st-menu" role="menu">
          {STATUSES.map(s => {
            const m = STATUS_META[s];
            return (
              <li key={s} role="menuitem"
                  className={`st-option ${s === currentStatus ? 'st-option--active' : ''}`}
                  onClick={() => select(s)}>
                <span className="st-option__dot" style={{ background: m.dot }} />
                <span style={{ color: m.color }}>{m.label}</span>
                {s === currentStatus && <span className="st-option__check">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
