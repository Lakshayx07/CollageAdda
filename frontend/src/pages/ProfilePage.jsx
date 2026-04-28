import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, Instagram, Edit3, GraduationCap, Mail,
  Users, BookOpen, Star, Save, CheckCircle, AtSign
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
        {/* Banner */}
        <div className="h-36 md:h-48 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 80% 20%, #a855f7 0%, transparent 60%)' }} />
          {editing && (
            <button className="absolute top-4 right-4 flex items-center space-x-1.5 glass px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white transition-colors">
              <Camera size={13} />
              <span>Change Banner</span>
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
                  <button onClick={handleCancel} className="px-4 py-2 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all">
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    {saved ? <CheckCircle size={15} /> : <Save size={15} />}
                    <span>Save Profile</span>
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl glass border border-gray-700 text-sm font-medium text-white hover:border-primary transition-all"
                >
                  <Edit3 size={15} />
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

          {/* Info Cards */}
          <div className="space-y-3">

            {/* University */}
            <div className="glass rounded-2xl border border-gray-800/50 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
                <GraduationCap size={13} />
                <span>University</span>
              </h3>
              {editing ? (
                <select
                  value={draft.university}
                  onChange={e => setDraft(d => ({ ...d, university: e.target.value }))}
                  className="w-full bg-dark/60 border border-gray-700/50 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-primary/60 transition-colors"
                >
                  {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              ) : (
                <p className="text-white font-medium">{profile.university}</p>
              )}
            </div>

            {/* Email */}
            <div className="glass rounded-2xl border border-gray-800/50 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
                <Mail size={13} />
                <span>Email</span>
              </h3>
              <p className="text-white font-medium text-sm">{profile.email}</p>
            </div>

            {/* Social Handles */}
            <div className="glass rounded-2xl border border-gray-800/50 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 flex items-center space-x-2">
                <AtSign size={13} />
                <span>Social Handles</span>
              </h3>

              <div className="space-y-3">
                {/* Instagram */}
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400 flex items-center justify-center flex-shrink-0">
                    <Instagram size={17} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Instagram</p>
                    {editing ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-sm">@</span>
                        <input
                          value={draft.instagram}
                          onChange={e => setDraft(d => ({ ...d, instagram: e.target.value.replace('@', '') }))}
                          placeholder="your_handle"
                          className="flex-1 bg-transparent border-b border-gray-700 text-white text-sm outline-none focus:border-pink-400 transition-colors pb-0.5"
                        />
                      </div>
                    ) : (
                      profile.instagram
                        ? <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors">@{profile.instagram}</a>
                        : <span className="text-gray-600 text-sm italic">Not set — tap Edit to add</span>
                    )}
                  </div>
                </div>

                {/* Snapchat */}
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-300 flex items-center justify-center flex-shrink-0">
                    {/* Snapchat ghost icon via SVG */}
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.166.003C9.813.003 6.096 1.49 5.98 5.856l-.006.637c-.003.317-.017.633-.024.95a.366.366 0 01-.225.32c-.186.077-.497.013-.747-.047a4.026 4.026 0 00-.973-.148c-.407 0-.763.094-.958.352-.24.32-.168.747.218 1.148.073.075.17.16.275.248.497.412 1.247 1.035 1.047 1.653-.296.903-2.099 3.084-4.565 3.413a.412.412 0 00-.35.446c.025.245.15.515.413.725.578.455 1.559.7 2.914.733.174.006.32.074.4.234.084.17.168.52.253.854.15.584.333 1.3.723 1.3.211 0 .437-.096.695-.197.506-.2 1.197-.475 2.265-.475.796 0 1.52.245 2.279.503.855.287 1.74.58 2.803.58.991 0 1.868-.273 2.68-.534.777-.25 1.49-.484 2.246-.484 1.067 0 1.744.274 2.24.474.26.101.487.197.7.197.388 0 .572-.718.721-1.3.085-.333.17-.685.254-.854.08-.16.226-.228.4-.234 1.354-.032 2.335-.278 2.913-.733.264-.21.388-.48.413-.725a.412.412 0 00-.35-.446c-2.466-.329-4.27-2.51-4.565-3.413-.2-.618.544-1.24 1.046-1.653a2.52 2.52 0 00.276-.248c.386-.401.457-.828.218-1.148-.195-.258-.55-.352-.958-.352-.339 0-.685.06-.973.148-.249.06-.56.124-.747.047a.366.366 0 01-.225-.32c-.007-.317-.021-.633-.024-.95l-.007-.637C17.9 1.49 14.518.003 12.166.003z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Snapchat</p>
                    {editing ? (
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-sm">@</span>
                        <input
                          value={draft.snapchat}
                          onChange={e => setDraft(d => ({ ...d, snapchat: e.target.value.replace('@', '') }))}
                          placeholder="your_snap_id"
                          className="flex-1 bg-transparent border-b border-gray-700 text-white text-sm outline-none focus:border-yellow-400 transition-colors pb-0.5"
                        />
                      </div>
                    ) : (
                      profile.snapchat
                        ? <span className="text-yellow-400 text-sm font-medium">@{profile.snapchat}</span>
                        : <span className="text-gray-600 text-sm italic">Not set — tap Edit to add</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Year, Interests & Goals */}
            <div className="glass rounded-2xl border border-gray-800/50 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 flex items-center space-x-2">
                <Star size={13} />
                <span>Interests & Goals</span>
              </h3>

              <div className="space-y-4">
                {/* Year */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">College Year</p>
                  {editing ? (
                    <select
                      value={draft.year}
                      onChange={e => setDraft(d => ({ ...d, year: e.target.value }))}
                      className="w-full bg-dark/60 border border-gray-700/50 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-primary/60"
                    >
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                      {profile.year}
                    </span>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {editing ? (
                      INTEREST_OPTIONS.map(interest => (
                        <button
                          key={interest}
                          onClick={() => {
                            const newInterests = draft.interests.includes(interest)
                              ? draft.interests.filter(i => i !== interest)
                              : [...draft.interests, interest];
                            setDraft(d => ({ ...d, interests: newInterests }));
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            draft.interests.includes(interest)
                              ? 'bg-primary text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {interest}
                        </button>
                      ))
                    ) : (
                      profile.interests && profile.interests.length > 0 ? (
                        profile.interests.map(i => (
                          <span key={i} className="px-3 py-1 rounded-full bg-gray-800/80 text-gray-300 text-xs border border-gray-700/50">
                            {i}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-600 text-xs italic">No interests selected</span>
                      )
                    )}
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {editing ? (
                      GOAL_OPTIONS.map(goal => (
                        <button
                          key={goal}
                          onClick={() => {
                            const newGoals = draft.goals.includes(goal)
                              ? draft.goals.filter(g => g !== goal)
                              : [...draft.goals, goal];
                            setDraft(d => ({ ...d, goals: newGoals }));
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            draft.goals.includes(goal)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {goal}
                        </button>
                      ))
                    ) : (
                      profile.goals && profile.goals.length > 0 ? (
                        profile.goals.map(g => (
                          <span key={g} className="px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-400 text-xs border border-indigo-800/30">
                            {g}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-600 text-xs italic">No goals selected</span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Stub */}
            <div className="glass rounded-2xl border border-gray-800/50 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
                <BookOpen size={13} />
                <span>Recent Activity</span>
              </h3>
              <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center group cursor-pointer hover:opacity-80 transition-opacity overflow-hidden">
                    <img src={`https://picsum.photos/seed/post${i}adda/200`} alt="" className="w-full h-full object-cover" />
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
