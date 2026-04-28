import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, Instagram, Edit3, GraduationCap, Mail,
  Users, BookOpen, Star, Save, CheckCircle, AtSign,
  Award, Gift, Copy, Share2
} from 'lucide-react';
import AppShell from '../components/AppShell';
import { useToast, ToastContainer } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const UNIVERSITIES = [
  'Rishihood University',
  'OP Jindal Global University',
  'Delhi University',
  'IIT Delhi',
  'Jamia Millia Islamia',
  'Other',
];

const INTEREST_OPTIONS = [
  'Coding', 'Gym', 'Startup', 'Content Creation', 'Photography', 
  'Music', 'Dance', 'Reading', 'Gaming', 'Travel', 'Art', 'Sports'
];

const GOAL_OPTIONS = [
  'Placement', 'Freelancing', 'Networking', 'Startup', 'Masters', 'Skill Building'
];

const YEAR_OPTIONS = [
  '1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'
];

// Pulled from localStorage (set during login/register)
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('collageadda_user') || '{}');
  } catch {
    return {};
  }
};

const saveStoredUser = (u) => localStorage.setItem('collageadda_user', JSON.stringify(u));

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const stored = user || getStoredUser();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: stored.name || 'New Student',
    email: stored.email || 'student@university.edu',
    university: stored.university || 'Rishihood University',
    bio: stored.bio || '',
    profilePic: stored.profilePic || '',
    instagram: stored.instagram || '',
    snapchat: stored.snapchat || '',
    interests: stored.interests || [],
    goals: stored.goals || [],
    year: stored.year || '1st Year',
  });

  const [draft, setDraft] = useState({ ...profile });

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDraft(d => ({ ...d, profilePic: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setProfile({ ...draft });
    saveStoredUser({ ...stored, ...draft });
    setEditing(false);
    setSaved(true);
    showToast('Profile saved successfully!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  const activeProfile = editing ? draft : profile;
  const initials = activeProfile.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AppShell>
      <ToastContainer />
      <div className="min-h-screen pb-28 md:pb-10">
        {/* Banner - Modern Gradient */}
        <div className="h-44 md:h-60 bg-gradient-to-tr from-background via-surface to-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.2),transparent_50%)]" />
          <div className="absolute inset-0 animate-pulse-soft bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.2),transparent_50%)]" />
          {editing && (
            <button className="absolute top-6 right-6 flex items-center space-x-2 glass-dark px-4 py-2 rounded-2xl text-xs font-bold text-white hover:bg-white/10 transition-all border border-white/10">
              <Camera size={14} />
              <span>Change Cover</span>
            </button>
          )}
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-6">
          {/* Avatar + Actions Row */}
          <div className="flex items-end justify-between -mt-14 mb-4">
            <div className="relative">
              <div
                className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-background overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl ${editing ? 'cursor-pointer' : ''}`}
                onClick={editing ? handleAvatarClick : undefined}
              >
                {activeProfile.profilePic
                  ? <img src={activeProfile.profilePic} alt="avatar" className="w-full h-full object-cover" />
                  : initials
                }
                {editing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <Camera size={22} className="text-white" />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="flex space-x-2 pb-1">
              {editing ? (
                <>
                  <button onClick={handleCancel} className="px-5 py-2.5 rounded-2xl border border-white/10 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-primary text-sm font-black text-white glow-primary shadow-indigo-500/40 transition-all"
                  >
                    {saved ? <CheckCircle size={16} /> : <Save size={16} />}
                    <span>Save</span>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl glass-dark border border-white/10 text-sm font-bold text-white hover:border-primary transition-all"
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Name & Uni */}
          {editing ? (
            <div className="space-y-3 mb-6">
              <input
                value={draft.name}
                onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                placeholder="Your full name"
                className="block w-full glass border border-gray-700/60 rounded-xl px-4 py-2.5 text-white text-lg font-bold placeholder-gray-600 outline-none focus:border-primary/60 transition-colors"
              />
              <textarea
                value={draft.bio}
                onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                placeholder="Write a short bio about yourself... 🎓"
                rows={2}
                className="block w-full glass border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-primary/60 transition-colors resize-none"
              />
            </div>
          ) : (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              {profile.bio && <p className="text-gray-400 text-sm mt-1 leading-relaxed">{profile.bio}</p>}
            </div>
          )}

          {/* Stats Row */}
          <div className="flex space-x-6 mb-6 text-center">
            {[
              [stored.postsCount || '12', 'Posts'],
              [stored.followersCount || '248', 'Followers'],
              [stored.followingCount || '190', 'Following']
            ].map(([val, label]) => (
              <div key={label} className="flex flex-col">
                <span className="text-lg font-bold text-white">{val}</span>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>

          {/* Info Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Bio Card (Full width on small, 2/3 on large) */}
            <div className="md:col-span-2 glass rounded-3xl p-6 border border-white/5">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center space-x-2">
                <Star size={12} className="text-secondary" />
                <span>About Me</span>
              </h3>
              {editing ? (
                <textarea
                  value={draft.bio}
                  onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                  placeholder="Share your vibe..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-all"
                />
              ) : (
                <p className="text-gray-300 text-sm leading-relaxed font-medium">
                  {profile.bio || "No bio yet. Tap edit to add one! ✨"}
                </p>
              )}
            </div>

            {/* University Card */}
            <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center space-x-2">
                <GraduationCap size={12} className="text-primary" />
                <span>University</span>
              </h3>
              <div>
                {editing ? (
                  <select
                    value={draft.university}
                    onChange={e => setDraft(d => ({ ...d, university: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  >
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                ) : (
                  <p className="text-white font-black text-lg tracking-tight leading-tight">{profile.university}</p>
                )}
                <p className="text-[10px] text-primary font-bold uppercase mt-2 tracking-widest">Verified Student</p>
              </div>
            </div>

            {/* Social Bento Item */}
            <div className="glass rounded-3xl p-6 border border-white/5 md:row-span-2">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center space-x-2">
                <AtSign size={12} className="text-accent" />
                <span>Connect</span>
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center glow-primary">
                    <Instagram size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Insta</p>
                    <p className="text-sm font-bold text-white truncate">@{profile.instagram || 'link_me'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black" xmlns="http://www.w3.org/2000/svg"><path d="M12.166.003C9.813.003 6.096 1.49 5.98 5.856l-.006.637c-.003.317-.017.633-.024.95a.366.366 0 01-.225.32c-.186.077-.497.013-.747-.047a4.026 4.026 0 00-.973-.148c-.407 0-.763.094-.958.352-.24.32-.168.747.218 1.148.073.075.17.16.275.248.497.412 1.247 1.035 1.047 1.653-.296.903-2.099 3.084-4.565 3.413a.412.412 0 00-.35.446c.025.245.15.515.413.725.578.455 1.559.7 2.914.733.174.006.32.074.4.234.084.17.168.52.253.854.15.584.333 1.3.723 1.3.211 0 .437-.096.695-.197.506-.2 1.197-.475 2.265-.475.796 0 1.52.245 2.279.503.855.287 1.74.58 2.803.58.991 0 1.868-.273 2.68-.534.777-.25 1.49-.484 2.246-.484 1.067 0 1.744.274 2.24.474.26.101.487.197.7.197.388 0 .572-.718.721-1.3.085-.333.17-.685.254-.854.08-.16.226-.228.4-.234 1.354-.032 2.335-.278 2.913-.733.264-.21.388-.48.413-.725a.412.412 0 00-.35-.446c-2.466-.329-4.27-2.51-4.565-3.413-.2-.618.544-1.24 1.046-1.653a2.52 2.52 0 00.276-.248c.386-.401.457-.828.218-1.148-.195-.258-.55-.352-.958-.352-.339 0-.685.06-.973.148-.249.06-.56.124-.747.047a.366.366 0 01-.225-.32c-.007-.317-.021-.633-.024-.95l-.007-.637C17.9 1.49 14.518.003 12.166.003z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Snap</p>
                    <p className="text-sm font-bold text-white truncate">@{profile.snapchat || 'snap_id'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Hub - Referrals & Rewards */}
            <div className="md:col-span-3 glass rounded-3xl p-8 border border-white/5 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 mt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 flex items-center space-x-2">
                    <Award size={14} />
                    <span>Growth Hub</span>
                  </h3>
                  <h2 className="text-2xl font-black text-white tracking-tight">Invite friends, earn rewards. 💎</h2>
                  <p className="text-gray-400 text-sm font-medium">Unlock premium features by bringing your batchmates to CollageAdda.</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="glass-dark px-6 py-4 rounded-3xl border border-white/10 text-center flex flex-col min-w-[120px]">
                    <span className="text-2xl font-black text-white">{stored.points || 50}</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Adda Points</span>
                  </div>
                  <div className="glass-dark px-6 py-4 rounded-3xl border border-white/10 text-center flex flex-col min-w-[120px]">
                    <span className="text-2xl font-black text-white">{stored.inviteCount || 0}</span>
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest mt-1">Invites</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                {/* Referral Code Card */}
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Gift size={80} className="text-white" />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Your Referral Code</p>
                  <div className="flex items-center space-x-3">
                    <div className="bg-dark/50 border border-white/10 rounded-2xl px-5 py-3 font-black text-xl text-primary tracking-widest uppercase flex-1">
                      {stored.referralCode || 'ADDA2026'}
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(stored.referralCode || 'ADDA2026');
                        showToast('Code copied to clipboard!', 'success');
                      }}
                      className="p-4 rounded-2xl bg-primary/20 text-primary hover:bg-primary/30 transition-all"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                  <button className="w-full mt-4 flex items-center justify-center space-x-2 py-3 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                    <Share2 size={16} />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>

                {/* Milestones Card */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Milestones</p>
                  {[
                    { label: '3 Invites', reward: 'Unlock Profile Viewers', progress: Math.min((stored.inviteCount || 0) / 3 * 100, 100) },
                    { label: '5 Invites', reward: 'Premium Match Filters', progress: Math.min((stored.inviteCount || 0) / 5 * 100, 100) },
                    { label: '10 Invites', reward: 'Campus Pioneer Badge', progress: Math.min((stored.inviteCount || 0) / 10 * 100, 100) },
                  ].map((m, i) => (
                    <div key={i} className="glass-dark p-4 rounded-2xl border border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-white">{m.reward}</span>
                        <span className="text-gray-500">{m.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${m.progress}%` }}
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>


            {/* Recent Activity Stub - Modern Look */}
            <div className="md:col-span-3 glass rounded-3xl p-6 border border-white/5">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center space-x-2">
                <BookOpen size={12} className="text-secondary" />
                <span>Recent Activity</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square rounded-2xl bg-white/5 flex items-center justify-center group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden shadow-lg">
                    <img src={`https://picsum.photos/seed/post${i}adda/400`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppShell>
  );
}
