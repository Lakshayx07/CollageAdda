import express from 'express';
import { getConfessions, createConfession, toggleLike, addComment, reportConfession, getPrompts } from '../controllers/confessionController.js';
import { protect, verified } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/confessions/prompts - rotating daily prompts
router.get('/prompts', protect, getPrompts);

// GET /api/confessions?scope=local|global
router.get('/', protect, getConfessions);

// POST /api/confessions - requires verified student status
router.post('/', protect, verified, createConfession);

// PUT /api/confessions/:id/like
router.put('/:id/like', protect, toggleLike);

// POST /api/confessions/:id/comment
router.post('/:id/comment', protect, addComment);

// POST /api/confessions/:id/report
router.post('/:id/report', protect, reportConfession);

export default router;
