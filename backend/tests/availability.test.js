import test from 'node:test';
import assert from 'node:assert/strict';
import {
  listMembers,
  getMember,
  createMemberHandler,
  updateMemberHandler,
  updateStatusHandler,
  deleteMemberHandler,
  getStatsHandler,
  getActivityHandler,
} from '../src/controllers/memberController.js';
import { resetStorage } from '../src/utils/storage.js';

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, val) {
      this.headers[name.toLowerCase()] = val;
      return this;
    },
    json(data) {
      this.headers['content-type'] = 'application/json';
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

test.beforeEach(() => {
  resetStorage();
});

// ==========================================
// 1. Stats & Health Checks
// ==========================================
test('Controller: getStatsHandler returns team availability metrics', () => {
  const res = createMockRes();
  getStatsHandler({}, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.total, 21);
  assert.ok(res.body.available >= 1);
  assert.ok(res.body.busy >= 1);
  assert.ok(res.body.away >= 1);
  assert.ok(res.body.offline >= 1);
  assert.ok(res.body.departments.length >= 5);
  assert.ok(typeof res.body.availabilityRate === 'number');
});

// ==========================================
// 2. Members Listing & Filtering
// ==========================================
test('Controller: listMembers returns all 21 pre-seeded members', () => {
  const res = createMockRes();
  listMembers({ query: {} }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.count, 21);
  assert.equal(res.body.members.length, 21);
});

test('Controller: listMembers filters by department', () => {
  const res = createMockRes();
  listMembers({ query: { department: 'Engineering' } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.count >= 5);
  assert.ok(res.body.members.every(m => m.department === 'Engineering'));
});

test('Controller: listMembers filters by status', () => {
  const res = createMockRes();
  listMembers({ query: { status: 'available' } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.members.every(m => m.status === 'available'));
});

test('Controller: listMembers searches by query string', () => {
  const res = createMockRes();
  listMembers({ query: { search: 'Arjun' } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.members.some(m => m.name.includes('Arjun')));
});

test('Controller: getMember retrieves single member by ID', () => {
  const res = createMockRes();
  getMember({ params: { id: 'mem_1' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.member.name, 'Arjun Sharma');
});

test('Controller: getMember returns 404 for non-existent ID', () => {
  const res = createMockRes();
  getMember({ params: { id: 'non_existent_id' } }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
});

// ==========================================
// 3. Status Toggling (Core Requirement)
// ==========================================
test('Controller: updateStatusHandler updates status to busy with note', () => {
  const res = createMockRes();
  updateStatusHandler({
    params: { id: 'mem_1' },
    body: { status: 'busy', note: 'In architecture review' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.member.status, 'busy');
  assert.equal(res.body.member.note, 'In architecture review');
  assert.equal(res.body.logEntry.oldStatus, 'available');
  assert.equal(res.body.logEntry.newStatus, 'busy');
});

test('Controller: updateStatusHandler updates status to away', () => {
  const res = createMockRes();
  updateStatusHandler({
    params: { id: 'mem_1' },
    body: { status: 'away', note: 'Coffee break' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.member.status, 'away');
});

test('Controller: updateStatusHandler updates status to available', () => {
  const res = createMockRes();
  updateStatusHandler({
    params: { id: 'mem_2' }, // Priya Nair is initially busy
    body: { status: 'available', note: 'Ready for reviews' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.member.status, 'available');
});

test('Controller: updateStatusHandler rejects invalid status with 400', () => {
  const res = createMockRes();
  updateStatusHandler({
    params: { id: 'mem_1' },
    body: { status: 'sleeping' },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.ok(res.body.message.includes('Status must be one of'));
});

// ==========================================
// 4. Team Member CRUD Operations
// ==========================================
test('Controller: createMemberHandler adds new member', () => {
  const res = createMockRes();
  createMemberHandler({
    body: {
      name: 'Kavya Reddy',
      role: 'Staff Cloud Architect',
      department: 'Engineering',
      status: 'available',
      note: 'Just joined the team',
    },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.member.name, 'Kavya Reddy');
  assert.equal(res.body.member.initials, 'KR');
});

test('Controller: createMemberHandler rejects empty name with 400', () => {
  const res = createMockRes();
  createMemberHandler({ body: { name: '' } }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
});

test('Controller: updateMemberHandler updates member details', () => {
  const res = createMockRes();
  updateMemberHandler({
    params: { id: 'mem_1' },
    body: { role: 'Principal Architect' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.member.role, 'Principal Architect');
});

test('Controller: deleteMemberHandler removes member', () => {
  const res = createMockRes();
  deleteMemberHandler({ params: { id: 'mem_1' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);

  // Subsequent fetch returns 404
  const verifyRes = createMockRes();
  getMember({ params: { id: 'mem_1' } }, verifyRes);
  assert.equal(verifyRes.statusCode, 404);
});

test('Controller: getActivityHandler returns audit logs', () => {
  const res = createMockRes();
  getActivityHandler({ query: { limit: 10 } }, res);

  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.logs));
  assert.ok(res.body.logs.length >= 1);
});
