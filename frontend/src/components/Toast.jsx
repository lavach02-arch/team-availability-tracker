import { useEffect } from 'react';
import './Toast.css';

const CFG = {
  success: { icon:'✓', color:'#10B981' },
  error:   { icon:'✕', color:'#EF4444' },
  info:    { icon:'ℹ', color:'#4F46E5' },
  warn:    { icon:'!', color:'#F59E0B' },
};

export default function Toast({ id, message, type='success', onClose }) {
  const cfg = CFG[type] || CFG.info;
  useEffect(() => {
    const t = setTimeout(() => onClose(id), 4500);
    return () => clearTimeout(t);
  }, [id, onClose]);

  return (
    <div className="toast" style={{ '--tc': cfg.color }}>
      <span className="toast__icon">{cfg.icon}</span>
      <span className="toast__msg">{message}</span>
      <button className="toast__x" onClick={() => onClose(id)}>×</button>
    </div>
  );
}
