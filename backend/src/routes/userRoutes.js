import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import College from '../models/College.js';
import Notification from '../models/Notification.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/authMiddleware.js';
import { ensureUniversityGroup, normalizeUniversityName } from '../utils/universityUtils.js';
import { publicUserPayload, syncVerificationStatus } from '../utils/verificationUtils.js';

const isDefaultAvatarAsset = (src = '') => String(src).toLowerCase().includes('/default-avatars/');

const hasCustomProfilePic = (src = '') => {
  return Boolean(src) && !isGeneratedInitialsAvatar(src) && !isDefaultAvatarAsset(src);
};

// Convert custom profilePic to avatar API URL to drastically reduce payload size
export const transformUser = (u) => {
  if (!u) return u;
  const originalProfilePic = u.profilePic;
  u.profilePic = hasCustomProfilePic(originalProfilePic)
    ? `/api/users/${u._id}/avatar?v=${hashText(`${originalProfilePic}-${u.updatedAt || ''}`)}`
    : `/default-avatars/${defaultAvatarFileFor(u.name, u._id)}`;
  return u;
};

import NodeCache from 'node-cache';

const router = express.Router();
const leaderboardCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultAvatarDir = path.resolve(__dirname, '../../../frontend/public/default-avatars');

const POINTS_PER_VERIFIED_STUDENT = Number(process.env.POINTS_PER_VERIFIED_STUDENT || 10);
const KNOWN_COLLEGE_LOGOS = [
  { pattern: /rishihood/i, logo: '' },
  { pattern: /school of planning|architecture.*spa|\bspa\b/i, logo: '/college-logos/spa-delhi.png' },
  { pattern: /jawaharlal nehru|jnu/i, logo: '/college-logos/jnu.png' },
  { pattern: /amity/i, logo: '/college-logos/amity-university.png' },
  { pattern: /delhi university|university of delhi/i, logo: '/college-logos/delhi-university.png' },
  { pattern: /symbiosis/i, logo: '/college-logos/symbiosis.png' },
  { pattern: /christ/i, logo: '/college-logos/christ-university.png' }
];

const logoForCollege = (name) => KNOWN_COLLEGE_LOGOS.find(item => item.pattern.test(name))?.logo || '';

const boyAvatarFiles = ['boy-1.png', 'boy-2.png', 'boy-3.png', 'boy-4.png', 'boy-5.png', 'boy-6.png'];
const girlAvatarFiles = ['girl-1.png', 'girl-2.png', 'girl-3.png', 'girl-4.png'];
const girlNameHints = [
  'aadhya', 'aanvi', 'aditi', 'akanksha', 'ananya', 'ankita', 'anjali', 'aparna',
  'avani', 'bhavna', 'divya', 'isha', 'kajal', 'kavya', 'khushi', 'kritika',
  'meera', 'muskan', 'neha', 'nisha', 'pooja', 'priya', 'riya', 'sakshi',
  'sanjana', 'shreya', 'simran', 'sneha', 'tanya', 'vaishnavi'
];

const hashText = (value = '') => {
  const text = String(value || 'student');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash) + text.charCodeAt(i);
  return Math.abs(hash);
};

const looksLikeGirlName = (name = '') => {
  const firstName = String(name).trim().split(/\s+/)[0]?.toLowerCase() || '';
  return girlNameHints.includes(firstName) || firstName.endsWith('a') || firstName.endsWith('i');
};

const defaultAvatarFileFor = (name, id) => {
  const pool = looksLikeGirlName(name) ? girlAvatarFiles : boyAvatarFiles;
  return pool[hashText(id || name) % pool.length];
};

const isGeneratedInitialsAvatar = (src = '') => {
  const value = String(src).toLowerCase();
  return [
    'ui-avatars.com',
    'dicebear',
    'avatar.iran.liara.run',
    'avatar.vercel.sh',
    '/initials/',
    'username='
  ].some(marker => value.includes(marker));
};

const serveDefaultAvatar = (res, name, id) => {
  const filename = defaultAvatarFileFor(name, id);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.sendFile(path.join(defaultAvatarDir, filename));
};

// @route   GET /api/users/leaderboard
// @desc    Get campus leaderboard ranked by verified students
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const cached = leaderboardCache.get("leaderboard_data");
    if (cached) return res.json(cached);

    const verifiedCounts = await User.aggregate([
      {
        $match: {
          university: { $type: 'string', $ne: '' },
          $or: [
            { verificationStatus: 'verified' },
            { isVerified: true }
          ]
        }
      },
      {
        $group: {
          _id: { $trim: { input: '$university' } },
          verifiedStudents: { $sum: 1 }
        }
      },
      { $match: { _id: { $ne: '' }, verifiedStudents: { $gte: 1 } } },
      {
        $addFields: {
          points: { $multiply: ['$verifiedStudents', POINTS_PER_VERIFIED_STUDENT] }
        }
      },
      { $sort: { points: -1, verifiedStudents: -1, _id: 1 } }
    ]);

    const collegeNames = verifiedCounts.map(item => item._id);
    const collegeDocs = await College.find({ name: { $in: collegeNames } })
      .select('name emoji logo accent banner location category');
    const collegeByName = new Map(collegeDocs.map(college => [college.name, college]));

    const leaderboard = verifiedCounts.map((item, index) => {
      const college = collegeByName.get(item._id);
      return {
        rank: index + 1,
        _id: item._id,
        college: item._id,
        name: item._id,
        verifiedStudents: item.verifiedStudents,
        verifiedCount: item.verifiedStudents,
        points: item.points,
        score: item.points,
        logo: college?.logo || logoForCollege(item._id),
        fallbackLogo: college?.emoji || '',
        accent: college?.accent || '#8b5cf6',
        banner: college?.banner || '',
        location: college?.location || '',
        category: college?.category || 'General'
      };
    });

    const payload = {
      pointsPerVerifiedStudent: POINTS_PER_VERIFIED_STUDENT,
      lastUpdated: new Date().toISOString(),
      leaderboard
    };
    
    leaderboardCache.set("leaderboard_data", payload);
    res.json(payload);
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
    const wasVerified = user.isVerified;
    syncVerificationStatus(user);
    if (wasVerified !== user.isVerified) await user.save();
    
    // Transform profile to avoid sending huge base64 string
    const userObj = user.toObject();
    res.json(transformUser(userObj));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id/avatar
// @desc    Get user's profile picture optimally (cached)
// In-memory avatar cache to avoid re-querying MongoDB for every image request
export const avatarCache = new Map(); // userId -> { mime, buffer, expiry }
const AVATAR_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Track in-flight DB fetches to avoid duplicate requests for the same user
const avatarFetching = new Set();

const clearAvatarCacheForUser = (userId) => {
  const prefix = `${userId}:`;
  for (const key of avatarCache.keys()) {
    if (String(key).startsWith(prefix)) avatarCache.delete(key);
  }
};

router.get('/:id/avatar', async (req, res) => {
  const id = req.params.id;
  const cacheKey = `${id}:${req.query.v || 'current'}`;
  const now = Date.now();

  // Serve from cache if available and fresh — instant response
  const cached = avatarCache.get(cacheKey);
  if (cached && cached.expiry > now) {
    if (cached.redirect && !isGeneratedInitialsAvatar(cached.redirect)) return res.redirect(cached.redirect);
    if (cached.redirect) avatarCache.delete(cacheKey);
    else {
    res.setHeader('Content-Type', cached.mime);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('ETag', `"${cacheKey}"`);
    return res.send(cached.buffer);
    }
  }

  try {
    const user = await User.findById(id).select('profilePic name').lean();
    const ttl = 24 * 60 * 60 * 1000;
    const expiry = Date.now() + ttl;

    if (!user || !hasCustomProfilePic(user.profilePic)) {
      return serveDefaultAvatar(res, user?.name || 'Student', id);
    }

    if (user.profilePic.startsWith('http')) {
      avatarCache.set(cacheKey, { redirect: user.profilePic, expiry });
      return res.redirect(user.profilePic);
    }

    if (user.profilePic.startsWith('data:image')) {
      const parts = user.profilePic.split(';');
      const mime = parts[0].split(':')[1];
      const data = parts[1].split(',')[1];
      const buffer = Buffer.from(data, 'base64');
      avatarCache.set(cacheKey, { mime, buffer, expiry });
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      res.setHeader('ETag', `"${cacheKey}"`);
      return res.send(buffer);
    }

    return serveDefaultAvatar(res, user.name, id);
  } catch (error) {
    return serveDefaultAvatar(res, 'Student', id);
  }
});


// @route   PUT /api/users/profile
// @desc    Update logged-in user's profile (name, bio, profilePic, instagram, snapchat, university)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const {
      name,
      bio,
      profilePic,
      instagram,
      linkedin,
      github,
      phone,
      snapchat,
      university,
      password,
      interests,
      goals,
      sports,
      year,
      passOutBatch,
      course,
      branch,
      studyYear,
      onboardingComplete,
      onboardingStep
    } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) {
      user.profilePic = profilePic;
      clearAvatarCacheForUser(user._id);
    }
    if (instagram !== undefined) user.instagram = instagram;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (phone !== undefined) user.phone = phone;
    if (snapchat !== undefined) user.snapchat = snapchat;
    if (university) user.university = normalizeUniversityName(university);
    if (interests !== undefined) user.interests = interests;
    if (goals !== undefined) user.goals = goals;
    if (sports !== undefined) user.sports = sports;
    if (year !== undefined) user.year = year;
    if (passOutBatch !== undefined) user.passOutBatch = passOutBatch;
    if (course !== undefined) user.course = course;
    if (branch !== undefined) user.branch = branch;
    if (studyYear !== undefined) {
      user.studyYear = studyYear;
      user.year = studyYear;
    }
    if (onboardingComplete !== undefined) user.onboardingComplete = onboardingComplete;
    if (onboardingStep !== undefined) user.onboardingStep = onboardingStep;
    if (password) user.password = password; // pre-save hook will hash it

    syncVerificationStatus(user);

    const updated = await user.save();
    
    // Ensure user joins their university group if they changed it
    if (university) {
      await ensureUniversityGroup(updated);
    }

    res.json(publicUserPayload(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/search
// @desc    Search users by name or university
router.get('/search/query', protect, async (req, res) => {
  try {
    const { q, filter } = req.query;
    let query = { _id: { $ne: req.user._id } };
    
    if (filter === 'same_interest') {
      query.university = req.user.university;
      query.interests = { $in: req.user.interests || [] };
    } else if (filter === 'other_campus') {
      query.university = { $ne: req.user.university };
    } else if (filter === 'same_campus') {
      query.university = req.user.university;
    }

    if (q) {
      const cleanQuery = q.replace(/^#/, '');
      const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedQuery, $options: 'i' } },
        { university: { $regex: escapedQuery, $options: 'i' } },
        { interests: { $regex: escapedQuery, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('name university profilePic bio interests year studyYear passOutBatch course branch isVerified streak createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const userIds = users.map(u => u._id);

    // Batch post counts in a single aggregation instead of N queries
    const [postCounts, followCounts] = await Promise.all([
      Post.aggregate([
        { $match: { author: { $in: userIds } } },
        { $group: { _id: '$author', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { _id: { $in: userIds } } },
        { $project: { followersCount: { $size: { $ifNull: ['$followers', []] } }, followingCount: { $size: { $ifNull: ['$following', []] } } } }
      ])
    ]);
    
    const countMap = new Map(postCounts.map(pc => [pc._id.toString(), pc.count]));
    const followMap = new Map(followCounts.map(fc => [fc._id.toString(), { followersCount: fc.followersCount, followingCount: fc.followingCount }]));

    const usersWithPostsCount = users.map(u => {
      const fc = followMap.get(u._id.toString()) || {};
      const transformed = transformUser(u);
      return {
        ...transformed,
        postsCount: countMap.get(u._id.toString()) || 0,
        followersCount: fc.followersCount || 0,
        followingCount: fc.followingCount || 0,
      };
    });

    res.json(usersWithPostsCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/daily-drop
// @desc    Instagram-style smart suggestions — always 5 users, resets every 24h
router.get('/daily-drop', protect, async (req, res) => {
  try {
    const me = await User.findById(req.user._id)
      .select('university interests following dailyDropUsers dailyDropDate')
      .populate('dailyDropUsers', 'name university profilePic bio interests year studyYear passOutBatch course branch isVerified streak createdAt updatedAt');

    if (!me) return res.status(404).json({ message: 'User not found' });

    // ── 24-hour cache check ───────────────────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dropDate = me.dailyDropDate ? new Date(me.dailyDropDate) : null;
    if (dropDate) dropDate.setHours(0, 0, 0, 0);

    if (
      dropDate &&
      dropDate.getTime() === today.getTime() &&
      me.dailyDropUsers &&
      me.dailyDropUsers.length === 5
    ) {
      console.log('[DailyDrop] Returning cached users for today');
      const userIds = me.dailyDropUsers.map(u => u._id || u);
      const [postCounts, followCounts] = await Promise.all([
        Post.aggregate([
          { $match: { author: { $in: userIds } } },
          { $group: { _id: '$author', count: { $sum: 1 } } }
        ]),
        User.aggregate([
          { $match: { _id: { $in: userIds } } },
          { $project: { followersCount: { $size: { $ifNull: ['$followers', []] } }, followingCount: { $size: { $ifNull: ['$following', []] } } } }
        ])
      ]);
      const countMap = new Map(postCounts.map(pc => [pc._id.toString(), pc.count]));
      const followMap = new Map(followCounts.map(fc => [fc._id.toString(), { followersCount: fc.followersCount, followingCount: fc.followingCount }]));
      
      const cachedWithPostsCount = me.dailyDropUsers.map(u => {
        const uObj = u.toObject ? u.toObject() : { ...u };
        delete uObj.followers;
        delete uObj.following;
        const fc = followMap.get(uObj._id.toString()) || {};
        const transformed = transformUser(uObj);
        return {
          ...transformed,
          postsCount: countMap.get(uObj._id.toString()) || 0,
          followersCount: fc.followersCount || 0,
          followingCount: fc.followingCount || 0,
        };
      });
      return res.json(cachedWithPostsCount);
    }

    // ── Build exclusion list (self + already following) ───────────────────
    const followingIds = (me.following || []).map(id => id.toString());
    const excludeIds = [me._id.toString(), ...followingIds];

    const fields = 'name university profilePic bio interests year studyYear passOutBatch course branch isVerified streak createdAt updatedAt';
    let suggested = [];

    const notAlreadyPicked = () => [...excludeIds, ...suggested.map(u => u._id.toString())];

    // ── PRIORITY 1: Same campus, not connected ─────────────────────────────
    if (suggested.length < 5 && me.university) {
      const sameCampus = await User.find({
        _id: { $nin: notAlreadyPicked() },
        university: me.university,
        name: { $exists: true, $ne: '' }
      })
        .select(fields)
        .limit(5 - suggested.length)
        .lean();
      console.log(`[DailyDrop] P1 same-campus found: ${sameCampus.length}`);
      suggested = [...suggested, ...sameCampus];
    }

    // ── PRIORITY 2: Common interests ──────────────────────────────────────
    if (suggested.length < 5 && me.interests && me.interests.length > 0) {
      const common = await User.find({
        _id: { $nin: notAlreadyPicked() },
        interests: { $elemMatch: { $in: me.interests } }
      })
        .select(fields)
        .limit(5 - suggested.length)
        .lean();
      console.log(`[DailyDrop] P2 common-interests found: ${common.length}`);
      suggested = [...suggested, ...common];
    }

    // ── PRIORITY 3: Popular users (highest follower count) ─────────────────
    if (suggested.length < 5) {
      const popular = await User.aggregate([
        { $match: { _id: { $nin: notAlreadyPicked().map(id => {
          try { return new mongoose.Types.ObjectId(id); } catch { return null; }
        }).filter(Boolean) } } },
        { $sample: { size: 200 } },
        { $addFields: { score: { $add: [{ $size: { $ifNull: ['$followers', []] } }, { $size: { $ifNull: ['$following', []] } }] } } },
        { $sort: { score: -1 } },
        { $limit: 5 - suggested.length },
        { $project: { name: 1, university: 1, profilePic: 1, bio: 1, interests: 1, year: 1, studyYear: 1, passOutBatch: 1, course: 1, branch: 1, followers: 1, following: 1, isVerified: 1, streak: 1, createdAt: 1, updatedAt: 1 } }
      ]);
      console.log(`[DailyDrop] P3 popular found: ${popular.length}`);
      suggested = [...suggested, ...popular];
    }

    // ── PRIORITY 4: Recently joined (last 7 days) ──────────────────────────
    if (suggested.length < 5) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newUsers = await User.find({
        _id: { $nin: notAlreadyPicked() },
        createdAt: { $gte: sevenDaysAgo }
      })
        .select(fields)
        .limit(5 - suggested.length)
        .lean();
      console.log(`[DailyDrop] P4 new-users found: ${newUsers.length}`);
      suggested = [...suggested, ...newUsers];
    }

    // ── PRIORITY 5: ABSOLUTE FALLBACK — just get anyone ───────────────────
    if (suggested.length < 5) {
      const anyone = await User.find({
        _id: { $nin: notAlreadyPicked() }
      })
        .select(fields)
        .limit(5 - suggested.length)
        .lean();
      console.log(`[DailyDrop] P5 fallback found: ${anyone.length}`);
      suggested = [...suggested, ...anyone];
    }

    console.log(`[DailyDrop] Total suggested: ${suggested.length}`);

    // ── Save to DB for 24h caching ─────────────────────────────────────────
    if (suggested.length > 0) {
      me.dailyDropUsers = suggested.map(u => u._id);
      me.dailyDropDate = new Date();
      await me.save();
    }

    const userIds = suggested.map(u => u._id);
    const [postCounts, followCounts] = await Promise.all([
      Post.aggregate([
        { $match: { author: { $in: userIds } } },
        { $group: { _id: '$author', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { _id: { $in: userIds } } },
        { $project: { followersCount: { $size: { $ifNull: ['$followers', []] } }, followingCount: { $size: { $ifNull: ['$following', []] } } } }
      ])
    ]);
    const countMap = new Map(postCounts.map(pc => [pc._id.toString(), pc.count]));
    const followMap = new Map(followCounts.map(fc => [fc._id.toString(), { followersCount: fc.followersCount, followingCount: fc.followingCount }]));

    const suggestedWithPostsCount = suggested.map(u => {
      const uObj = u.toObject ? u.toObject() : { ...u };
      delete uObj.followers;
      delete uObj.following;
      const fc = followMap.get(uObj._id.toString()) || {};
      const transformed = transformUser(uObj);
      return {
        ...transformed,
        postsCount: countMap.get(uObj._id.toString()) || 0,
        followersCount: fc.followersCount || 0,
        followingCount: fc.followingCount || 0,
      };
    });

    res.json(suggestedWithPostsCount);
  } catch (error) {
    console.error('[DailyDrop] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/me/followers
// @desc    Get logged-in user's followers
router.get('/me/followers', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('followers', 'name university profilePic _id isVerified createdAt');
    res.json((user.followers || []).map(follower => transformUser(follower.toObject ? follower.toObject() : follower)));
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
    const user = await User.findById(req.user._id).populate('followers', 'name university profilePic _id createdAt isVerified');
    
    // Return all followers if no since param, otherwise filter by createdAt after 'since'
    const allFollowers = user.followers || [];
    const newFollowers = req.query.since
      ? allFollowers.filter(f => f.createdAt && new Date(f.createdAt) > since)
      : allFollowers;

    res.json(newFollowers.map(follower => transformUser(follower.toObject ? follower.toObject() : follower)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/me/following
// @desc    Get logged-in user's following list
router.get('/me/following', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('following', 'name university profilePic _id isVerified createdAt');
    res.json((user.following || []).map(following => transformUser(following.toObject ? following.toObject() : following)));
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
    const user = await User.findById(req.params.id).select('-password -email -phone -verificationToken -verificationTokenExpires -collegeEmail -idPhotoUrl -adminNotes');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
