import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ChatRoom from '../models/ChatRoom.js';

import { ensureUniversityGroup, normalizeUniversityName } from '../utils/universityUtils.js';
import { publicUserPayload, syncVerificationStatus } from '../utils/verificationUtils.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user OR sync an existing OAuth user
router.post('/register', async (req, res) => {
  const { name, email, password, university, referralCode: usedCode } = req.body;
  try {
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password || !university?.trim()) {
      return res.status(400).json({ message: 'Name, email, password and university are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    
    // If user already exists (e.g. Google OAuth re-registration), 
    // update university if it was missing/Other, then return success
    if (existingUser) {
      // Update university if the stored one is empty or "Other" and we have a better one
      const shouldUpdateUniversity = 
        university &&
        university !== 'Other' &&
        (!existingUser.university || existingUser.university === 'Other');
      
      if (shouldUpdateUniversity) {
        existingUser.university = university.trim();
        syncVerificationStatus(existingUser);
        await existingUser.save();
      }

      // Always ensure this user is in the correct university group
      await ensureUniversityGroup(existingUser);

      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate unique referral code (First name + random string)
    const genCode = `${normalizedName.split(' ')[0].toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    let referredBy = null;
    if (usedCode) {
      const inviter = await User.findOne({ referralCode: usedCode.toUpperCase() });
      if (inviter) {
        referredBy = inviter._id;
        inviter.points += 100;
        inviter.inviteCount += 1;
        await inviter.save();
      }
    }

    const user = await User.create({ 
      name: normalizedName,
      email: normalizedEmail,
      password, 
      university: normalizeUniversityName(university), 
      referralCode: genCode,
      referredBy,
      points: 50
    });
    syncVerificationStatus(user);
    await user.save();

    await ensureUniversityGroup(user);

    res.status(201).json(publicUserPayload(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & return token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (user && (await user.matchPassword(password))) {
      syncVerificationStatus(user);
      await user.save();
      await ensureUniversityGroup(user);
      res.json(publicUserPayload(user, generateToken(user._id)));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Login or register user via Google
router.post('/google', async (req, res) => {
  const { credential, university, referralCode } = req.body;
  try {
    if (!credential) {
      return res.status(400).json({ message: 'Google credential missing' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub, picture } = payload;

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (user) {
      // Login existing user
      if (university && university !== 'Other' && (!user.university || user.university === 'Other')) {
        user.university = university.trim();
      }
      syncVerificationStatus(user);
      await user.save();
      await ensureUniversityGroup(user);
    } else {
      // Register new user
      if (!university) {
        return res.status(400).json({ message: 'University is required for registration' });
      }

      const genCode = `${name.split(' ')[0].toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      let referredBy = null;
      if (referralCode) {
        const inviter = await User.findOne({ referralCode: referralCode.toUpperCase() });
        if (inviter) {
          referredBy = inviter._id;
          inviter.points += 100;
          inviter.inviteCount += 1;
          await inviter.save();
        }
      }

      // We use 'sub' as a dummy password for Google users since we don't need a real one
      user = await User.create({
        name,
        email,
        password: sub, // Dummy password
        university: normalizeUniversityName(university),
        referralCode: genCode,
        referredBy,
        points: 50,
        profilePic: picture
      });
      isNewUser = true;
      syncVerificationStatus(user);
      await user.save();
      await ensureUniversityGroup(user);
    }

    res.status(isNewUser ? 201 : 200).json(publicUserPayload(user, generateToken(user._id)));
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: 'Failed to authenticate with Google' });
  }
});

export default router;
