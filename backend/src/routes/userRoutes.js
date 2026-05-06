import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/users/leaderboard
// @desc    Get university leaderboard (ranked by verified users)
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      { $match: { isVerified: true } },
      { $group: { _id: '$university', verifiedCount: { $sum: 1 } } },
      { $sort: { verifiedCount: -1 } },
      { $limit: 10 }
    ]);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

// @route   GET /api/users/search
// @desc    Search users by name or university
router.get('/search/query', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { university: { $regex: q, $options: 'i' } }
      ]
    }).select('-password').limit(20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/me/followers
// @desc    Get logged-in user's followers
router.get('/me/followers', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('followers', 'name university profilePic _id');
    res.json(user.followers || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/me/following
// @desc    Get logged-in user's following list
router.get('/me/following', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('following', 'name university profilePic _id');
    res.json(user.following || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/:id/follow
// @desc    Follow / unfollow a user (toggle)
router.put('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const isFollowing = currentUser.following.includes(req.params.id);
    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user._id.toString());
    } else {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user._id);
    }
    await currentUser.save();
    await targetUser.save();
    res.json({ following: !isFollowing, followersCount: targetUser.followers.length });
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
