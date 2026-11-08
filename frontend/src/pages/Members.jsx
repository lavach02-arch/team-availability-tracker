import { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { timeAgo } from '../utils/status';
import './Members.css';

const COLORS = ['#E53935','#8E24AA','#1E88E5','#00897B','#43A047','#FB8C00','#6D4C41','#00ACC1','#3949AB','#D81B60'];

function AddMemberModal({ onClose, onAdd, showToast }) {
  const [form, setForm] = useState({ name:'', role:'', department:'', email:'' });
  const [loading, setLoading] = useState(false);
  const color = COLORS[Math.floor(Math.random()*COLORS.length)];

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { showToast('Name and email required','error'); return; }
    setLoading(true);
    const r = await api.createMember({ ...form, avatar_color: color });
    setLoading(false);
    if (r.ok) {
      onAdd(r.data.member);
      showToast(`${form.name} added to team!`, 'success');
      onClose();
    } else {
      showToast(r.data.error || 'Failed to add member', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal__header">
          <h2>Add Team Member</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} className="modal__form">
          {[
            { label:'Full Name *',   key:'name',       placeholder:'e.g. Priya Sharma',   type:'text'  },
            { label:'Email *',       key:'email',      placeholder:'priya@company.com',    type:'email' },
            { label:'Role',          key:'role',       placeholder:'e.g. Senior Developer',type:'text' },
            { label:'Department',    key:'department', placeholder:'e.g. Engineering',     type:'text' },
          ].map(f => (
            <div key={f.key} className="modal__field">
              <label>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
              />
            </div>
          ))}
          <div className="modal__actions">
            <button type="button" className="modal__cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal__submit" disabled={loading}>
              {loading ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Members({ showToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [history, setHistory]  = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => {
    api.members().then(r => {
      if (r.ok) setMembers(r.data.members);
      setLoading(false);
    });
  }, []);

  const handleAdd = (m) => setMembers(p => [m, ...p]);
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this member?')) return;
    const r = await api.deleteMember(id);
    if (r.ok) { setMembers(p=>p.filter(m=>m.id!==id)); showToast('Member removed','info'); }
    else showToast(r.data.error||'Failed','error');
  };

  const viewHistory = async (m) => {
    setSelected(m);
    setHistLoading(true);
    const r = await api.history(m.id, 15);
    if (r.ok) setHistory(r.data.history);
    setHistLoading(false);
  };

  const filtered = members.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="members-page">
      <div className="members-page__header">
        <div className="members-page__header-inner">
          <div>
            <h1>Team Members</h1>
            <p>{members.length} members in your team</p>
          </div>
          <button className="members-page__add-btn" onClick={() => setShowAdd(true)}>
            + Add Member
          </button>
        </div>
      </div>

      <div className="members-page__body">
        <div className="members-page__search">
          <span>🔍</span>
          <input placeholder="Search by name, email or department…"
                 value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {loading ? (
          <div className="members-page__list">
            {Array.from({length:5}).map((_,i)=>(
              <div key={i} className="members-row skeleton" style={{height:68,borderRadius:10}} />
            ))}
          </div>
        ) : (
          <div className="members-page__table-wrap">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Member</th><th>Department</th><th>Email</th>
                  <th>Status</th><th>Last Seen</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="members-table__row">
                    <td>
                      <div className="mt-member">
                        <div className="mt-avatar" style={{background:m.avatar_color}}>
                          {m.avatar_initials}
                        </div>
                        <div>
                          <p className="mt-name">{m.name}</p>
                          <p className="mt-role">{m.role}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="mt-dept">{m.department}</span></td>
                    <td><span className="mt-email">{m.email}</span></td>
                    <td><StatusBadge status={m.status} animated /></td>
                    <td className="mt-lastseen">{timeAgo(m.last_seen)}</td>
                    <td>
                      <div className="mt-actions">
                        <button className="mt-btn mt-btn--history" onClick={()=>viewHistory(m)}>History</button>
                        <button className="mt-btn mt-btn--delete" onClick={()=>handleDelete(m.id)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="members-page__empty">
                <p>No members match your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showAdd && (
        <AddMemberModal onClose={()=>setShowAdd(false)} onAdd={handleAdd} showToast={showToast} />
      )}

      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal__header">
              <h2>{selected.name} — Status History</h2>
              <button onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="history-list">
              {histLoading ? <p className="history-loading">Loading…</p> :
               history.length === 0 ? <p className="history-empty">No history yet.</p> :
               history.map(h => (
                 <div key={h.id} className="history-item">
                   <div className="history-item__statuses">
                     <StatusBadge status={h.old_status} size="sm" />
                     <span className="history-item__arrow">→</span>
                     <StatusBadge status={h.new_status} size="sm" />
                   </div>
                   {h.note && <p className="history-item__note">"{h.note}"</p>}
                   <p className="history-item__time">{new Date(h.changed_at+'Z').toLocaleString()}</p>
                 </div>
               ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
