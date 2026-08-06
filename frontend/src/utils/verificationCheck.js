/**
 * Returns true ONLY IF the user:
 * - is NOT verified (no isVerified flag), OR
 * - is missing ANY of the required college details
 *
 * Returns false (don't show badge) if the user is verified AND has all details.
 */
export function isUserUnverifiedOrIncomplete(user) {
  if (!user) return false;

  // Check verification — matches VerifiedBadge.js logic (user.isVerified must be truthy)
  const isVerified = Boolean(user.isVerified);

  // Check college details — use the exact field names from the profile page
  const hasUniversity = Boolean(user.university || user.collegeName || user.college);
  const hasCourse = Boolean(user.course || user.courseName);
  const hasBranch = Boolean(user.branch || user.branchName);
  const hasYear = Boolean(user.yearOfStudy || user.year || user.yearOfStudyLabel);
  const hasBatch = Boolean(user.passOutBatch || user.passoutBatch || user.passoutYear || user.graduationYear);

  const hasAllDetails = hasUniversity && hasCourse && hasBranch && (hasYear || hasBatch);

  // Only show notification if user is NOT verified OR missing required details
  return !isVerified || !hasAllDetails;
}
