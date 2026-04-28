import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Heart, X, Star } from 'lucide-react';

export default function MatchCard({ user, onConnect, onSkip }) {
  const commonInterests = user.commonInterests || [];

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 100) onConnect();
        else if (info.offset.x < -100) onSkip();
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: 500, opacity: 0 }}
      className="absolute inset-0 w-full h-[600px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 touch-none"
    >
      {/* Profile Image */}
      <div className="relative h-2/3 w-full">
        <img
          src={user.profilePic || `https://i.pravatar.cc/400?u=${user._id}`}
          alt={user.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        {/* User Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <h2 className="text-3xl font-bold text-white mb-1">{user.name}</h2>
          <div className="flex items-center text-gray-300 text-sm space-x-2">
            <GraduationCap size={16} className="text-primary" />
            <span>{user.university} • {user.year || 'Student'}</span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 space-y-4">
        {/* Interests Tags */}
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Interests</p>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs border border-gray-700"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Goals Section */}
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Goals</p>
          <div className="flex flex-wrap gap-2">
            {user.goals.map((goal, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 rounded-full bg-indigo-900/40 text-indigo-300 text-xs border border-indigo-800/30"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Swipe Actions Hints (Mobile) */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-12 px-6 pointer-events-none">
        <div className="flex flex-col items-center opacity-40">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/50 flex items-center justify-center text-red-500">
            <X size={24} />
          </div>
          <span className="text-[10px] mt-1 uppercase">Skip</span>
        </div>
        <div className="flex flex-col items-center opacity-40">
          <div className="w-12 h-12 rounded-full border-2 border-green-500/50 flex items-center justify-center text-green-500">
            <Heart size={24} />
          </div>
          <span className="text-[10px] mt-1 uppercase">Connect</span>
        </div>
      </div>
    </motion.div>
  );
}
