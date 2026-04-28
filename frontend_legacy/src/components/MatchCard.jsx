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
      exit={{ x: 500, opacity: 0, rotate: 10 }}
      className="absolute inset-0 w-full h-[620px] bg-surface rounded-[40px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/10 touch-none"
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
        <div className="absolute bottom-8 left-8 right-8">
          <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">{user.name}</h2>
          <div className="flex items-center text-white/80 text-xs font-black uppercase tracking-[0.2em] space-x-2">
            <GraduationCap size={14} className="text-primary" />
            <span>{user.university}</span>
          </div>
          <div className="mt-3 inline-block px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-primary uppercase tracking-widest">
            {user.year || 'Student'}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-8 space-y-6 bg-surface/50">
        {/* Interests Tags */}
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-black">Vibe Tags</p>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, idx) => (
              <span 
                key={idx} 
                className="px-4 py-1.5 rounded-xl bg-white/5 text-white text-[10px] font-bold uppercase tracking-wider border border-white/5"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Goals Section */}
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-black">Mission</p>
          <div className="flex flex-wrap gap-2">
            {user.goals.map((goal, idx) => (
              <span 
                key={idx} 
                className="px-4 py-1.5 rounded-xl bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-wider border border-secondary/20"
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
