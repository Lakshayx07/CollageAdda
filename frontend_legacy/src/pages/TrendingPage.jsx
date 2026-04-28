import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, TrendingUp, BarChart2, Zap, Flame, Award, Globe } from 'lucide-react';
import AppShell from '../components/AppShell';
import { useToast, ToastContainer } from '../components/Toast';

export default function TrendingPage() {
  const [trendingTags, setTrendingTags] = useState([
    { name: 'ExamsDone', count: 456, growth: '+12%' },
    { name: 'FresherParty', count: 389, growth: '+45%' },
    { name: 'Hackathon2026', count: 245, growth: '+8%' },
    { name: 'MessFoodDrama', count: 189, growth: '+22%' },
    { name: 'TechNews', count: 156, growth: '+5%' },
  ]);

  const [topPolls, setTopPolls] = useState([
    { 
      id: 1, 
      question: 'Which library floor is the best for focus?', 
      totalVotes: 890,
      options: [
        { text: 'Ground Floor', percentage: 20 },
        { text: '1st Floor (Quiet Zone)', percentage: 65 },
        { text: 'Rooftop Cafe', percentage: 15 }
      ]
    },
    { 
      id: 2, 
      question: 'Is the new campus wifi actually faster?', 
      totalVotes: 1200,
      options: [
        { text: 'Yes, finally!', percentage: 40 },
        { text: 'No, same old...', percentage: 60 }
      ]
    }
  ]);

  const { showToast } = useToast();

  return (
    <AppShell>
      <ToastContainer />
      <div className="min-h-screen bg-background pb-24 md:pb-10 pt-6">
        <div className="max-w-2xl mx-auto px-4 space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter flex items-center space-x-2">
                <span>CAMPUS PULSE</span>
                <Flame className="text-secondary fill-secondary animate-pulse" size={28} />
              </h1>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">What's viral at your university</p>
            </div>
            <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex items-center space-x-2">
              <Globe size={14} className="text-primary" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global</span>
            </div>
          </div>

          {/* Trending Tags Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass p-6 rounded-[32px] border border-white/5 space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary glow-primary">
                  <Hash size={20} />
                </div>
                <h2 className="font-black text-sm tracking-tight text-white uppercase tracking-widest">Trending Tags</h2>
              </div>
              
              <div className="space-y-3">
                {trendingTags.map((tag, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all"
                    onClick={() => showToast(`Opening #${tag.name}`, 'info')}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-black text-gray-600 w-4">{i + 1}</span>
                      <span className="text-sm font-bold text-gray-200 group-hover:text-primary transition-colors">#{tag.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-white">{tag.count} posts</span>
                      <span className="text-[8px] font-black text-green-400 uppercase">{tag.growth}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass p-6 rounded-[32px] border border-white/5 bg-gradient-to-br from-secondary/10 to-transparent">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Award size={20} className="text-secondary" />
                    <h2 className="font-black text-sm text-white uppercase tracking-widest">Top Voted</h2>
                  </div>
                </div>
                <div className="text-center py-4">
                  <p className="text-2xl font-black text-white tracking-tighter">8.4K</p>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">Interactions Today</p>
                </div>
              </div>

              <div className="glass p-6 rounded-[32px] border border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                <div className="flex items-center space-x-3 mb-2">
                  <Zap size={20} className="text-primary" />
                  <h2 className="font-black text-sm text-white uppercase tracking-widest">Live Debates</h2>
                </div>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                  Join the conversation about the new library timings. 124 students are typing...
                </p>
              </div>
            </div>
          </div>

          {/* Top Polls Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <BarChart2 size={24} className="text-primary" />
              <h2 className="font-black text-xl text-white tracking-tight uppercase">Top Polls</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topPolls.map((poll) => (
                <motion.div 
                  key={poll.id}
                  whileHover={{ y: -5 }}
                  className="glass p-6 rounded-[40px] border border-white/10 shadow-2xl space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Viral Poll</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{poll.totalVotes} votes</span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight">{poll.question}</h3>
                  <div className="space-y-3">
                    {poll.options.map((opt, i) => (
                      <div key={i} className="relative h-12 rounded-2xl bg-white/5 border border-white/5 overflow-hidden group cursor-pointer">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${opt.percentage}%` }}
                          className="absolute inset-y-0 left-0 bg-primary/10 transition-all"
                        />
                        <div className="absolute inset-0 px-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-200 group-hover:text-primary transition-colors">{opt.text}</span>
                          <span className="text-[10px] font-black text-white">{opt.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => showToast('Vote recorded!', 'success')}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all border border-white/5"
                  >
                    View Discussions
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
