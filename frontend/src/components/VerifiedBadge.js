"use client";
import { motion } from "framer-motion";

export default function VerifiedBadge({ user, size = 14 }) {
  if (!user) return null;

  // Get counts from various potential property names
  const fers = user.followers || user.authorFollowers || [];
  const fing = user.following || user.authorFollowing || [];
  
  const fersCount = Array.isArray(fers) ? fers.length : (user.followersCount || 0);
  const fingCount = Array.isArray(fing) ? fing.length : (user.followingCount || 0);

  // Verification threshold: 1 follower OR 1 following (Temp for testing)
  const isVerified = fersCount >= 10 || fingCount >= 10;

  if (!isVerified) return null;

  return (
    <motion.span 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center justify-center ml-1.5 flex-shrink-0" 
      title={`Verified Campus Leader (${fersCount} followers, ${fingCount} following)`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
      >
        <path 
          d="M12 2L15.09 5.26L19.47 4.5L20 8.84L24 12L20 15.16L19.47 19.5L15.09 18.74L12 22L8.91 18.74L4.53 19.5L4 15.16L0 12L4 8.84L4.53 4.5L8.91 5.26L12 2Z" 
          fill="url(#verified-grad)" 
        />
        <path 
          d="M7 12L10 15L17 8" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <defs>
          <linearGradient id="verified-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
    </motion.span>
  );
}
