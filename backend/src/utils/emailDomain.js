import College from '../models/College.js';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Returns the domain portion of an email address in lowercase.
 */
export const getEmailDomain = (email) => {
  return email?.split('@')[1]?.toLowerCase() || '';
};

/**
 * Checks whether an email's domain is on the allowlist for the given university.
 * - If the college is not in the database, access is denied.
 * - If the college exists but has no configured domains, access is denied until
 *   an admin adds allowed domains.
 * - Returns true only when the email domain exactly matches one of the allowed domains.
 */
export const isEmailAllowedForUniversity = async (email, universityName) => {
  if (!email || !universityName || universityName.trim() === 'Other') return false;

  const domain = getEmailDomain(email);
  if (!domain) return false;

  const college = await College.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(universityName.trim())}$`, 'i') }
  }).select('allowedEmailDomains').lean();

  if (!college) return false;

  const allowed = (college.allowedEmailDomains || []).map((d) => d.toLowerCase().trim());
  if (allowed.length === 0) return false;

  return allowed.some((d) => domain === d || domain.endsWith(`.${d}`));
};
