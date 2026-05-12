import express from 'express';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
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

    const { name, bio, profilePic, instagram, snapchat, university, password, interests, goals, sports, year } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (instagram !== undefined) user.instagram = instagram;
    if (snapchat !== undefined) user.snapchat = snapchat;
    if (university) user.university = university;
    if (interests !== undefined) user.interests = interests;
    if (goals !== undefined) user.goals = goals;
    if (sports !== undefined) user.sports = sports;
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
      sports: updated.sports,
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
    let query = { _id: { $ne: req.user._id } };
    
    if (q) {
      const cleanQuery = q.replace(/^#/, '');
      const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedQuery, $options: 'i' } },
        { university: { $regex: escapedQuery, $options: 'i' } },
        { interests: { $regex: escapedQuery, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).limit(20);
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

// @route   GET /api/users/me/followers/new
// @desc    Get new followers since a given timestamp (for notifications)
router.get('/me/followers/new', protect, async (req, res) => {
  try {
    const since = req.query.since ? new Date(Number(req.query.since)) : new Date(0);
    // Populate followers with their joinedAt / updatedAt so we can filter
    const user = await User.findById(req.user._id).populate('followers', 'name university profilePic _id createdAt');
    
    // Return all followers if no since param, otherwise filter by createdAt after 'since'
    const allFollowers = user.followers || [];
    const newFollowers = req.query.since
      ? allFollowers.filter(f => f.createdAt && new Date(f.createdAt) > since)
      : allFollowers;

    res.json(newFollowers);
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

// @route   GET /api/users/:id/university-connections
// @desc    Get counts of connections (following) grouped by university
router.get('/:id/university-connections', protect, async (req, res) => {
  try {
    // If id is 'me', use req.user._id
    const userId = req.params.id === 'me' ? req.user._id : req.params.id;
    const user = await User.findById(userId).populate('following', 'university');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const counts = {};
    if (user.following && user.following.length > 0) {
      user.following.forEach(f => {
        if (f.university) {
          counts[f.university] = (counts[f.university] || 0) + 1;
        }
      });
    }

    const result = Object.entries(counts)
      .map(([university, count]) => ({ university, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    res.json(result);
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

    // Notification for follow
    if (!isFollowing) {
      await Notification.create({
        recipient: targetUser._id,
        sender: req.user._id,
        type: 'follow',
        text: 'started following you'
      });
    }

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
