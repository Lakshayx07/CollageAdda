import express from 'express';
import { getMatches, connectUser, skipUser } from '../controllers/matchController.js';
import { protect, verified } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, verified, getMatches);
router.post('/connect/:id', protect, verified, connectUser);
router.post('/skip/:id', protect, verified, skipUser);

export default router;
