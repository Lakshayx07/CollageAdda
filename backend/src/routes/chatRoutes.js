import express from 'express';
import { getRooms, getMessages, markAsSeen, getOrCreatePrivateRoom, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/rooms', protect, getRooms);
router.post('/rooms', protect, getOrCreatePrivateRoom);
router.get('/rooms/:id/messages', protect, getMessages);
router.post('/rooms/:id/messages', protect, sendMessage);
router.put('/rooms/:id/seen', protect, markAsSeen);

export default router;
