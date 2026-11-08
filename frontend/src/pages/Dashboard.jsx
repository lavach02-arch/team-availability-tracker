import { useState, useEffect, useCallback, useRef } from 'react';
import MemberCard from '../components/MemberCard';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import './Dashboard.css';

const STAT_ICONS = { total:'👥', available:'🟢', busy:'🔴', away:'🟡', offline:'⚫' };

function StatCard({ label, value, status, loading }) {
  return (
    <div className={`dash-stat dash-stat--${status || 'total'}`}>
      <span className="dash-stat__icon">{STAT_ICONS[status || 'total']}</span>
      <div>
        <p className="dash-stat__val">{loading ? '—' : value}</p>
        <p className="dash-stat__label">{label}</p>
      </div>
      {status && status !== 'total' && (
        <span className="dash-stat__badge"><StatusBadge status={status} size="sm" /></span>
      )}
    </div>
  );
}

function MemberSkeleton() {
  return (
    <div className="member-card-skeleton">
      <div className="skeleton" style={{width:52,height:52,borderRadius:'50%',flexShrink:0}} />
      <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
        <div className="skeleton" style={{height:14,width:'40%'}} />
        <div className="skeleton" style={{height:12,width:'60%'}} />
        <div className="skeleton" style={{height:10,width:'30%'}} />
      </div>
      <div className="skeleton" style={{width:100,height:30,borderRadius:999}} />
    </div>
  );
}

export default function Dashboard({ showToast, setConnected }) {
  const [members,  setMembers]  = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [dept,     setDept]     = useState('all');
  const [search,   setSearch]   = useState('');
  const [depts,    setDepts]    = useState([]);
  const socketRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [mRes, sRes, dRes] = await Promise.all([
      api.members(),
      api.stats(),
      api.departments(),
    ]);
    if (mRes.ok) setMembers(mRes.data.members);
    if (sRes.ok) setStats(sRes.data);
    if (dRes.ok) setDepts(dRes.data.departments);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();

    // WebSocket
    const socket = getSocket();
    socketRef.current = socket;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('initial_state', ({ members: m }) => {
      setMembers(m);
    });

    socket.on('status_update', ({ member }) => {
      setMembers(prev => prev.map(m => m.id === member.id ? member : m));
      setStats(prev => prev ? null : prev); // trigger stats refresh
      api.stats().then(r => { if (r.ok) setStats(r.data); });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('initial_state');
      socket.off('status_update');
    };
  }, [loadAll, setConnected]);

  const handleStatusChange = (updated) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    api.stats().then(r => { if (r.ok) setStats(r.data); });
  };

  const handleDelete = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    api.stats().then(r => { if (r.ok) setStats(r.data); });
  };

  /* filtering */
  const visible = members.filter(m => {
    const matchStatus = filter === 'all' || m.status === filter;
    const matchDept   = dept   === 'all' || m.department === dept;
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchDept && matchSearch;
  });

  /* group by department */
  const groups = {};
  visible.forEach(m => {
    if (!groups[m.department]) groups[m.department] = [];
    groups[m.department].push(m);
  });

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div className="dashboard__header-inner">
          <div>
            <h1 className="dashboard__title">Team Availability Dashboard</h1>
            <p className="dashboard__sub">Real-time status overview — updates instantly via WebSocket</p>
          </div>
          <button className="dashboard__refresh" onClick={loadAll} title="Refresh">
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="dashboard__body">
        {/* Stats row */}
        <div className="dashboard__stats">
          <StatCard label="Total Members" value={stats?.total}     status="total"     loading={loading} />
          <StatCard label="Available"     value={stats?.available} status="available" loading={loading} />
          <StatCard label="Busy"          value={stats?.busy}      status="busy"      loading={loading} />
          <StatCard label="Away"          value={stats?.away}      status="away"      loading={loading} />
          <StatCard label="Offline"       value={stats?.offline}   status="offline"   loading={loading} />
        </div>

        {/* Availability bar */}
        {stats && (
          <div className="dash-avail-bar">
            <div className="dash-avail-bar__inner">
              <div className="dash-avail-bar__fill dash-avail-bar__fill--available"
                   style={{ width: `${(stats.available/stats.total)*100}%` }} />
              <div className="dash-avail-bar__fill dash-avail-bar__fill--busy"
                   style={{ width: `${(stats.busy/stats.total)*100}%` }} />
              <div className="dash-avail-bar__fill dash-avail-bar__fill--away"
                   style={{ width: `${(stats.away/stats.total)*100}%` }} />
              <div className="dash-avail-bar__fill dash-avail-bar__fill--offline"
                   style={{ width: `${(stats.offline/stats.total)*100}%` }} />
            </div>
            <span className="dash-avail-bar__label">{stats.availability_rate}% availability rate</span>
          </div>
        )}

        {/* Filters */}
        <div className="dashboard__filters">
          <div className="dash-search">
            <span>🔍</span>
            <input
              placeholder="Search members…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="dash-filter-tabs">
            {['all','available','busy','away','offline'].map(s => (
              <button key={s}
                      className={`dash-tab ${filter===s?'dash-tab--active':''}`}
                      onClick={() => setFilter(s)}>
                {s === 'all' ? 'All' : <StatusBadge status={s} size="sm" />}
              </button>
            ))}
          </div>

          <select className="dash-dept-select"
                  value={dept} onChange={e => setDept(e.target.value)}>
            <option value="all">All Departments</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Count */}
        {!loading && (
          <p className="dashboard__count">
            Showing <strong>{visible.length}</strong> of <strong>{members.length}</strong> members
          </p>
        )}

        {/* Member list */}
        {loading ? (
          <div className="dashboard__list">
            {Array.from({length:6}).map((_,i) => <MemberSkeleton key={i}/>)}
          </div>
        ) : visible.length === 0 ? (
          <div className="dashboard__empty">
            <span>🔍</span>
            <p>No members match your filters</p>
            <button onClick={() => { setFilter('all'); setDept('all'); setSearch(''); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          Object.entries(groups).sort().map(([dept, ms]) => (
            <div key={dept} className="dashboard__dept-group">
              <h3 className="dashboard__dept-label">
                {dept}
                <span className="dashboard__dept-count">{ms.length}</span>
              </h3>
              <div className="dashboard__list">
                {ms.map(m => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    showToast={showToast}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
