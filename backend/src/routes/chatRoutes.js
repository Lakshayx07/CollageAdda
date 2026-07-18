import express from 'express';
import { getRooms, getMessages, markAsSeen, getOrCreatePrivateRoom, sendMessage, leaveRoom, addMember, updateMessage, deleteMessage, togglePinMessage, votePoll } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/rooms', protect, getRooms);
router.post('/rooms', protect, getOrCreatePrivateRoom);
router.get('/rooms/:id/messages', protect, getMessages);
router.post('/rooms/:id/messages', protect, sendMessage);
router.put('/rooms/:id/messages/:messageId', protect, updateMessage);
router.delete('/rooms/:id/messages/:messageId', protect, deleteMessage);
router.put('/rooms/:id/messages/:messageId/pin', protect, togglePinMessage);
router.put('/rooms/:id/messages/:messageId/poll', protect, votePoll);
router.put('/rooms/:id/seen', protect, markAsSeen);
router.put('/rooms/:id/leave', protect, leaveRoom);
router.put('/rooms/:id/add', protect, addMember);

export default router;
