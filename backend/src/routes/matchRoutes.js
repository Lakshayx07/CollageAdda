import express from 'express';
import { getMatches, connectUser, skipUser } from '../controllers/matchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMatches);
router.post('/connect/:id', protect, connectUser);
router.post('/skip/:id', protect, skipUser);

export default router;
