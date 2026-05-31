import express from 'express';
import { getConfessions, createConfession, toggleLike, addComment } from '../controllers/confessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/confessions
router.get('/', protect, getConfessions);

// POST /api/confessions
router.post('/', protect, createConfession);

// PUT /api/confessions/:id/like
router.put('/:id/like', protect, toggleLike);

// POST /api/confessions/:id/comment
router.post('/:id/comment', protect, addComment);

export default router;
