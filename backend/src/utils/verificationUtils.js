export const hasCompletedRequiredProfile = (user) => {
  if (!user) return false;

  const hasName = Boolean(user.name?.trim());
  const hasPhoto = Boolean(user.profilePic?.trim());
  const hasBatch = Boolean(String(user.passOutBatch || '').trim());
  const hasCourse = Boolean(user.course?.trim());
  const hasBranch = Boolean(user.branch?.trim());
  const hasStudyYear = Boolean(user.studyYear?.trim() || user.year?.trim());

  return hasName && hasPhoto && hasBatch && hasCourse && hasBranch && hasStudyYear;
};

/**
 * Computes and stores only the profile-completeness derived fields.
 * isVerified / verificationStatus / verificationMethod are now controlled
 * exclusively by explicit auth actions (campus email registration, OTP, admin).
 */
export const syncVerificationStatus = (user) => {
  user.isVerified = hasCompletedRequiredProfile(user);
  return user.isVerified;
};

export const publicUserPayload = (user, token) => {
  const payload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    university: user.university,
    hometownState: user.hometownState,
    hometownDistrict: user.hometownDistrict,
    bio: user.bio,
    profilePic: user.profilePic,
    instagram: user.instagram,
    linkedin: user.linkedin,
    github: user.github,
    phone: user.phone,
    passOutBatch: user.passOutBatch,
    course: user.course,
    branch: user.branch,
    studyYear: user.studyYear || user.year,
    year: user.year,
    interests: user.interests,
    goals: user.goals,
    sports: user.sports,
    isPremium: user.isPremium,
    isVerified: user.isVerified,
    onboardingComplete: user.onboardingComplete,
    onboardingStep: user.onboardingStep || 1,
    referralCode: user.referralCode,
    xp: user.xp || 0,
    points: user.points,
    streak: user.streak || 0,
    lastLoginDate: user.lastLoginDate,
  };

  if (token) payload.token = token;
  return payload;
};
