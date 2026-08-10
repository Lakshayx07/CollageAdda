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
  const hasUniversity = Boolean((user.university || user.collegeName || user.college)?.trim());
  const hasCourse = Boolean((user.course || user.courseName)?.trim());
  const hasBranch = Boolean((user.branch || user.branchName)?.trim());
  const hasYear = Boolean((user.studyYear || user.year || user.yearOfStudy || user.yearOfStudyLabel)?.trim());
  const hasBatch = Boolean((user.passOutBatch || user.passoutBatch || user.passoutYear || user.graduationYear)?.trim());

  const hasAllDetails = hasUniversity && hasCourse && hasBranch && hasYear && hasBatch;

  // Only show notification if user is NOT verified OR missing required details
  return !isVerified || !hasAllDetails;
}
