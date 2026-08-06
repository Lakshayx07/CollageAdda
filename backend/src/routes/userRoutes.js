import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import College from '../models/College.js';
import { awardXP, revokeXP } from '../services/xpService.js';
import { BADGES } from '../config/xpConfig.js';
import XpLog from '../models/XpLog.js';
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
  if (u._transformed) return u;
  u._transformed = true;

  const originalProfilePic = u.profilePic;

  if (originalProfilePic === undefined) {
    u.profilePic = `/api/users/${u._id}/avatar?v=${u.updatedAt ? new Date(u.updatedAt).getTime() : 'current'}`;
  } else {
    u.profilePic = hasCustomProfilePic(originalProfilePic)
      ? `/api/users/${u._id}/avatar?v=${hashText(`${originalProfilePic}-${u.updatedAt || ''}`)}`
      : `/default-avatars/${defaultAvatarFileFor(u.name, u._id)}`;
  }

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

    // Calculate dynamic campus rank
    const myScore = (userObj.followers?.length || 0) + (userObj.following?.length || 0);
    const rankAgg = await User.aggregate([
      { $match: { university: userObj.university } },
      { $project: { score: { $add: [{ $size: { $ifNull: ['$followers', []] } }, { $size: { $ifNull: ['$following', []] } }] } } },
      { $match: { score: { $gt: myScore } } },
      { $count: "higherScoringUsers" }
    ]);
    userObj.campusRank = (rankAgg[0]?.higherScoringUsers || 0) + 1;

    // Get post count instantly for the profile stats
    userObj.postsCount = await Post.countDocuments({ author: req.user._id });

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

    let {
      name,
      bio,
      profilePic,
      instagram,
      linkedin,
      github,
      phone,
      snapchat,
      university,
      hometownState,
      hometownDistrict,
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

    const coreFieldsChanged = (name !== undefined && name !== user.name) ||
      (passOutBatch !== undefined && passOutBatch !== user.passOutBatch) ||
      (studyYear !== undefined && studyYear !== user.studyYear) ||
      (course !== undefined && course !== user.course) ||
      (branch !== undefined && branch !== user.branch);

    let coreRestricted = false;

    if (coreFieldsChanged && user.isVerified) {
      if (user.lastCoreProfileEditDate) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (user.lastCoreProfileEditDate > thirtyDaysAgo) {
          coreRestricted = true;
          // Revert core fields to undefined so they are ignored below
          name = undefined;
          passOutBatch = undefined;
          studyYear = undefined;
          year = undefined;
          course = undefined;
          branch = undefined;
        }
      }
      if (!coreRestricted) {
        user.lastCoreProfileEditDate = new Date();
      }
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) {
      user.profilePic = profilePic;
      clearAvatarCacheForUser(user._id);
    }
    if (instagram !== undefined) user.instagram = instagram;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (phone !== undefined) user.phone = phone;
    if (req.body.phonePrivacy !== undefined) user.phonePrivacy = req.body.phonePrivacy;
    if (snapchat !== undefined) user.snapchat = snapchat;
    if (university) user.university = normalizeUniversityName(university);
    if (hometownState !== undefined) user.hometownState = hometownState;
    if (hometownDistrict !== undefined) user.hometownDistrict = hometownDistrict;
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

    const payload = publicUserPayload(updated);
    if (coreRestricted) {
      payload.warning = 'Other details were updated successfully, but your core details (Name, Batch, Year, Course, Branch) cannot be changed before 30 days.';
    }

    res.json(payload);
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
      .select('name university bio interests year studyYear passOutBatch course branch isVerified xp points currentTick streak createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const totalCount = await User.countDocuments(query);

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

    const universities = [...new Set(users.map(u => u.university))].filter(Boolean);
    const uniScoresAgg = await User.aggregate([
      { $match: { university: { $in: universities } } },
      { $project: { university: 1, score: { $add: [{ $size: { $ifNull: ['$followers', []] } }, { $size: { $ifNull: ['$following', []] } }] } } }
    ]);
    const scoresByUni = {};
    for (const doc of uniScoresAgg) {
      if (!scoresByUni[doc.university]) scoresByUni[doc.university] = [];
      scoresByUni[doc.university].push(doc.score);
    }

    const usersWithPostsCount = users.map(u => {
      const fc = followMap.get(u._id.toString()) || {};
      const transformed = transformUser(u);

      const myScore = (fc.followersCount || 0) + (fc.followingCount || 0);
      let campusRank = null;
      if (u.university && scoresByUni[u.university]) {
        let higherScoringUsers = 0;
        for (const score of scoresByUni[u.university]) {
          if (score > myScore) higherScoringUsers++;
        }
        campusRank = higherScoringUsers + 1;
      }

      return {
        ...transformed,
        postsCount: countMap.get(u._id.toString()) || 0,
        followersCount: fc.followersCount || 0,
        followingCount: fc.followingCount || 0,
        campusRank
      };
    });

    res.json({ users: usersWithPostsCount, totalCount });
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
      .populate('dailyDropUsers', 'name university profilePic bio interests year studyYear passOutBatch course branch isVerified xp points currentTick streak createdAt updatedAt');

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

    const fields = 'name university profilePic bio interests year studyYear passOutBatch course branch isVerified xp points currentTick streak createdAt updatedAt';
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
        {
          $match: {
            _id: {
              $nin: notAlreadyPicked().map(id => {
                try { return new mongoose.Types.ObjectId(id); } catch { return null; }
              }).filter(Boolean)
            }
          }
        },
        { $sample: { size: 200 } },
        { $addFields: { score: { $add: [{ $size: { $ifNull: ['$followers', []] } }, { $size: { $ifNull: ['$following', []] } }] } } },
        { $sort: { score: -1 } },
        { $limit: 5 - suggested.length },
        { $project: { name: 1, university: 1, profilePic: 1, bio: 1, interests: 1, year: 1, studyYear: 1, passOutBatch: 1, course: 1, branch: 1, followers: 1, following: 1, isVerified: 1, xp: 1, points: 1, currentTick: 1, streak: 1, createdAt: 1, updatedAt: 1 } }
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
    const user = await User.findById(req.user._id).populate('followers', 'name university profilePic _id isVerified xp points currentTick createdAt');
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
    const user = await User.findById(req.user._id).populate('followers', 'name university profilePic _id createdAt isVerified xp points currentTick');

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
    const user = await User.findById(req.user._id).populate('following', 'name university profilePic _id isVerified xp points currentTick createdAt');
    res.json((user.following || []).map(following => transformUser(following.toObject ? following.toObject() : following)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get any user's public followers list
router.get('/:id/followers', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name university profilePic _id isVerified xp points currentTick createdAt updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json((user.followers || []).map(follower => transformUser(follower.toObject ? follower.toObject() : follower)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get any user's public following list
router.get('/:id/following', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name university profilePic _id isVerified xp points currentTick createdAt updatedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

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
      await revokeXP(targetUser._id, 'CONNECT_USER', `follow_${req.user._id}_${targetUser._id}`);
      await revokeXP(req.user._id, 'CONNECT_USER', `follow_${req.user._id}_${targetUser._id}`);
    } else {
      currentUser.following.push(req.params.id);
      targetUser.followers.push(req.user._id);
      // Award XP to the user being followed (as a connection event)
      await awardXP(targetUser._id, 'CONNECT_USER', `follow_${req.user._id}_${targetUser._id}`);
      // Also award to the follower if desired, but typically "Make 15 connections" might mean both sides
      await awardXP(req.user._id, 'CONNECT_USER', `follow_${req.user._id}_${targetUser._id}`);
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

// @route   GET /api/users/me/xp-progress
// @desc    Get logged-in user's XP and badge progress
router.get('/me/xp-progress', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const progress = {};
    for (const badge of BADGES) {
      const actionType = badge.type === 'posts' ? 'CREATE_POST'
        : badge.type === 'stories' ? 'CREATE_STORY'
          : badge.type === 'comments' ? 'COMMENT_POST'
            : badge.type === 'likes_received' ? 'LIKE_POST'
              : 'CONNECT_USER';

      let query = { user: user._id, actionType };
      if (badge.window === 'week') {
        query.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
      } else if (badge.window === 'month') {
        query.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
      }

      const count = await XpLog.countDocuments(query);
      progress[badge.id] = { current: count, target: badge.target };
    }

    res.json({
      xp: user.xp,
      points: user.points,
      currentTick: user.currentTick,
      unlockedBadges: user.unlockedBadges || [],
      progress
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/users/network/leaderboard
// @desc    Get top users by followers + following
router.get('/network/leaderboard', protect, async (req, res) => {
  try {
    const { filter } = req.query; // 'my_campus' or 'global'

    let matchStage = {};
    if (filter === 'my_campus') {
      matchStage.university = req.user.university;
    }

    const topUsers = await User.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          score: {
            $add: [
              { $size: { $ifNull: ['$followers', []] } },
              { $size: { $ifNull: ['$following', []] } },
              { $ifNull: ['$xp', 0] },
              { $ifNull: ['$points', 0] }
            ]
          }
        }
      },
      { $sort: { score: -1, createdAt: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1, university: 1, bio: 1, interests: 1, year: 1, studyYear: 1, passOutBatch: 1, course: 1, branch: 1, isVerified: 1, xp: 1, points: 1, currentTick: 1, streak: 1, createdAt: 1, updatedAt: 1,
          followersCount: { $size: { $ifNull: ['$followers', []] } },
          followingCount: { $size: { $ifNull: ['$following', []] } }
        }
      }
    ]);

    // Format with transformUser to add avatar API URLs
    const formatted = topUsers.map(u => transformUser(u));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/network/lookup
// @desc    Lightweight lookup for follower/following modal rows
router.get('/network/lookup', protect, async (req, res) => {
  try {
    const ids = String(req.query.ids || '')
      .split(',')
      .map(id => id.trim())
      .filter(id => /^[a-f\d]{24}$/i.test(id))
      .filter(Boolean)
      .slice(0, 80);

    if (ids.length === 0) return res.json([]);

    const users = await User.find({ _id: { $in: ids } })
      .select('name profilePic university course branch isVerified currentTick xp points updatedAt')
      .lean();

    const order = new Map(ids.map((id, index) => [id, index]));
    const payload = users
      .map(user => transformUser(user))
      .sort((a, b) => (order.get(a._id.toString()) ?? 0) - (order.get(b._id.toString()) ?? 0));

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get another user's public profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -verificationToken -verificationTokenExpires -collegeEmail -idPhotoUrl -adminNotes');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userObj = user.toObject();
    const followerIds = (userObj.followers || []).map(id => id.toString()).filter(Boolean);
    const followingIds = (userObj.following || []).map(id => id.toString()).filter(Boolean);
    userObj.followers = followerIds;
    userObj.following = followingIds;
    userObj.followersCount = followerIds.length;
    userObj.followingCount = followingIds.length;

    if (userObj.phonePrivacy === 'private' && req.user.id !== userObj._id.toString()) {
      delete userObj.phone;
    }

    const myScore = userObj.followersCount + userObj.followingCount;

    const [rankAgg, postsCount] = await Promise.all([
      User.aggregate([
        { $match: { university: userObj.university } },
        { $project: { score: { $add: [{ $size: { $ifNull: ['$followers', []] } }, { $size: { $ifNull: ['$following', []] } }] } } },
        { $match: { score: { $gt: myScore } } },
        { $count: "higherScoringUsers" }
      ]),
      Post.countDocuments({ author: req.params.id })
    ]);

    userObj.campusRank = (rankAgg[0]?.higherScoringUsers || 0) + 1;
    userObj.postsCount = postsCount;

    res.json(transformUser(userObj));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
