import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, UserPlus, Music, Plus } from 'lucide-react';
import AppShell from '../components/AppShell';
import { useToast, ToastContainer } from '../components/Toast';

// Safe, reliable mixkit video URLs for autoplay
const MOCK_REELS = {
  All: [
    { id: 1, category: 'Cars', url: 'https://assets.mixkit.co/videos/preview/mixkit-red-sports-car-driving-through-a-city-at-night-41584-large.mp4', user: 'Speedster', likes: 2400, comments: '156' },
    { id: 2, category: 'Song', url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-40430-large.mp4', user: 'MelodyQueen', likes: 1200, comments: '89' },
    { id: 3, category: 'Comedy', url: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-in-front-of-a-wall-44445-large.mp4', user: 'LaughFactory', likes: 15300, comments: '2.1k' },
    { id: 4, category: 'Lovesong', url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-low-angle-shot-1466-large.mp4', user: 'HeartStrings', likes: 8000, comments: '450' }
  ],
  Song: [
    { id: 2, category: 'Song', url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-40430-large.mp4', user: 'MelodyQueen', likes: 1200, comments: '89' },
  ],
  Cars: [
    { id: 1, category: 'Cars', url: 'https://assets.mixkit.co/videos/preview/mixkit-red-sports-car-driving-through-a-city-at-night-41584-large.mp4', user: 'Speedster', likes: 2400, comments: '156' },
  ],
  Comedy: [
    { id: 3, category: 'Comedy', url: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-in-front-of-a-wall-44445-large.mp4', user: 'LaughFactory', likes: 15300, comments: '2.1k' },
  ],
  Lovesong: [
    { id: 4, category: 'Lovesong', url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-low-angle-shot-1466-large.mp4', user: 'HeartStrings', likes: 8000, comments: '450' }
  ]
};

const ReelCard = ({ reel, showToast }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes);
  const videoRef = useRef(null);

  // Auto-play / pause based on intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      });
    }, { threshold: 0.6 });

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleFollow = () => {
    setIsFollowing(true);
    showToast(`Following @${reel.user} now!`, 'success');
  };

  const likeCountStr = likesCount > 999 ? (likesCount / 1000).toFixed(1) + 'k' : likesCount;

  return (
    <div className="relative h-[100dvh] w-full snap-start snap-always flex items-center justify-center overflow-hidden bg-black">
      {/* Video element restoring reliable autoplay */}
      <video 
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={reel.url}
        loop
        muted
        playsInline
        onClick={(e) => {
          if (e.target.paused) e.target.play();
          else e.target.pause();
        }}
      />
      
      {/* Dark Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10" />

      {/* Overlay - Right Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 z-20">
        <div className="relative group cursor-pointer pointer-events-auto">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-800">
            <img src={`https://i.pravatar.cc/150?u=${reel.user}`} alt="avatar" />
          </div>
          <button 
            onClick={handleFollow}
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full p-0.5 transition-all outline-none
              ${isFollowing ? 'bg-green-500 scale-0 opacity-0' : 'bg-primary scale-100 opacity-100 hover:scale-110'}`}
          >
            <Plus size={14} className="text-white font-bold" />
          </button>
        </div>
        
        <button onClick={toggleLike} className="flex flex-col items-center space-y-1 group outline-none pointer-events-auto">
          <motion.div whileTap={{ scale: 0.8 }}>
            <Heart 
              size={32} 
              className={`transition-colors shadow-lg ${isLiked ? 'fill-red-500 text-red-500' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-red-300'}`} 
            />
          </motion.div>
          <span className="text-white text-xs font-bold drop-shadow-md">{likeCountStr}</span>
        </button>
        
        <button onClick={() => showToast('Comments opening...', 'info')} className="flex flex-col items-center space-y-1 group outline-none pointer-events-auto">
          <motion.div whileTap={{ scale: 0.8 }}>
            <MessageCircle size={32} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-gray-300 transition-colors" />
          </motion.div>
          <span className="text-white text-xs font-bold drop-shadow-md">{reel.comments}</span>
        </button>
        
        <button onClick={() => showToast('Link copied to clipboard!', 'success')} className="flex flex-col items-center space-y-1 group outline-none pointer-events-auto">
          <motion.div whileTap={{ scale: 0.8 }}>
            <Share2 size={32} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-gray-300 transition-colors" />
          </motion.div>
          <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
        </button>
      </div>
      
      {/* Overlay - Bottom Info */}
      <div className="absolute bottom-6 left-4 right-20 text-white z-20 pointer-events-none">
        <h3 className="font-bold text-lg mb-1 drop-shadow-lg">@{reel.user}</h3>
        <p className="text-sm line-clamp-2 opacity-100 drop-shadow-lg font-medium">Enjoying the vibe! #{reel.category} #CollageAdda</p>
        <div className="flex items-center mt-3 text-xs opacity-90 drop-shadow-md bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
          <Music size={12} className="mr-2 animate-spin-slow" />
          <span>Original Audio - {reel.user}</span>
        </div>
      </div>
    </div>
  );
};

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState('All');
  const { showToast } = useToast();
  const categories = ['All', 'Song', 'Cars', 'Comedy', 'Lovesong'];

  return (
    <AppShell>
      <ToastContainer />
      <div className="relative h-[100dvh] bg-black overflow-hidden flex flex-col md:rounded-l-2xl border-l border-gray-800">
        
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-40 pointer-events-none" />

        <div className="absolute top-6 left-0 right-0 z-50 flex justify-center space-x-2 px-4 overflow-x-auto no-scrollbar mask-image-horizontal">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 outline-none
                ${activeTab === cat 
                  ? 'bg-yellow-500 text-black scale-105 shadow-[0_4px_20px_rgba(245,158,11,0.4)]' 
                  : 'bg-black/50 text-white/80 backdrop-blur-md hover:bg-black/70 hover:text-white border border-white/20'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => showToast('Reel Creator Studio launching soon! 🎥', 'success')}
          className="absolute top-6 right-6 lg:right-10 z-50 p-3 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:scale-110 active:scale-95 transition-all group outline-none border border-white/20"
        >
          <Plus size={24} className="text-white drop-shadow-md" />
        </button>

        <div className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar h-full w-full">
          {MOCK_REELS[activeTab]?.length > 0 ? (
            MOCK_REELS[activeTab].map(reel => (
              <ReelCard key={reel.id} reel={reel} showToast={showToast} />
            ))
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-500">
              <p>No reels found for {activeTab}</p>
            </div>
          )}
        </div>
        
      </div>
    </AppShell>
  );
}
