import express from 'express';
import { getRooms, getMessages, markAsSeen } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/rooms', protect, getRooms);
router.get('/rooms/:id/messages', protect, getMessages);
router.put('/rooms/:id/seen', protect, markAsSeen);

export default router;
