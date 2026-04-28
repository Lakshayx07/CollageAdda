import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, GraduationCap, Users, Share2, TrendingUp, Zap } from 'lucide-react';
import AppShell from '../components/AppShell';
import { useToast, ToastContainer } from '../components/Toast';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([
    { _id: 'Rishihood University', verifiedCount: 1245, rank: 1, trend: 'up' },
    { _id: 'OP Jindal Global', verifiedCount: 980, rank: 2, trend: 'down' },
    { _id: 'Delhi University', verifiedCount: 850, rank: 3, trend: 'up' },
    { _id: 'IIT Delhi', verifiedCount: 620, rank: 4, trend: 'stable' },
    { _id: 'Jamia Millia', verifiedCount: 410, rank: 5, trend: 'up' },
  ]);

  const { showToast } = useToast();

  return (
    <AppShell>
      <ToastContainer />
      <div className="min-h-screen bg-background pb-28 md:pb-10 pt-6">
        <div className="max-w-2xl mx-auto px-4 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex p-4 rounded-[32px] bg-primary/20 text-primary glow-primary mb-2"
            >
              <Trophy size={40} />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter">CAMPUS CLASH 🏆</h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em]">Ranked by verified student density</p>
          </div>

          {/* Top 3 Podium */}
          <div className="flex items-end justify-center space-x-4 pt-10 pb-6">
            {/* Rank 2 */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gray-400/20 border border-gray-400/30 flex items-center justify-center text-gray-400 font-black text-xl">2</div>
              <div className="h-32 w-24 glass rounded-t-3xl border-x border-t border-white/5 flex flex-col items-center justify-end pb-4 space-y-1">
                <span className="text-[10px] font-black text-white text-center px-2 leading-tight">{leaderboard[1]._id}</span>
                <span className="text-[8px] font-bold text-gray-500">{leaderboard[1].verifiedCount}</span>
              </div>
            </div>
            {/* Rank 1 */}
            <div className="flex flex-col items-center space-y-3">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 rounded-[32px] bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-black text-2xl glow-primary"
              >
                1
              </motion.div>
              <div className="h-44 w-28 bg-gradient-to-t from-primary/20 to-surface rounded-t-3xl border-x border-t border-primary/20 flex flex-col items-center justify-end pb-6 space-y-1 shadow-2xl">
                <span className="text-xs font-black text-white text-center px-2 leading-tight">{leaderboard[0]._id}</span>
                <span className="text-[10px] font-bold text-primary">{leaderboard[0].verifiedCount}</span>
              </div>
            </div>
            {/* Rank 3 */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary font-black text-xl">3</div>
              <div className="h-24 w-24 glass rounded-t-3xl border-x border-t border-white/5 flex flex-col items-center justify-end pb-4 space-y-1">
                <span className="text-[10px] font-black text-white text-center px-2 leading-tight">{leaderboard[2]._id}</span>
                <span className="text-[8px] font-bold text-gray-500">{leaderboard[2].verifiedCount}</span>
              </div>
            </div>
          </div>

          {/* Detailed Leaderboard List */}
          <div className="glass rounded-[40px] border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                <Users size={14} />
                <span>Global Rankings</span>
              </h2>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Share2 size={12} />
                <span>Share My Uni</span>
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {leaderboard.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-black text-gray-600 w-4">{i + 1}</span>
                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-lg shadow-inner">
                      <GraduationCap size={20} className={i === 0 ? 'text-primary' : 'text-gray-400'} />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-white tracking-tight">{item._id}</h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Community</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">{item.verifiedCount}</p>
                    <p className="text-[8px] font-black text-green-400 uppercase flex items-center justify-end space-x-1">
                      <TrendingUp size={8} />
                      <span>Rising</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Card */}
          <div className="glass p-8 rounded-[40px] border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <Zap size={160} className="text-primary" />
            </div>
            <div className="relative z-10 space-y-4">
              <h2 className="text-xl font-black text-white leading-tight">Your university is ranked #1! 🎊</h2>
              <p className="text-gray-400 text-sm font-medium max-w-sm">Keep the momentum going. Invite your batchmates to unlock the "Golden Campus" status.</p>
              <button 
                onClick={() => showToast('Sharing to campus groups...', 'info')}
                className="px-8 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest glow-primary hover:scale-105 active:scale-95 transition-all"
              >
                Rally the Batch
              </button>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
