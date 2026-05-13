import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ChatRoom from '../models/ChatRoom.js';

import { ensureUniversityGroup } from '../utils/universityUtils.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user OR sync an existing OAuth user
router.post('/register', async (req, res) => {
  const { name, email, password, university, referralCode: usedCode } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    
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
        await existingUser.save();
      }

      // Always ensure this user is in the correct university group
      await ensureUniversityGroup(existingUser);

      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate unique referral code (First name + random string)
    const genCode = `${name.split(' ')[0].toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

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
      name, 
      email, 
      password, 
      university: (university || '').trim(), 
      referralCode: genCode,
      referredBy,
      points: 50
    });

    await ensureUniversityGroup(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      referralCode: user.referralCode,
      points: user.points,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & return token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      await ensureUniversityGroup(user);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        isPremium: user.isPremium,
        profilePic: user.profilePic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
