"use client";

export default function VerifiedBadge({ user, size = 14 }) {
  if (!user) return null;

  // Get counts from various potential property names
  const fers = user.followers || user.authorFollowers || [];
  const fing = user.following || user.authorFollowing || [];
  
  const fersCount = Array.isArray(fers) ? fers.length : (user.followersCount || 0);
  const fingCount = Array.isArray(fing) ? fing.length : (user.followingCount || 0);

  // Verification threshold: 1 follower OR 1 following (Temp for testing)
  const isVerified = fersCount >= 1 || fingCount >= 1;

  if (!isVerified) return null;

  return (
    <span 
      className="inline-flex items-center justify-center ml-1 flex-shrink-0" 
      title={`Verified Campus Leader (${fersCount} followers, ${fingCount} following)`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <circle cx="12" cy="12" r="12" fill="#22C55E" />
        <path 
          d="M7 12.5L10.5 16L17 9" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </span>
  );
}
