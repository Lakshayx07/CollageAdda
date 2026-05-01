"use client";
import React, { useEffect, useState } from 'react';
import { getTopUniversityConnections } from '@/utils/badgeUtils';
import { motion } from 'framer-motion';

export default function UniversityBadges({ userId }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    let isMounted = true;
    const fetchBadges = async () => {
      setLoading(true);
      const data = await getTopUniversityConnections(userId, 3);
      if (isMounted) {
        setBadges(data);
        setLoading(false);
      }
    };

    fetchBadges();
    
    return () => { isMounted = false; };
  }, [userId]);

  if (loading || badges.length === 0) return null;

  const getBadgeStyle = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 text-yellow-950 border border-yellow-200/50 shadow-[0_0_15px_rgba(234,179,8,0.4)]";
      case 2:
        return "bg-gradient-to-r from-gray-200 via-gray-400 to-gray-500 text-gray-900 border border-gray-100/50";
      case 3:
        return "bg-gradient-to-r from-orange-300 via-orange-600 to-amber-700 text-orange-50 border border-orange-200/50 shadow-sm";
      default:
        return "bg-surface text-muted";
    }
  };

  const getBadgeIcon = (rank) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3 items-center justify-center sm:justify-start">
      {badges.map((badge, index) => (
        <div key={badge.university} className="relative group">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.15, type: "spring", stiffness: 300, damping: 20 }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold cursor-default transition-transform hover:scale-105 overflow-hidden ${getBadgeStyle(badge.rank)}`}
          >
            {badge.rank === 1 && (
              <span className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite] skew-x-[-20deg]" />
            )}
            <span className="relative z-10 flex items-center space-x-1">
              <span>{getBadgeIcon(badge.rank)}</span>
              <span>{badge.shortName}</span>
              <span className="bg-black/20 px-1.5 py-0.5 rounded-full text-[10px] ml-1 backdrop-blur-sm">
                {badge.count}
              </span>
            </span>
          </motion.div>
          
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] sm:text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20 shadow-lg">
            {badge.university} ({badge.count} connections)
          </div>
        </div>
      ))}
    </div>
  );
}
