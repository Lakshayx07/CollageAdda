import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ChatRoom from '../models/ChatRoom.js';

import { ensureUniversityGroup, normalizeUniversityName } from '../utils/universityUtils.js';
import { publicUserPayload } from '../utils/verificationUtils.js';
import { isEmailAllowedForUniversity } from '../utils/emailDomain.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const mongoObjectIdToUuid = (id) => {
  const hex = `${id.toString()}00000000`;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

// @route   GET /api/auth/supabase-token
// @desc    Exchange the app JWT for a short-lived JWT Supabase can use in RLS auth.uid()
router.get('/supabase-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('email name');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!process.env.SUPABASE_JWT_SECRET) {
      return res.status(500).json({ message: 'SUPABASE_JWT_SECRET is not configured' });
    }

    const supabaseUserId = mongoObjectIdToUuid(user._id);
    const accessToken = jwt.sign(
      {
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        sub: supabaseUserId,
        email: user.email,
        role: 'authenticated',
      },
      process.env.SUPABASE_JWT_SECRET
    );

    res.json({
      accessToken,
      user: {
        id: supabaseUserId,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(401).json({ message: error.message || 'Could not create Supabase session' });
  }
});

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
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const normalizedUniversity = normalizeUniversityName(university);

    // Enforce campus email domain
    const domainAllowed = await isEmailAllowedForUniversity(normalizedEmail, normalizedUniversity);
    if (!domainAllowed) {
      return res.status(403).json({
        message: `Please use your ${normalizedUniversity} college email address to sign up. Personal emails (Gmail, etc.) are not accepted.`
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      const reqUniversity = normalizedUniversity;
      if (reqUniversity && reqUniversity !== 'Other') {
        if (!existingUser.university || existingUser.university === 'Other') {
          existingUser.university = reqUniversity;
          await existingUser.save();
        } else if (existingUser.university !== reqUniversity) {
          return res.status(403).json({ message: `Email already registered with ${existingUser.university}. 1 mail - 1 campus.` });
        }
      }

      await ensureUniversityGroup(existingUser);
      return res.status(400).json({ message: 'User already exists' });
    }

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
      university: normalizedUniversity,
      referralCode: genCode,
      referredBy,
      points: 50,
      streak: 1,
      lastLoginDate: new Date(),
      // Campus email verified at registration
      isVerified: true,
      verificationStatus: 'verified',
      verificationMethod: 'email'
    });

    await ensureUniversityGroup(user);

    res.status(201).json(publicUserPayload(user, generateToken(user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & return token
router.post('/login', async (req, res) => {
  const { email, password, university } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        // Detect if this account was created via Google Auth
        if (user.profilePic && user.profilePic.includes('googleusercontent.com')) {
          return res.status(401).json({ message: 'This email is linked to a Google account. Please use "Continue with Google" to sign in.' });
        }
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const reqUniversity = normalizeUniversityName(university);
      if (reqUniversity && reqUniversity !== 'Other' && user.university && user.university !== 'Other' && user.university !== reqUniversity) {
        return res.status(403).json({ message: `Email already registered with ${user.university}. 1 mail - 1 campus.` });
      }

      // Update login streak — compare in IST (UTC+5:30)
      const toISTDateString = (d) => {
        const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
        return ist.toISOString().slice(0, 10);
      };
      const now = new Date();
      const todayIST = toISTDateString(now);
      if (!user.lastLoginDate) {
        user.streak = 1;
        user.lastLoginDate = now;
      } else {
        const lastIST = toISTDateString(new Date(user.lastLoginDate));
        if (lastIST !== todayIST) {
          const lastDate = new Date(lastIST);
          const todayDate = new Date(todayIST);
          const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            user.streak = (user.streak || 0) + 1;
          } else if (diffDays > 1) {
            user.streak = 1; // Reset streak if they missed a day
          }
          user.lastLoginDate = now;
        }
      }
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
  const { credential, access_token, university, referralCode } = req.body;
  try {
    let email, name, sub, picture;

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      ({ email, name, sub, picture } = payload);
    } else if (access_token) {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }
      const data = await response.json();
      ({ email, name, sub, picture } = data);
    } else {
      return res.status(400).json({ message: 'Google credential missing' });
    }

    email = email?.trim().toLowerCase();
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (user) {
      // Login existing Google user
      const reqUniversity = normalizeUniversityName(university);
      if (reqUniversity && reqUniversity !== 'Other') {
        if (!user.university || user.university === 'Other') {
          user.university = reqUniversity;
        } else if (user.university !== reqUniversity) {
          return res.status(403).json({ message: `Email already registered with ${user.university}. 1 mail - 1 campus.` });
        }
      }

      const toISTDateString = (d) => {
        const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
        return ist.toISOString().slice(0, 10);
      };
      const now = new Date();
      const todayIST = toISTDateString(now);
      if (!user.lastLoginDate) {
        user.streak = 1;
        user.lastLoginDate = now;
      } else {
        const lastIST = toISTDateString(new Date(user.lastLoginDate));
        if (lastIST !== todayIST) {
          const lastDate = new Date(lastIST);
          const todayDate = new Date(todayIST);
          const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            user.streak = (user.streak || 0) + 1;
          } else if (diffDays > 1) {
            user.streak = 1; // Reset streak if they missed a day
          }
          user.lastLoginDate = now;
        }
      }
      await user.save();
      await ensureUniversityGroup(user);
    } else {
      // Register new Google user
      if (!university) {
        return res.status(400).json({ message: 'University is required for registration' });
      }

      const normalizedUniversity = normalizeUniversityName(university);

      // Enforce campus email domain before creating account
      const domainAllowed = await isEmailAllowedForUniversity(email, normalizedUniversity);
      if (!domainAllowed) {
        return res.status(403).json({
          message: `Please use your ${normalizedUniversity} Google Workspace (college) account. Personal Gmail accounts are not accepted.`
        });
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

      user = await User.create({
        name,
        email,
        password: sub,
        university: normalizedUniversity,
        referralCode: genCode,
        referredBy,
        points: 50,
        profilePic: picture,
        streak: 1,
        lastLoginDate: new Date(),
        // Campus email verified at registration via Google
        isVerified: true,
        verificationStatus: 'verified',
        verificationMethod: 'email'
      });
      isNewUser = true;
      await ensureUniversityGroup(user);
    }

    res.status(isNewUser ? 201 : 200).json(publicUserPayload(user, generateToken(user._id)));
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Failed to authenticate with Google' });
  }
});

export default router;
