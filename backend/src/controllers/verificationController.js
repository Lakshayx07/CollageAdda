import User from '../models/User.js';
import crypto from 'crypto';
import { isEmailAllowedForUniversity } from '../utils/emailDomain.js';

/**
 * @desc    Request Email Verification (Send OTP)
 * @route   POST /api/verify/request-email
 * @access  Private
 */
export const requestEmailVerification = async (req, res) => {
  const { collegeEmail } = req.body;

  if (!collegeEmail) {
    return res.status(400).json({ message: 'College email is required.' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const domainAllowed = await isEmailAllowedForUniversity(collegeEmail.trim().toLowerCase(), user.university);
    if (!domainAllowed) {
      return res.status(400).json({ message: 'Invalid or unrecognised college email domain for your university.' });
    }

    // Cryptographically random 6-digit OTP
    const otp = String(crypto.randomInt(100000, 999999));

    user.verificationToken = otp;
    user.verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.collegeEmail = collegeEmail.trim().toLowerCase();

    await user.save();

    // TODO: send OTP via email provider (Resend / SendGrid / Nodemailer)
    // The OTP is intentionally NOT logged to stdout.

    res.json({ message: 'Verification OTP sent to your college email!' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred. Please try again.' });
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

    if (!user.verificationToken || user.verificationToken !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.verificationStatus = 'verified';
    user.verificationMethod = 'email';
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.json({
      message: 'Student identity verified successfully!',
      isVerified: true,
      verificationStatus: 'verified'
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred. Please try again.' });
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
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.verificationStatus = 'pending';
    user.verificationMethod = 'manual';
    user.idPhotoUrl = idPhotoUrl;

    await user.save();

    res.json({ message: 'Verification request submitted! Our team will review it shortly.' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
};

/**
 * @desc    Admin: Approve/Reject Verification
 * @route   POST /api/verify/admin/decide
 * @access  Admin only
 */
export const adminDecision = async (req, res) => {
  const { userId, decision, notes } = req.body;

  if (!['verified', 'rejected'].includes(decision)) {
    return res.status(400).json({ message: 'Decision must be "verified" or "rejected".' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.verificationStatus = decision;
    user.isVerified = decision === 'verified';
    user.adminNotes = notes || '';

    await user.save();

    res.json({
      message: `User ${decision} successfully.`,
      userId: user._id,
      verificationStatus: user.verificationStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
};
