import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get logged-in user's profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update logged-in user's profile (name, bio, profilePic, instagram, snapchat, university)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, bio, profilePic, instagram, snapchat, university, password, interests, goals, year } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (instagram !== undefined) user.instagram = instagram;
    if (snapchat !== undefined) user.snapchat = snapchat;
    if (university) user.university = university;
    if (interests !== undefined) user.interests = interests;
    if (goals !== undefined) user.goals = goals;
    if (year !== undefined) user.year = year;
    if (password) user.password = password; // pre-save hook will hash it

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      bio: updated.bio,
      university: updated.university,
      profilePic: updated.profilePic,
      instagram: updated.instagram,
      snapchat: updated.snapchat,
      interests: updated.interests,
      goals: updated.goals,
      year: updated.year,
      isPremium: updated.isPremium,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get another user's public profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
