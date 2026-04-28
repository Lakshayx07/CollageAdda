import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Info, RefreshCw, Zap } from 'lucide-react';
import AppShell from '../components/AppShell';
import MatchCard from '../components/MatchCard';
import { useToast, ToastContainer } from '../components/Toast';

export default function PeoplePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // const res = await fetch('/api/matches', { headers: { Authorization: `Bearer ${token}` } });
      // const data = await res.json();
      
      // Mock Data for demonstration
      const mockMatches = [
        {
          _id: '1',
          name: 'Aryan Sharma',
          university: 'IIT Delhi',
          year: '3rd Year',
          interests: ['Coding', 'Startup', 'Gaming'],
          goals: ['Placement', 'Skill Building'],
          profilePic: 'https://i.pravatar.cc/400?u=aryan'
        },
        {
          _id: '2',
          name: 'Isha Patel',
          university: 'Rishihood University',
          year: '2nd Year',
          interests: ['Gym', 'Music', 'Photography'],
          goals: ['Freelancing', 'Networking'],
          profilePic: 'https://i.pravatar.cc/400?u=isha'
        },
        {
          _id: '3',
          name: 'Kabir Verma',
          university: 'Delhi University',
          year: '4th Year',
          interests: ['Startup', 'Content Creation', 'Travel'],
          goals: ['Startup', 'Networking'],
          profilePic: 'https://i.pravatar.cc/400?u=kabir'
        }
      ];
      
      setMatches(mockMatches);
      setCurrentIndex(0);
    } catch (err) {
      showToast('Failed to load matches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (user) => {
    showToast(`Connection request sent to ${user.name}! 🚀`, 'success');
    // API Call: POST /api/matches/connect/${user._id}
    nextCard();
  };

  const handleSkip = (user) => {
    showToast(`Skipped ${user.name}`, 'info');
    // API Call: POST /api/matches/skip/${user._id}
    nextCard();
  };

  const nextCard = () => {
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <AppShell>
      <ToastContainer />
      <div className="min-h-screen bg-black flex flex-col items-center px-4 pt-8 pb-24 md:pb-10">
        
        {/* Header */}
        <div className="w-full max-w-md flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center space-x-2">
              <span>FOR YOU</span>
              <Zap className="text-yellow-400 fill-yellow-400" size={24} />
            </h1>
            <p className="text-gray-500 text-sm font-medium">Find students like you</p>
          </div>
          <button 
            onClick={fetchMatches}
            className="p-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Card Stack Container */}
        <div className="relative w-full max-w-md aspect-[3/4] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium animate-pulse">Finding matches...</p>
            </div>
          ) : currentIndex < matches.length ? (
            <AnimatePresence mode="popLayout">
              {matches.slice(currentIndex, currentIndex + 2).reverse().map((user, idx) => (
                <MatchCard
                  key={user._id}
                  user={user}
                  onConnect={() => handleConnect(user)}
                  onSkip={() => handleSkip(user)}
                />
              ))}
            </AnimatePresence>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-8 glass rounded-3xl border border-gray-800"
            >
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={40} className="text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No More People!</h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                You've seen everyone around you for now. Try updating your interests or check back later!
              </p>
              <button 
                onClick={fetchMatches}
                className="w-full py-4 bg-gradient-to-r from-primary to-indigo-600 rounded-2xl text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Refresh Search
              </button>
            </motion.div>
          )}
        </div>

        {/* Helper Instructions */}
        {currentIndex < matches.length && !loading && (
          <div className="mt-8 flex items-center space-x-2 text-gray-600 text-xs font-bold uppercase tracking-widest">
            <Info size={14} />
            <span>Swipe Right to Connect • Swipe Left to Skip</span>
          </div>
        )}

      </div>
    </AppShell>
  );
}
