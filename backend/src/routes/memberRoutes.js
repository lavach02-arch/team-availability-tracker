import express from 'express';
import {
  listMembers,
  getMember,
  createMemberHandler,
  updateMemberHandler,
  updateStatusHandler,
  deleteMemberHandler,
  getStatsHandler,
  getActivityHandler,
  streamHandler,
} from '../controllers/memberController.js';

const router = express.Router();

// Real-Time SSE Stream
router.get('/stream', streamHandler);

// Stats & Activity
router.get('/stats', getStatsHandler);
router.get('/activity', getActivityHandler);

// Team Members CRUD
router.get('/members', listMembers);
router.post('/members', createMemberHandler);
router.get('/members/:id', getMember);
router.put('/members/:id', updateMemberHandler);
router.delete('/members/:id', deleteMemberHandler);

// Core Status Toggle Endpoints (supports both PUT and PATCH)
router.put('/members/:id/status', updateStatusHandler);
router.patch('/members/:id/status', updateStatusHandler);

export default router;
