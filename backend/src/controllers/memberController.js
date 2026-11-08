import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  updateMemberStatus,
  deleteMember,
  getStats,
  getActivityLogs,
  VALID_STATUSES,
} from '../utils/storage.js';
import {
  registerStreamClient,
  broadcastEvent,
} from '../utils/broadcaster.js';

/**
 * Lists team members with optional filtering.
 * GET /api/members
 */
export function listMembers(req, res) {
  try {
    const { department, status, search } = req.query;
    const members = getAllMembers({ department, status, search });
    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (err) {
    console.error('Error fetching members:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching team members' });
  }
}

/**
 * Retrieves a single member by ID.
 * GET /api/members/:id
 */
export function getMember(req, res) {
  try {
    const { id } = req.params;
    const member = getMemberById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: `Member '${id}' not found` });
    }
    return res.status(200).json({ success: true, member });
  } catch (err) {
    console.error('Error fetching member:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Creates a new team member.
 * POST /api/members
 */
export function createMemberHandler(req, res) {
  try {
    const { name, role, department, email, status, note } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name is required (minimum 2 characters)' });
    }

    const member = createMember({ name, role, department, email, status, note });

    // Real-time broadcast
    broadcastEvent({ type: 'MEMBER_CREATED', member });

    return res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      member,
    });
  } catch (err) {
    console.error('Error creating member:', err);
    return res.status(500).json({ success: false, message: 'Server error creating member' });
  }
}

/**
 * Updates an existing team member profile.
 * PUT /api/members/:id
 */
export function updateMemberHandler(req, res) {
  try {
    const { id } = req.params;
    const updated = updateMember(id, req.body || {});
    if (!updated) {
      return res.status(404).json({ success: false, message: `Member '${id}' not found` });
    }

    // Real-time broadcast
    broadcastEvent({ type: 'MEMBER_UPDATED', member: updated });

    return res.status(200).json({
      success: true,
      message: 'Member updated successfully',
      member: updated,
    });
  } catch (err) {
    console.error('Error updating member:', err);
    return res.status(500).json({ success: false, message: 'Server error updating member' });
  }
}

/**
 * Core Status Toggle Endpoint.
 * PUT /api/members/:id/status or PATCH /api/members/:id/status
 */
export function updateStatusHandler(req, res) {
  try {
    const { id } = req.params;
    const { status, note, changedBy } = req.body || {};

    if (!status || !VALID_STATUSES.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const result = updateMemberStatus(id, status.toLowerCase(), note, changedBy || 'user');
    if (!result) {
      return res.status(404).json({ success: false, message: `Member '${id}' not found` });
    }

    // Broadcast live status update to all connected clients
    broadcastEvent({
      type: 'STATUS_UPDATED',
      member: result.member,
      logEntry: result.logEntry,
      stats: getStats(),
    });

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      member: result.member,
      logEntry: result.logEntry,
    });
  } catch (err) {
    console.error('Error toggling status:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
}

/**
 * Removes a member.
 * DELETE /api/members/:id
 */
export function deleteMemberHandler(req, res) {
  try {
    const { id } = req.params;
    const deleted = deleteMember(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Member '${id}' not found` });
    }

    // Real-time broadcast
    broadcastEvent({ type: 'MEMBER_DELETED', memberId: id });

    return res.status(200).json({
      success: true,
      message: 'Member removed from team',
      memberId: id,
    });
  } catch (err) {
    console.error('Error deleting member:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting member' });
  }
}

/**
 * Returns team analytics and availability stats.
 * GET /api/stats
 */
export function getStatsHandler(req, res) {
  try {
    const stats = getStats();
    return res.status(200).json({ success: true, ...stats });
  } catch (err) {
    console.error('Error computing stats:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Returns recent activity audit logs.
 * GET /api/activity
 */
export function getActivityHandler(req, res) {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const logs = getActivityLogs(limit);
    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('Error fetching activity logs:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

/**
 * Connects to SSE real-time stream.
 * GET /api/stream
 */
export function streamHandler(req, res) {
  registerStreamClient(req, res);
}
