export function isUserUnverifiedOrIncomplete(user) {
  if (!user) return false;

  const isVerified = Boolean(
    user.isVerified === true ||
    user.isVerified === "true" ||
    user.verifiedStatus === "verified"
  );

  const hasCollegeName = Boolean(user.collegeName || user.college);
  const hasCourse = Boolean(user.course || user.courseName);
  const hasBranch = Boolean(user.branch || user.branchName);
  const hasYear = Boolean(user.yearOfStudy || user.year);
  const hasBatch = Boolean(user.passoutBatch || user.passoutYear || user.graduationYear);

  const hasAllDetails = hasCollegeName && hasCourse && hasBranch && hasYear && hasBatch;

  return !isVerified || !hasAllDetails;
}
