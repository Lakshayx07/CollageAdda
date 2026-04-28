import express from 'express';
import { 
  requestEmailVerification, 
  verifyOTP, 
  requestManualVerification,
  adminDecision
} from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request-email', protect, requestEmailVerification);
router.post('/confirm-email', protect, verifyOTP);
router.post('/request-manual', protect, requestManualVerification);

// Admin only (In a real app, add admin middleware)
router.post('/admin/decide', protect, adminDecision);

export default router;
