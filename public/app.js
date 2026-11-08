/**
 * Team Availability Tracker - Frontend Client
 * Synchronized live with Server-Sent Events (SSE) and asynchronous fetch()
 */

const state = {
  members: [],
  filterStatus: 'all',
  filterDept: 'All',
  searchQuery: '',
  eventSource: null,
};

// DOM References
const membersGrid = document.getElementById('members-grid');
const statTotal = document.getElementById('stat-total');
const statAvailable = document.getElementById('stat-available');
const statBusy = document.getElementById('stat-busy');
const statAway = document.getElementById('stat-away');
const statRate = document.getElementById('stat-rate');
const statRateBar = document.getElementById('stat-rate-bar');
const countAll = document.getElementById('count-all');
const searchInput = document.getElementById('search-input');
const streamStatus = document.getElementById('stream-status');

const modalActivity = document.getElementById('modal-activity');
const activityLogList = document.getElementById('activity-log-list');
const btnOpenActivity = document.getElementById('btn-open-activity');
const btnCloseActivity = document.getElementById('btn-close-activity');

const modalAdd = document.getElementById('modal-add-member');
const formAdd = document.getElementById('form-add-member');
const btnOpenAdd = document.getElementById('btn-open-add');
const btnCloseAdd = document.getElementById('btn-close-add');
const btnCancelAdd = document.getElementById('btn-cancel-add');

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  loadStats();
  loadMembers();
  connectLiveStream();
  bindEvents();
});

/**
 * Connects to Server-Sent Events (SSE) stream for real-time synchronization.
 */
function connectLiveStream() {
  if (!window.EventSource) {
    console.warn('SSE not supported in this browser, falling back to periodic polling.');
    setInterval(loadMembers, 4000);
    return;
  }

  try {
    const stream = new EventSource('/api/stream');
    state.eventSource = stream;

    stream.onopen = () => {
      streamStatus.classList.remove('hidden');
      streamStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span>Live Synced</span>`;
    };

    stream.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleStreamEvent(payload);
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    stream.onerror = () => {
      streamStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span><span>Reconnecting...</span>`;
    };
  } catch (err) {
    console.error('SSE initialization failed:', err);
  }
}

/**
 * Handles incoming real-time SSE stream events.
 */
function handleStreamEvent(data) {
  if (data.type === 'STATUS_UPDATED') {
    const member = data.member;
    const existingIdx = state.members.findIndex((m) => m.id === member.id);
    if (existingIdx !== -1) {
      state.members[existingIdx] = member;
      updateMemberCardUI(member);
    }
    loadStats();
    showToast(`${member.name} changed status to "${member.status}"`, 'info');
  } else if (data.type === 'MEMBER_CREATED' || data.type === 'MEMBER_DELETED' || data.type === 'MEMBER_UPDATED') {
    loadMembers();
    loadStats();
  }
}

/**
 * Binds UI listeners
 */
function bindEvents() {
  // Status tab filters
  document.querySelectorAll('.filter-status-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-status-btn').forEach((b) => {
        b.className = 'filter-status-btn px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5';
      });
      btn.className = 'filter-status-btn px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white transition-colors flex items-center gap-1.5';

      state.filterStatus = btn.getAttribute('data-status');
      renderMembers();
    });
  });

  // Department filter chips
  document.querySelectorAll('.filter-dept-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-dept-btn').forEach((b) => {
        b.className = 'filter-dept-btn px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex-shrink-0';
      });
      btn.className = 'filter-dept-btn px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 transition-colors flex-shrink-0';

      state.filterDept = btn.getAttribute('data-dept');
      renderMembers();
    });
  });

  // Search input
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = searchInput.value.trim().toLowerCase();
      renderMembers();
    }, 150);
  });

  // Modals
  btnOpenActivity.addEventListener('click', openActivityModal);
  btnCloseActivity.addEventListener('click', () => modalActivity.classList.add('hidden'));

  btnOpenAdd.addEventListener('click', () => modalAdd.classList.remove('hidden'));
  btnCloseAdd.addEventListener('click', () => modalAdd.classList.add('hidden'));
  btnCancelAdd.addEventListener('click', () => modalAdd.classList.add('hidden'));

  formAdd.addEventListener('submit', handleAddMember);
}

/**
 * Loads analytics stats from GET /api/stats
 */
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success) {
      statTotal.textContent = data.total;
      statAvailable.textContent = data.available;
      statBusy.textContent = data.busy;
      statAway.textContent = data.away;
      statRate.textContent = `${data.availabilityRate}%`;
      statRateBar.style.width = `${data.availabilityRate}%`;
      countAll.textContent = data.total;
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

/**
 * Loads members from GET /api/members
 */
async function loadMembers() {
  try {
    const res = await fetch('/api/members');
    const data = await res.json();
    if (data.success) {
      state.members = data.members;
      renderMembers();
    }
  } catch (err) {
    console.error('Failed to load members:', err);
  }
}

/**
 * Renders member cards in grid based on filters.
 */
function renderMembers() {
  let list = state.members;

  if (state.filterStatus !== 'all') {
    list = list.filter((m) => m.status.toLowerCase() === state.filterStatus.toLowerCase());
  }

  if (state.filterDept !== 'All') {
    list = list.filter((m) => m.department.toLowerCase() === state.filterDept.toLowerCase());
  }

  if (state.searchQuery) {
    const q = state.searchQuery;
    list = list.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      (m.note && m.note.toLowerCase().includes(q))
    );
  }

  if (list.length === 0) {
    membersGrid.innerHTML = `
      <div class="col-span-full py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
        <i data-lucide="filter-x" class="w-8 h-8 text-slate-600 mx-auto mb-2"></i>
        <h4 class="text-sm font-semibold text-slate-300">No team members match the filter</h4>
        <p class="text-xs text-slate-500 mt-1">Try switching status tabs or clear the search query.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  membersGrid.innerHTML = list.map((m) => buildMemberCardHtml(m)).join('');
  if (window.lucide) lucide.createIcons();
}

/**
 * Generates HTML for a single member card.
 */
function buildMemberCardHtml(m) {
  const badgeClasses = {
    available: 'badge-available',
    busy: 'badge-busy',
    away: 'badge-away',
    offline: 'badge-offline',
  };

  const dotClasses = {
    available: 'dot-pulse-available',
    busy: 'dot-pulse-busy',
    away: 'dot-pulse-away',
    offline: 'dot-pulse-offline',
  };

  return `
    <div id="card-${m.id}" class="member-card bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
      <div>
        <!-- Top bar: Department + Visual Status Badge -->
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">${m.department}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${badgeClasses[m.status]}">
            <span class="w-2 h-2 rounded-full ${dotClasses[m.status]}"></span>
            ${m.status}
          </span>
        </div>

        <!-- Identity & Role -->
        <div class="flex items-center gap-3.5 mb-3.5">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow flex-shrink-0" style="background-color: ${m.avatarColor || '#4f46e5'};">
            ${m.initials}
          </div>
          <div class="overflow-hidden">
            <h3 class="font-bold text-sm text-white truncate">${m.name}</h3>
            <p class="text-xs text-slate-400 truncate">${m.role}</p>
            <p class="text-[11px] text-slate-500 truncate mt-0.5">${m.email}</p>
          </div>
        </div>

        <!-- Status Note with live edit -->
        <div class="mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
          <span class="text-xs text-slate-300 italic truncate" id="note-text-${m.id}">
            "${m.note || 'No note set'}"
          </span>
          <button type="button" onclick="promptEditNote('${m.id}', '${m.status}', '${(m.note || '').replace(/'/g, "\\'")}')" class="text-slate-500 hover:text-indigo-400 p-1 flex-shrink-0" title="Edit status note">
            <i data-lucide="edit-2" class="w-3 h-3"></i>
          </button>
        </div>
      </div>

      <!-- Core Requirement: 4-State Interactive Status Toggle Buttons -->
      <div class="pt-3 border-t border-slate-800/80 space-y-1.5">
        <span class="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Quick Status Toggle</span>
        <div class="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button type="button" onclick="toggleStatus('${m.id}', 'available')" class="status-pill-btn text-[11px] font-bold py-1.5 rounded-lg border border-transparent ${m.status === 'available' ? 'active-available' : 'text-slate-400 hover:text-white'}">
            Available
          </button>
          <button type="button" onclick="toggleStatus('${m.id}', 'busy')" class="status-pill-btn text-[11px] font-bold py-1.5 rounded-lg border border-transparent ${m.status === 'busy' ? 'active-busy' : 'text-slate-400 hover:text-white'}">
            Busy
          </button>
          <button type="button" onclick="toggleStatus('${m.id}', 'away')" class="status-pill-btn text-[11px] font-bold py-1.5 rounded-lg border border-transparent ${m.status === 'away' ? 'active-away' : 'text-slate-400 hover:text-white'}">
            Away
          </button>
          <button type="button" onclick="toggleStatus('${m.id}', 'offline')" class="status-pill-btn text-[11px] font-bold py-1.5 rounded-lg border border-transparent ${m.status === 'offline' ? 'active-offline' : 'text-slate-400 hover:text-white'}">
            Offline
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Toggles a member's status asynchronously using PUT /api/members/:id/status
 */
window.toggleStatus = async function (memberId, newStatus) {
  try {
    const cardEl = document.getElementById(`card-${memberId}`);
    if (cardEl) {
      cardEl.classList.add('animate-status-update');
      setTimeout(() => cardEl.classList.remove('animate-status-update'), 600);
    }

    const res = await fetch(`/api/members/${memberId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();
    if (data.success) {
      const idx = state.members.findIndex((m) => m.id === memberId);
      if (idx !== -1) {
        state.members[idx] = data.member;
        updateMemberCardUI(data.member);
      }
      loadStats();
    } else {
      showToast(data.message || 'Status update failed', 'error');
    }
  } catch (err) {
    console.error('Error toggling status:', err);
    showToast('Failed to reach server', 'error');
  }
};

/**
 * Allows user to edit the custom status note.
 */
window.promptEditNote = async function (memberId, currentStatus, currentNote) {
  const newNote = prompt('Enter updated status note (e.g. "Lunch break", "In meeting"):', currentNote);
  if (newNote === null) return;

  try {
    const res = await fetch(`/api/members/${memberId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: currentStatus, note: newNote }),
    });

    const data = await res.json();
    if (data.success) {
      const idx = state.members.findIndex((m) => m.id === memberId);
      if (idx !== -1) {
        state.members[idx] = data.member;
        updateMemberCardUI(data.member);
      }
      showToast('Status note updated!', 'success');
    }
  } catch (err) {
    console.error('Error updating note:', err);
  }
};

/**
 * Updates an individual member card in the DOM without full re-render.
 */
function updateMemberCardUI(m) {
  const cardEl = document.getElementById(`card-${m.id}`);
  if (!cardEl) return;

  const tempWrapper = document.createElement('div');
  tempWrapper.innerHTML = buildMemberCardHtml(m);
  const newCard = tempWrapper.firstElementChild;

  cardEl.replaceWith(newCard);
  if (window.lucide) lucide.createIcons();
}

/**
 * Handles adding new team member.
 */
async function handleAddMember(e) {
  e.preventDefault();

  const name = document.getElementById('add-name').value.trim();
  const role = document.getElementById('add-role').value.trim();
  const department = document.getElementById('add-dept').value;
  const note = document.getElementById('add-note').value.trim();

  try {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role, department, note, status: 'available' }),
    });

    const data = await res.json();
    if (data.success) {
      showToast(`Added ${name} to team!`, 'success');
      modalAdd.classList.add('hidden');
      formAdd.reset();
      loadMembers();
      loadStats();
    } else {
      showToast(data.message || 'Validation error', 'error');
    }
  } catch (err) {
    console.error('Error adding member:', err);
  }
}

/**
 * Opens Activity Audit Trail modal.
 */
async function openActivityModal() {
  modalActivity.classList.remove('hidden');
  activityLogList.innerHTML = `<div class="text-center py-6 text-slate-500">Loading audit trail...</div>`;

  try {
    const res = await fetch('/api/activity?limit=30');
    const data = await res.json();

    if (data.success && data.logs.length > 0) {
      activityLogList.innerHTML = data.logs
        .map((log) => {
          const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return `
            <div class="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
              <div>
                <span class="font-bold text-white">${log.memberName}</span>
                <div class="text-slate-400 mt-0.5">
                  <span class="text-slate-500">${log.oldStatus}</span> &rarr; <span class="font-semibold text-emerald-400">${log.newStatus}</span>
                  ${log.note ? `<span class="italic text-slate-500"> &bull; "${log.note}"</span>` : ''}
                </div>
              </div>
              <span class="text-[10px] text-slate-500 flex-shrink-0">${time}</span>
            </div>
          `;
        })
        .join('');
    } else {
      activityLogList.innerHTML = `<div class="text-center py-6 text-slate-500">No activity logged yet.</div>`;
    }
  } catch (err) {
    console.error('Error fetching activity:', err);
  }
}

/**
 * Toast notifications.
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');

  let bgClass = 'bg-slate-800 text-slate-100 border-slate-700';
  let iconName = 'info';

  if (type === 'success') {
    bgClass = 'bg-emerald-950/95 text-emerald-100 border-emerald-700 shadow-emerald-900/30';
    iconName = 'check-circle';
  } else if (type === 'error') {
    bgClass = 'bg-pink-950/95 text-pink-100 border-pink-700 shadow-pink-900/30';
    iconName = 'alert-triangle';
  } else if (type === 'info') {
    bgClass = 'bg-indigo-950/95 text-indigo-100 border-indigo-700 shadow-indigo-900/30';
    iconName = 'bell';
  }

  toast.className = `pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-center gap-2.5 text-xs font-semibold transition-all transform translate-y-2 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 flex-shrink-0"></i>
    <span class="flex-1">${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}
