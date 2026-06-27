import express from 'express';
import College from '../models/College.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: build regex pattern for a college name
function buildCollegePattern(name) {
  const fullName = name.trim();
  const baseName = fullName.split(',')[0].trim();
  const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedFullName = fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const acronymMatch = fullName.match(/\(([^)]+)\)/);
  let searchPattern = `(${escapedBaseName})|(${escapedFullName})`;
  if (acronymMatch && acronymMatch[1]) {
    const escapedAcronym = acronymMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    searchPattern += `|(${escapedAcronym})`;
  }
  return new RegExp(searchPattern, 'i');
}

// @route   GET /api/colleges/public
// @desc    Get all colleges (public, for login/register)
router.get('/public', async (req, res) => {
  try {
    const colleges = await College.find({}).select('name');
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/colleges
// @desc    Get all colleges with real student/post/follower counts
router.get('/', protect, async (req, res) => {
  try {
    const colleges = await College.find({});

    // 1. Get all counts grouped by university string in one DB call
    const userAgg = await User.aggregate([
      { $group: { _id: "$university", count: { $sum: 1 } } }
    ]);
    const postAgg = await Post.aggregate([
      { $group: { _id: "$university", count: { $sum: 1 } } }
    ]);

    // 2. Put aggregates in memory maps
    const userCountMap = new Map();
    userAgg.forEach(item => { if (item._id) userCountMap.set(item._id, item.count); });
    
    const postCountMap = new Map();
    postAgg.forEach(item => { if (item._id) postCountMap.set(item._id, item.count); });

    // 3. Match in memory instead of hitting DB N times
    const enriched = colleges.map(college => {
      const pattern = buildCollegePattern(college.name);
      
      let studentCount = 0;
      for (const [uni, count] of userCountMap.entries()) {
        if (pattern.test(uni)) studentCount += count;
      }

      let postCount = 0;
      for (const [uni, count] of postCountMap.entries()) {
        if (pattern.test(uni)) postCount += count;
      }

      return {
        ...college.toObject(),
        realStudentCount: studentCount,
        realPostCount: postCount,
        followersCount: college.followers ? college.followers.length : 0,
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/colleges/:id
// @desc    Get college details by ID, including posts and students with real counts
router.get('/:id', protect, async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    const pattern = buildCollegePattern(college.name);

    const students = await User.find({
      university: { $regex: pattern }
    }).select('name profilePic bio university interests year studyYear isVerified createdAt').sort({ createdAt: -1 });

    const posts = await Post.find({
      university: { $regex: pattern }
    })
      .populate('author', 'name profilePic university isVerified')
      .sort({ createdAt: -1 });

    res.json({
      ...college.toObject(),
      studentsData: students,
      postsData: posts,
      realStudentCount: students.length,
      realPostCount: posts.length,
      followersCount: college.followers ? college.followers.length : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/colleges/:id/follow
// @desc    Toggle follow/unfollow a college
router.put('/:id/follow', protect, async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    const userId = req.user._id;
    const isFollowing = college.followers.some(f => f.toString() === userId.toString());

    if (isFollowing) {
      college.followers = college.followers.filter(f => f.toString() !== userId.toString());
    } else {
      college.followers.push(userId);
    }

    await college.save();

    res.json({
      following: !isFollowing,
      followersCount: college.followers.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
