const BASE = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'
    : '/api');

async function req(path, opts = {}) {
  try {
    const res  = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      ...opts,
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: e.message || 'Network error' } };
  }
}

export const api = {
  health:       ()           => req('/health'),
  stats:        ()           => req('/stats'),
  members:      (params='')  => req(`/members${params}`),
  member:       (id)         => req(`/members/${id}`),
  createMember: (body)       => req('/members', { method:'POST', body: JSON.stringify(body) }),
  updateMember: (id, body)   => req(`/members/${id}`, { method:'PUT', body: JSON.stringify(body) }),
  deleteMember: (id)         => req(`/members/${id}`, { method:'DELETE' }),
  updateStatus: (id, body)   => req(`/members/${id}/status`, { method:'PUT', body: JSON.stringify(body) }),
  history:      (id, limit=20) => req(`/members/${id}/history?limit=${limit}`),
  activity:     (limit=30)   => req(`/activity?limit=${limit}`),
  departments:  ()           => req('/departments'),
};
