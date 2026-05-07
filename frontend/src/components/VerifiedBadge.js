"use client";
import Image from 'next/image';

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
    <span className="inline-flex items-center ml-1 flex-shrink-0" title={`Verified Campus Leader (${fersCount} followers, ${fingCount} following)`}>
      <img 
        src="/verified.png" 
        alt="Verified" 
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size, minWidth: size }}
      />
    </span>
  );
}
