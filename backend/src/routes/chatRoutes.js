import express from 'express';
import { getRooms, getMessages, markAsSeen, getOrCreatePrivateRoom } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/rooms', protect, getRooms);
router.post('/rooms', protect, getOrCreatePrivateRoom);
router.get('/rooms/:id/messages', protect, getMessages);
router.put('/rooms/:id/seen', protect, markAsSeen);

export default router;
