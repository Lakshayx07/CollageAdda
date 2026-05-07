"use client";
import Image from 'next/image';

export default function VerifiedBadge({ user, size = 14 }) {
  // Check if user has 10+ followers or 10+ following
  const followersCount = user?.followers?.length || user?.followersCount || 0;
  const followingCount = user?.following?.length || user?.followingCount || 0;

  const isVerified = followersCount >= 10 || followingCount >= 10;

  if (!isVerified) return null;

  return (
    <span className="inline-flex items-center ml-1" title="Verified Campus Leader">
      <img 
        src="/verified.png" 
        alt="Verified" 
        style={{ width: size, height: size }}
        className="object-contain"
      />
    </span>
  );
}
