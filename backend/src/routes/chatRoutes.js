import express from 'express';
import { getRooms, getMessages, markAsSeen, getOrCreatePrivateRoom, sendMessage, leaveRoom, addMember } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/rooms', protect, getRooms);
router.post('/rooms', protect, getOrCreatePrivateRoom);
router.get('/rooms/:id/messages', protect, getMessages);
router.post('/rooms/:id/messages', protect, sendMessage);
router.put('/rooms/:id/seen', protect, markAsSeen);
router.put('/rooms/:id/leave', protect, leaveRoom);
router.put('/rooms/:id/add', protect, addMember);

export default router;
