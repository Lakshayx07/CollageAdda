import express from 'express';
import College from '../models/College.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/authMiddleware.js';
import { slimPost } from '../utils/postSerialize.js';

const router = express.Router();

// Helper: build regex pattern for a college name (used for in-memory list counts)
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

/** Exact university strings for indexed $in queries (detail page). */
function getUniversityNameVariants(name) {
  const fullName = (name || '').trim();
  const names = new Set();
  if (!fullName) return [];

  names.add(fullName);
  const baseName = fullName.split(',')[0].trim();
  if (baseName) names.add(baseName);

  const withoutParens = fullName.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  if (withoutParens) names.add(withoutParens);

  const acronymMatch = fullName.match(/\(([^)]+)\)/);
  if (acronymMatch?.[1]) {
    names.add(acronymMatch[1].trim());
  }

  // Rishihood users may store historical name variants
  if (/rishihood/i.test(fullName)) {
    names.add('Rishihood University');
    names.add('Rishihood University Sonipat');
  }

  return [...names];
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

/** Use avatar API URL instead of embedding huge base64 profilePic blobs. */
function withAvatarUrl(user) {
  if (!user) return user;
  const id = user._id || user.id;
  return {
    ...user,
    profilePic: id ? `/api/users/${id}/avatar` : '',
  };
}

// @route   GET /api/colleges/:id/students
// @desc    Students for a college (lazy-loaded — keeps posts tab fast)
router.get('/:id/students', protect, async (req, res) => {
  try {
    const college = await College.findById(req.params.id).select('name');
    if (!college) return res.status(404).json({ message: 'College not found' });

    const universityFilter = {
      university: { $in: getUniversityNameVariants(college.name) },
    };

    // Do NOT select profilePic — base64 blobs make this query multi-second
    const [students, realStudentCount] = await Promise.all([
      User.find(universityFilter)
        .select('name bio university interests year studyYear isVerified createdAt')
        .sort({ createdAt: -1 })
        .limit(40)
        .lean(),
      User.countDocuments(universityFilter),
    ]);

    res.json({
      studentsData: students.map(withAvatarUrl),
      realStudentCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/colleges/:id
// @desc    Get college details + recent posts (students loaded separately)
router.get('/:id', protect, async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    const universityNames = getUniversityNameVariants(college.name);
    const universityFilter = { university: { $in: universityNames } };

    // Posts tab must not wait on heavy student documents.
    // Slim posts like the home feed so base64 media is not embedded in JSON.
    const [posts, realStudentCount, realPostCount] = await Promise.all([
      Post.find(universityFilter)
        .select('content mediaUrl mediaType likes comments hashtags createdAt author university isMemoryOnly')
        .populate('author', 'name university isVerified xp points currentTick')
        .populate('comments.user', 'name isVerified')
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      User.countDocuments(universityFilter),
      Post.countDocuments(universityFilter),
    ]);

    const postsData = posts.map((post) => slimPost(post, req.user._id));

    res.json({
      ...college.toObject(),
      studentsData: [],
      postsData,
      realStudentCount,
      realPostCount,
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
