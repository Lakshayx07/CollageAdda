import express from 'express';
import {
  requestEmailVerification,
  verifyOTP,
  requestManualVerification,
  adminDecision
} from '../controllers/verificationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request-email', protect, requestEmailVerification);
router.post('/confirm-email', protect, verifyOTP);
router.post('/request-manual', protect, requestManualVerification);

// Admin only — requires isAdmin: true on the user document
router.post('/admin/decide', protect, adminOnly, adminDecision);

export default router;
