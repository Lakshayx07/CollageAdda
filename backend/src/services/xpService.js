import User from '../models/User.js';
import XpLog from '../models/XpLog.js';
import { XP_ACTIONS, XP_TIERS, BADGES } from '../config/xpConfig.js';

export const awardXP = async (userId, actionType, refId) => {
  const xpAwarded = XP_ACTIONS[actionType];
  if (!xpAwarded) return null;

  try {
    const existingLog = await XpLog.findOne({ user: userId, actionType, refId });
    if (existingLog) return null; // Already awarded

    await XpLog.create({
      user: userId,
      actionType,
      xpAwarded,
      refId
    });
  } catch (err) {
    if (err.code === 11000) return null; // Duplicate key error
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) return null;

  user.xp = (user.xp || 0) + xpAwarded;

  const totalXp = user.xp + (user.points || 0);
  let currentTick = null;
  
  for (let i = XP_TIERS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_TIERS[i].xpRequired) {
      currentTick = XP_TIERS[i].id;
      break;
    }
  }
  user.currentTick = currentTick;

  const actionToBadgeType = {
    'CREATE_POST': 'posts',
    'EXPLORE_POST': 'posts',
    'CREATE_STORY': 'stories',
    'COMMENT_POST': 'comments',
    'LIKE_POST': 'likes_received',
    'CONNECT_USER': 'connections'
  };
  
  const relevantBadgeType = actionToBadgeType[actionType];
  const newlyUnlockedBadges = [];
  
  if (relevantBadgeType) {
    const badgesToCheck = BADGES.filter(b => b.type === relevantBadgeType);
    
    for (const badge of badgesToCheck) {
      if (user.unlockedBadges && user.unlockedBadges.some(b => b.badgeId === badge.id)) {
        continue;
      }
      
      let query = { user: userId, actionType };
      
      if (badge.window === 'week') {
        query.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
      } else if (badge.window === 'month') {
        query.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
      }
      
      const count = await XpLog.countDocuments(query);
      
      if (count >= badge.target) {
        if (!user.unlockedBadges) user.unlockedBadges = [];
        user.unlockedBadges.push({ badgeId: badge.id, unlockedAt: new Date() });
        newlyUnlockedBadges.push(badge.id);
      }
    }
  }

  await user.save();
  
  return {
    xp: user.xp,
    currentTick: user.currentTick,
    newlyUnlockedBadges
  };
};

export const revokeXP = async (userId, actionType, refId) => {
  const log = await XpLog.findOne({ user: userId, actionType, refId });
  if (!log) return null;

  const xpRevoked = log.xpAwarded;

  await XpLog.deleteOne({ _id: log._id });

  const user = await User.findById(userId);
  if (!user) return null;

  user.xp = Math.max(0, (user.xp || 0) - xpRevoked);

  const totalXp = user.xp + (user.points || 0);
  let currentTick = null;
  
  for (let i = XP_TIERS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_TIERS[i].xpRequired) {
      currentTick = XP_TIERS[i].id;
      break;
    }
  }
  user.currentTick = currentTick;

  // Note: We don't revoke already unlocked badges to avoid confusing UX.
  
  await user.save();
  
  return {
    xp: user.xp,
    currentTick: user.currentTick
  };
};
