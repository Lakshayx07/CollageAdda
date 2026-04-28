import User from '../models/User.js';
import crypto from 'crypto';

// Whitelisted domains (examples)
const TRUSTED_DOMAINS = ['rishihood.edu.in', 'jgu.edu.in', 'du.ac.in', 'iitd.ac.in'];

const isTrustedDomain = (email) => {
  const domain = email.split('@')[1];
  return TRUSTED_DOMAINS.includes(domain) || domain.endsWith('.edu');
};

/**
 * @desc    Request Email Verification (Send OTP)
 * @route   POST /api/verify/request-email
 * @access  Private
 */
export const requestEmailVerification = async (req, res) => {
  const { collegeEmail } = req.body;

  if (!collegeEmail || !isTrustedDomain(collegeEmail)) {
    return res.status(400).json({ message: 'Invalid or non-college email domain.' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.verificationToken = otp;
    user.verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    user.collegeEmail = collegeEmail;
    
    await user.save();

    // In a real app, send email here
    console.log(`[VERIFICATION] OTP for ${collegeEmail}: ${otp}`);

    res.json({ message: 'Verification OTP sent to your college email!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/verify/confirm-email
 * @access  Private
 */
export const verifyOTP = async (req, res) => {
  const { otp } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.verificationToken !== otp || user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.verificationStatus = 'verified';
    user.verificationMethod = 'email';
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.json({ message: 'Student identity verified successfully! 🎓', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Request Manual Verification (ID Upload)
 * @route   POST /api/verify/request-manual
 * @access  Private
 */
export const requestManualVerification = async (req, res) => {
  const { idPhotoUrl } = req.body;

  if (!idPhotoUrl) {
    return res.status(400).json({ message: 'Student ID photo is required.' });
  }

  try {
    const user = await User.findById(req.user._id);
    user.verificationStatus = 'pending';
    user.verificationMethod = 'manual';
    user.idPhotoUrl = idPhotoUrl;

    await user.save();

    res.json({ message: 'Verification request submitted! Our team will review it shortly.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Admin: Approve/Reject Verification
 * @route   POST /api/verify/admin/decide
 * @access  Private (Admin only - simulated)
 */
export const adminDecision = async (req, res) => {
  const { userId, decision, notes } = req.body; // decision: 'verified' or 'rejected'

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.verificationStatus = decision;
    user.isVerified = decision === 'verified';
    user.adminNotes = notes || '';

    await user.save();

    res.json({ message: `User ${decision} successfully.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
