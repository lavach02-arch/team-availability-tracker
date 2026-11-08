import { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';
import { timeAgo } from '../utils/status';
import './Activity.css';

export default function Activity({ showToast }) {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.activity(50);
    if (r.ok) setLogs(r.data.activity);
    else showToast('Failed to load activity','error');
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [load]);

  return (
    <div className="activity-page">
      <div className="activity-page__header">
        <div className="activity-page__header-inner">
          <div>
            <h1>Activity Feed</h1>
            <p>Live log of all status changes · Auto-refreshes every 15s</p>
          </div>
          <button className="activity-page__refresh" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      <div className="activity-page__body">
        {loading ? (
          <div className="activity-list">
            {Array.from({length:8}).map((_,i)=>(
              <div key={i} className="activity-skeleton">
                <div className="skeleton" style={{width:40,height:40,borderRadius:'50%',flexShrink:0}}/>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <div className="skeleton" style={{height:13,width:'50%'}}/>
                  <div className="skeleton" style={{height:11,width:'70%'}}/>
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="activity-empty">
            <span>📋</span><p>No activity yet. Start updating statuses!</p>
          </div>
        ) : (
          <div className="activity-list">
            {logs.map((log, i) => (
              <div key={log.id} className="activity-item" style={{animationDelay:`${i*0.03}s`}}>
                <div className="activity-item__avatar" style={{background: log.avatar_color}}>
                  {log.member_initials}
                </div>
                <div className="activity-item__body">
                  <p className="activity-item__title">
                    <strong>{log.member_name}</strong> changed status
                  </p>
                  <div className="activity-item__change">
                    <StatusBadge status={log.old_status} size="sm" />
                    <span className="activity-item__arrow">→</span>
                    <StatusBadge status={log.new_status} size="sm" />
                    {log.note && <span className="activity-item__note">· "{log.note}"</span>}
                  </div>
                </div>
                <span className="activity-item__time">{timeAgo(log.changed_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
