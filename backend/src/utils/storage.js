import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Vercel serverless, root filesystem is read-only except /tmp
const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'team-tracker-data')
  : path.resolve(__dirname, '../../data');

const DB_FILE = path.join(DATA_DIR, 'team.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const VALID_STATUSES = ['available', 'busy', 'away', 'offline'];

export const AVATAR_COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#ea580c',
  '#059669', '#0891b2', '#2563eb', '#d97706',
];

/**
 * Extracts 1-2 uppercase initials from a name.
 */
export function extractInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TM';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * 21 Pre-seeded realistic team members.
 */
export function getSeedMembers() {
  const now = new Date();

  const rawMembers = [
    // Engineering
    { name: 'Arjun Sharma', role: 'Senior Backend Engineer', department: 'Engineering', email: 'arjun.sharma@team.dev', status: 'available', note: 'Reviewing PRs & available on Slack' },
    { name: 'Priya Nair', role: 'Frontend Developer', department: 'Engineering', email: 'priya.nair@team.dev', status: 'busy', note: 'In component sprint - DND' },
    { name: 'Rohit Verma', role: 'DevOps & SRE', department: 'Engineering', email: 'rohit.verma@team.dev', status: 'away', note: 'Lunch break, back by 1:30 PM' },
    { name: 'Sneha Kapoor', role: 'Full Stack Developer', department: 'Engineering', email: 'sneha.kapoor@team.dev', status: 'available', note: 'Working on API integrations' },
    { name: 'Karan Mehta', role: 'QA & Automation', department: 'Engineering', email: 'karan.mehta@team.dev', status: 'offline', note: 'Out of office today' },
    { name: 'Aisha Khan', role: 'Mobile App Lead', department: 'Engineering', email: 'aisha.khan@team.dev', status: 'available', note: 'Pair programming open' },

    // Design
    { name: 'Ravi Patel', role: 'UI/UX Design Lead', department: 'Design', email: 'ravi.patel@team.dev', status: 'available', note: 'Figma review session' },
    { name: 'Meera Joshi', role: 'Product Designer', department: 'Design', email: 'meera.joshi@team.dev', status: 'busy', note: 'Design sprint workshop' },
    { name: 'Dev Anand', role: 'Design Systems Lead', department: 'Design', email: 'dev.anand@team.dev', status: 'offline', note: 'On planned leave' },

    // Product
    { name: 'Nisha Singh', role: 'Principal Product Manager', department: 'Product', email: 'nisha.singh@team.dev', status: 'busy', note: 'Customer interview call' },
    { name: 'Amit Gupta', role: 'Technical Product Manager', department: 'Product', email: 'amit.gupta@team.dev', status: 'available', note: 'Sprint planning open' },
    { name: 'Pooja Reddy', role: 'Agile Delivery Lead', department: 'Product', email: 'pooja.reddy@team.dev', status: 'away', note: 'Stepped away for 20m' },

    // Marketing & Growth
    { name: 'Suresh Kumar', role: 'Head of Growth', department: 'Marketing', email: 'suresh.kumar@team.dev', status: 'available', note: 'Q4 analytics review' },
    { name: 'Anjali Desai', role: 'Technical Content Lead', department: 'Marketing', email: 'anjali.desai@team.dev', status: 'offline', note: 'Traveling' },

    // Operations & HR
    { name: 'Vikram Rao', role: 'People Operations Lead', department: 'Operations', email: 'vikram.rao@team.dev', status: 'available', note: 'HR office hours' },
    { name: 'Deepa Iyer', role: 'IT & Security Admin', department: 'Operations', email: 'deepa.iyer@team.dev', status: 'away', note: 'Server maintenance window' },

    // Data & AI
    { name: 'Rahul Bose', role: 'Lead Data Scientist', department: 'Data & AI', email: 'rahul.bose@team.dev', status: 'busy', note: 'Training LLM benchmark models' },
    { name: 'Kavya Pillai', role: 'Machine Learning Engineer', department: 'Data & AI', email: 'kavya.pillai@team.dev', status: 'available', note: 'Ready for feature requests' },
    { name: 'Sanjay Ghosh', role: 'BI & Analytics Engineer', department: 'Data & AI', email: 'sanjay.ghosh@team.dev', status: 'available', note: 'Building executive dashboards' },
    { name: 'Lata Krishnan', role: 'VP of Technology', department: 'Management', email: 'lata.krishnan@team.dev', status: 'busy', note: 'Executive sync' },
    { name: 'Mohan Das', role: 'Engineering Director', department: 'Management', email: 'mohan.das@team.dev', status: 'available', note: '1-on-1s open' },
  ];

  const members = rawMembers.map((m, idx) => {
    const id = `mem_${idx + 1}`;
    const initials = extractInitials(m.name);
    const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
    const minutesAgo = (idx * 17) % 360;
    const lastSeen = new Date(now.getTime() - minutesAgo * 60000).toISOString();

    return {
      id,
      name: m.name,
      role: m.role,
      department: m.department,
      email: m.email,
      avatarColor,
      initials,
      status: m.status,
      note: m.note,
      lastSeen,
      createdAt: new Date(now.getTime() - 86400000 * 30).toISOString(),
    };
  });

  const logs = [
    {
      id: 'log_seed_1',
      memberId: 'mem_1',
      memberName: 'Arjun Sharma',
      oldStatus: 'away',
      newStatus: 'available',
      note: 'Back from lunch, reviewing PRs',
      changedBy: 'user',
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
    },
    {
      id: 'log_seed_2',
      memberId: 'mem_2',
      memberName: 'Priya Nair',
      oldStatus: 'available',
      newStatus: 'busy',
      note: 'In component sprint - DND',
      changedBy: 'user',
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
    },
    {
      id: 'log_seed_3',
      memberId: 'mem_17',
      memberName: 'Rahul Bose',
      oldStatus: 'available',
      newStatus: 'busy',
      note: 'Training LLM benchmark models',
      changedBy: 'user',
      timestamp: new Date(now.getTime() - 75 * 60000).toISOString(),
    },
  ];

  return { members, logs };
}

/**
 * Loads database from disk, seeding if not present.
 */
export function loadDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getSeedMembers();
      saveDatabase(initial);
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.members)) {
      const initial = getSeedMembers();
      saveDatabase(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load DB, resetting to seeds:', err.message);
    const initial = getSeedMembers();
    saveDatabase(initial);
    return initial;
  }
}

/**
 * Saves database atomically.
 */
export function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err.message);
  }
}

/**
 * Returns filtered list of team members.
 */
export function getAllMembers({ department = '', status = '', search = '' } = {}) {
  const db = loadDatabase();
  let list = db.members;

  if (department && department !== 'All') {
    list = list.filter(m => m.department.toLowerCase() === department.toLowerCase());
  }

  if (status && status !== 'all') {
    list = list.filter(m => m.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      (m.note && m.note.toLowerCase().includes(q)) ||
      m.email.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Retrieves a single member by ID.
 */
export function getMemberById(id) {
  const db = loadDatabase();
  return db.members.find(m => m.id === id) || null;
}

/**
 * Creates a new team member.
 */
export function createMember(raw = {}) {
  const db = loadDatabase();
  const id = `mem_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
  const now = new Date().toISOString();
  const name = (raw.name || 'New Member').trim();
  const initials = extractInitials(name);
  const avatarColor = raw.avatarColor || AVATAR_COLORS[db.members.length % AVATAR_COLORS.length];
  const status = VALID_STATUSES.includes(raw.status) ? raw.status : 'available';

  const member = {
    id,
    name,
    role: (raw.role || 'Team Member').trim(),
    department: (raw.department || 'Engineering').trim(),
    email: (raw.email || `${name.toLowerCase().replace(/\s+/g, '.')}@team.dev`).trim(),
    avatarColor,
    initials,
    status,
    note: (raw.note || '').trim(),
    lastSeen: now,
    createdAt: now,
  };

  db.members.unshift(member);

  // Add log
  db.logs.unshift({
    id: `log_${Date.now()}`,
    memberId: member.id,
    memberName: member.name,
    oldStatus: 'none',
    newStatus: member.status,
    note: member.note || 'Joined the team',
    changedBy: 'admin',
    timestamp: now,
  });

  saveDatabase(db);
  return member;
}

/**
 * Updates an existing team member profile.
 */
export function updateMember(id, updates = {}) {
  const db = loadDatabase();
  const idx = db.members.findIndex(m => m.id === id);
  if (idx === -1) return null;

  const current = db.members[idx];
  const name = updates.name !== undefined ? updates.name.trim() : current.name;

  const merged = {
    ...current,
    ...updates,
    name,
    role: updates.role !== undefined ? updates.role.trim() : current.role,
    department: updates.department !== undefined ? updates.department.trim() : current.department,
    email: updates.email !== undefined ? updates.email.trim() : current.email,
    initials: extractInitials(name),
  };

  db.members[idx] = merged;
  saveDatabase(db);
  return merged;
}

/**
 * Toggles or updates status of a team member and appends to audit log.
 */
export function updateMemberStatus(id, newStatus, note = '', changedBy = 'user') {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status '${newStatus}'. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const db = loadDatabase();
  const idx = db.members.findIndex(m => m.id === id);
  if (idx === -1) return null;

  const member = db.members[idx];
  const oldStatus = member.status;
  const now = new Date().toISOString();

  member.status = newStatus;
  if (note !== undefined) {
    member.note = (note || '').trim();
  }
  member.lastSeen = now;

  // Add audit log entry
  const logEntry = {
    id: `log_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
    memberId: member.id,
    memberName: member.name,
    oldStatus,
    newStatus,
    note: member.note,
    changedBy,
    timestamp: now,
  };

  db.logs.unshift(logEntry);
  if (db.logs.length > 100) {
    db.logs = db.logs.slice(0, 100); // Keep latest 100 logs
  }

  saveDatabase(db);
  return { member, logEntry };
}

/**
 * Removes a member.
 */
export function deleteMember(id) {
  const db = loadDatabase();
  const idx = db.members.findIndex(m => m.id === id);
  if (idx === -1) return false;

  const member = db.members[idx];
  db.members.splice(idx, 1);

  db.logs.unshift({
    id: `log_${Date.now()}`,
    memberId: id,
    memberName: member.name,
    oldStatus: member.status,
    newStatus: 'removed',
    note: 'Member removed from team',
    changedBy: 'admin',
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
  return true;
}

/**
 * Computes live team analytics and stats.
 */
export function getStats() {
  const db = loadDatabase();
  const members = db.members;
  const total = members.length;

  const available = members.filter(m => m.status === 'available').length;
  const busy = members.filter(m => m.status === 'busy').length;
  const away = members.filter(m => m.status === 'away').length;
  const offline = members.filter(m => m.status === 'offline').length;

  const availabilityRate = total > 0 ? Math.round((available / total) * 100) : 0;

  // Department counts
  const deptMap = {};
  for (const m of members) {
    deptMap[m.department] = (deptMap[m.department] || 0) + 1;
  }
  const departments = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

  return {
    total,
    available,
    busy,
    away,
    offline,
    availabilityRate,
    departments,
    totalLogs: db.logs.length,
  };
}

/**
 * Returns latest audit logs.
 */
export function getActivityLogs(limit = 30) {
  const db = loadDatabase();
  return db.logs.slice(0, limit);
}

/**
 * Resets database back to seeds.
 */
export function resetStorage() {
  const initial = getSeedMembers();
  saveDatabase(initial);
  return initial;
}
