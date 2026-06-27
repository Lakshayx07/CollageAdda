"use client";

import { useEffect, useState } from "react";
import { LogOut, Edit3, X, Check, Plus, Grid, Heart, MessageCircle, Send, ChevronLeft, ChevronRight, Share2, Ghost, MapPin, Zap, Star, Camera, Clock, Image as ImageIcon, Music, Code, Palette, Plane, Gamepad2, Book, Dumbbell, Film, Utensils, Trophy, Briefcase } from "lucide-react";

const InstagramIcon = ({ size = 20 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import UniversityBadges from "@/components/UniversityBadges";
import VerifiedBadge from "@/components/VerifiedBadge";
import clsx from "clsx";
import { extractInstagramUsername } from "@/utils/socials";
import { saveProfileAvatarUrl, uploadAvatar } from "@/utils/supabaseUploads";

const INTEREST_OPTIONS = [
  { name: "Hackathons", icon: <Trophy size={12} /> },
  { name: "Music", icon: <Music size={12} /> },
  { name: "Coding", icon: <Code size={12} /> },
  { name: "Design", icon: <Palette size={12} /> },
  { name: "Gaming", icon: <Gamepad2 size={12} /> },
  { name: "Sports", icon: <Trophy size={12} /> },
  { name: "Placements", icon: <Briefcase size={12} /> },
  { name: "Startups", icon: <Zap size={12} /> },
  { name: "Content Creation", icon: <Film size={12} /> },
  { name: "Photography", icon: <Camera size={12} /> },
  { name: "Reading", icon: <Book size={12} /> },
  { name: "Cultural Events", icon: <Music size={12} /> }
];
const SPORT_OPTIONS = [
  { name: "Football", icon: <Trophy size={12} /> },
  { name: "Basketball", icon: <Trophy size={12} /> },
  { name: "Cricket", icon: <Trophy size={12} /> },
  { name: "Tennis", icon: <Trophy size={12} /> },
  { name: "Badminton", icon: <Trophy size={12} /> },
  { name: "Volleyball", icon: <Trophy size={12} /> },
  { name: "Table Tennis", icon: <Trophy size={12} /> },
  { name: "Athletics", icon: <Trophy size={12} /> },
  { name: "Swimming", icon: <Trophy size={12} /> },
  { name: "Chess", icon: <Trophy size={12} /> }
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [modal, setModal] = useState(null); 
  const [activePostIndex, setActivePostIndex] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [userStories, setUserStories] = useState([]);
  const [activeStories, setActiveStories] = useState([]);
  const [storyInput, setStoryInput] = useState({ imageUrl: "", caption: "" });
  const [storyUploading, setStoryUploading] = useState(false);
  const [viewingStoryIndex, setViewingStoryIndex] = useState(0);

  const [editData, setEditData] = useState({
    name: "",
    bio: "",
    profilePic: "",
    passOutBatch: "",
    course: "",
    branch: "",
    studyYear: "",
    phone: "",
    linkedin: "",
    github: "",
    instaId: "",
    snapId: "",
    interests: [],
    sports: []
  });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [unfollowingId, setUnfollowingId] = useState(null);
  const [activeTab, setActiveTab] = useState("about");

  const squadsCount = followers.filter(f => following.some(fol => fol._id === f._id || fol.id === f._id)).length;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      const stored = localStorage.getItem("collegeadda_user");
      const token = localStorage.getItem("collegeadda_token");
      if (!stored || !token) { router.push("/login"); return; }
      
      const u = JSON.parse(stored);
      setUser(u);
      
      try {
        const profileRes = await fetch(`${apiUrl}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
          localStorage.setItem("collegeadda_user", JSON.stringify(profileData));
          setEditData({ 
            name: profileData.name || "",
            bio: profileData.bio || "",
            profilePic: profileData.profilePic || "",
            passOutBatch: profileData.passOutBatch || "",
            course: profileData.course || "",
            branch: profileData.branch || "",
            studyYear: profileData.studyYear || profileData.year || "",
            phone: profileData.phone || "",
            linkedin: profileData.linkedin || "",
            github: profileData.github || "",
            instaId: profileData.instagram || "", 
            snapId: profileData.snapchat || "", 
            interests: profileData.interests || [], 
            sports: profileData.sports || [] 
          });
        }

        const postsRes = await fetch(`${apiUrl}/api/posts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          const myPosts = postsData.filter(p => p.author?._id === u._id || p.author?._id === u.id);
          
          if (myPosts.length > 0) {
            setUserPosts(myPosts.map(p => ({
              id: p._id,
              img: p.mediaUrl || "https://picsum.photos/seed/fallback/300/300",
              content: p.content,
              likes: p.likes?.length || 0,
              isLiked: p.likes?.includes(u._id || u.id),
              comments: p.comments?.length || 0,
              commentsList: p.comments?.map(c => ({
                id: c._id || Math.random().toString(),
                author: c.user?.name || "Student",
                text: c.text
              })) || []
            })));
          }
        }

        // Load stories from localStorage (24-hour expiry)
        try {
          const storedStories = JSON.parse(localStorage.getItem("collegeadda_stories") || "[]");
          const now = Date.now();
          const validStories = storedStories.filter(s => now - s.createdAt < 24 * 60 * 60 * 1000);
          if (validStories.length !== storedStories.length) {
            localStorage.setItem("collegeadda_stories", JSON.stringify(validStories));
          }
          setActiveStories(validStories);
          setUserStories(validStories);
        } catch (e) {
          setActiveStories([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchProfileAndPosts();

    const fetchSocial = async () => {
      try {
        const token = localStorage.getItem("collegeadda_token");
        const [followersRes, followingRes] = await Promise.all([
          fetch(`${apiUrl}/api/users/me/followers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/users/me/following`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (followersRes.ok) setFollowers(await followersRes.json());
        if (followingRes.ok) setFollowing(await followingRes.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchSocial();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/login");
  };

  const handleUnfollow = async (targetUserId) => {
    if (unfollowingId) return;
    setUnfollowingId(targetUserId);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/users/${targetUserId}/follow`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFollowing(prev => prev.filter(f => f._id !== targetUserId));
        setToastMsg("Unfollowed successfully");
        setTimeout(() => setToastMsg(""), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUnfollowingId(null);
    }
  };

  const saveProfile = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const res = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editData.name,
          bio: editData.bio,
          profilePic: editData.profilePic,
          passOutBatch: editData.passOutBatch,
          course: editData.course,
          branch: editData.branch,
          studyYear: editData.studyYear,
          phone: editData.phone,
          linkedin: editData.linkedin,
          github: editData.github,
          instagram: editData.instaId,
          snapchat: editData.snapId,
          interests: editData.interests,
          sports: editData.sports
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        await saveProfileAvatarUrl({
          userId: updatedUser._id || updatedUser.id,
          avatarUrl: updatedUser.profilePic,
          name: updatedUser.name,
          university: updatedUser.university
        });
        setUser(updatedUser);
        localStorage.setItem("collegeadda_user", JSON.stringify(updatedUser));
        setSaved(true);
        setTimeout(() => { setSaved(false); setModal(null); }, 1200);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to update profile: ${errorData.message || res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAvatarUploading(true);
    try {
      const userId = user?._id || user?.id;
      const { publicUrl } = await uploadAvatar(file, userId);
      await saveProfileAvatarUrl({
        userId,
        avatarUrl: publicUrl,
        name: editData.name || user?.name,
        university: user?.university
      });
      setEditData(prev => ({ ...prev, profilePic: publicUrl }));
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      alert(error.message || "Could not upload the profile picture.");
    } finally {
      setIsAvatarUploading(false);
      event.target.value = "";
    }
  };

  const toggleInterest = (interestName) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestName)
        ? prev.interests.filter(i => i !== interestName)
        : [...prev.interests, interestName]
    }));
  };

  const toggleSport = (sportName) => {
    setEditData(prev => ({
      ...prev,
      sports: prev.sports.includes(sportName)
        ? prev.sports.filter(s => s !== sportName)
        : [...prev.sports, sportName]
    }));
  };

  const handleAddStory = () => {
    if (!storyInput.imageUrl.trim()) return;
    setStoryUploading(true);
    try {
      const newStory = {
        id: Date.now().toString(),
        imageUrl: storyInput.imageUrl,
        caption: storyInput.caption,
        createdAt: Date.now(),
        user: { name: user.name, profilePic: user.profilePic }
      };
      const existing = JSON.parse(localStorage.getItem("collegeadda_stories") || "[]");
      const updated = [newStory, ...existing];
      localStorage.setItem("collegeadda_stories", JSON.stringify(updated));
      setActiveStories(updated);
      setUserStories(updated);
      setStoryInput({ imageUrl: "", caption: "" });
      setModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setStoryUploading(false);
    }
  };

  const hasActiveStory = activeStories.length > 0;

  if (!user) return null;

  return (
    <div className="page-shell profile-page relative overflow-x-hidden">
      {/* Background Decorative Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#C8922A]/10 blur-[150px] rounded-full z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/10 blur-[150px] rounded-full z-0" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Header - only show on mobile, sidebar handles desktop nav */}
      <header className="lg:hidden page-header sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-xl font-black text-[#1A1A1A] tracking-tight"
        >
          {user.name?.split(" ")[0]}<span className="text-[#C8922A]">.</span>
        </motion.h1>
        <div className="flex items-center space-x-3">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl text-[#6B6B6B] hover:text-[#1A1A1A] border border-[#E8E6E0]"
          >
            <Share2 size={20} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
            className="p-2.5 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl text-red-500/50 hover:text-red-500 border border-[#E8E6E0]"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-10 relative z-10 space-y-8">
        {/* Top Profile Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-[#E8E6E0]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1">
            {/* Avatar Area */}
            <div className="relative shrink-0">
              {hasActiveStory && (
                <div className="absolute -inset-1.5 rounded-full p-[3px] z-10 pointer-events-none"
                  style={{ background: "conic-gradient(from 0deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #a855f7, #7c3aed, #f09433)" }}
                >
                  <div className="w-full h-full rounded-full bg-[#FAFAF8]" />
                </div>
              )}
              <div className="relative w-28 h-28 rounded-full p-[3px] gradient-bg shadow-lg z-20">
                <div 
                  onClick={() => hasActiveStory ? setModal("viewStory") : null}
                  className={`w-full h-full rounded-full bg-[#FAFAF8] flex items-center justify-center overflow-hidden ${hasActiveStory ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
                >
                  {user.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7C3AED&color=fff`; }}
                      alt={user.name}
                    />
                  ) : (
                    <span className="text-3xl font-black text-[#1A1A1A]">{user.name?.charAt(0)}</span>
                  )}
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setModal("uploadChoice")}
                  className="absolute -bottom-1 -right-1 w-8 h-8 gradient-bg rounded-xl border-2 border-white flex items-center justify-center text-white shadow-md z-30"
                >
                  <Plus size={16} strokeWidth={3} />
                </motion.button>
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="text-center sm:text-left space-y-2.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{user.name}</h2>
                <VerifiedBadge user={user} size={18} />
              </div>
              
              <p className="text-xs text-[#6B6B6B] font-semibold">
                {[user.university, [user.course, user.branch].filter(Boolean).join(" · ")].filter(Boolean).join("  •  ")}
              </p>

              {user.bio && (
                <p className="text-sm font-medium text-[#4A4A4A] max-w-lg leading-relaxed">{user.bio}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#888888]">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#888888]" />
                  <span>{user.branch || "India"}</span>
                </div>
                {user.instagram && (
                  <a 
                    href={user.instagram.includes('http') ? user.instagram : `https://instagram.com/${user.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#C8922A] hover:underline"
                  >
                    <span className="text-xs">🔗</span>
                    <span>{extractInstagramUsername(user.instagram)}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 shrink-0">
            <button 
              onClick={() => setModal("edit")}
              className="px-6 py-2.5 bg-white border border-[#E8E6E0] rounded-xl text-xs font-bold text-[#1A1A1A] hover:bg-[#F9F8F5] transition-all"
            >
              Edit Profile
            </button>
            <button 
              className="p-2.5 bg-white border border-[#E8E6E0] rounded-xl text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F9F8F5] transition-all"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 py-4 text-center border-b border-[#F3F2EE]">
          {[
            { label: "Posts", value: userPosts.length },
            { label: "Followers", value: followers.length, action: () => setModal("followers") },
            { label: "Following", value: following.length, action: () => setModal("following") },
            { label: "Squads", value: squadsCount, action: () => setModal("followers") }
          ].map((stat) => (
            <button
              key={stat.label}
              disabled={!stat.action}
              onClick={stat.action}
              className="flex flex-col items-center group cursor-pointer"
            >
              <span className="text-lg font-extrabold text-[#1A1A1A] group-hover:scale-105 transition-transform">
                {stat.value}
              </span>
              <span className="text-xs text-[#888888] font-medium mt-0.5">{stat.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#F3F2EE] gap-6 text-sm font-semibold">
          {["about", "posts", "communities"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "pb-3 pt-1 capitalize relative transition-all",
                activeTab === tab 
                  ? "text-[#C8922A] font-bold" 
                  : "text-[#888888] hover:text-[#4A4A4A]"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C8922A]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-10">
            {/* Left Column: Details */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider">About</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  {user.bio || "No description provided."}
                </p>
              </div>
              
              <div className="space-y-3.5 pt-4 border-t border-[#F3F2EE] text-sm text-[#4A4A4A]">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏫</span>
                  <span>{user.university || "CampusAdda Member"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📍</span>
                  <span>{[user.course, user.branch].filter(Boolean).join(" · ") || "Student"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📅</span>
                  <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently"}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Badges, Socials, Interests */}
            <div className="space-y-8">
              {/* Badges */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#888888] uppercase tracking-wider">Badges</h4>
                <div className="flex items-center gap-2">
                  <UniversityBadges userId={user.id || user.email} />
                  {user.isVerified && (
                    <span className="ca-badge bg-[#FFF8EC] text-[#C8922A] border border-[#C8922A]/20">Verified User</span>
                  )}
                </div>
              </div>

              {/* Campus Socials */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#888888] uppercase tracking-wider">Campus Socials</h4>
                <div className="flex items-center gap-3">
                  {user.instagram && (
                    <a 
                      href={user.instagram.includes('http') ? user.instagram : `https://instagram.com/${user.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#F3F2EE] flex items-center justify-center text-[#4A4A4A] hover:bg-[#FFF8EC] hover:text-[#C8922A] transition-all"
                    >
                      <InstagramIcon size={18} />
                    </a>
                  )}
                  {user.linkedin && (
                    <a 
                      href={user.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#F3F2EE] flex items-center justify-center text-[#4A4A4A] hover:bg-[#FFF8EC] hover:text-[#C8922A] transition-all"
                    >
                      <Send size={16} />
                    </a>
                  )}
                  {user.github && (
                    <a 
                      href={user.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#F3F2EE] flex items-center justify-center text-[#4A4A4A] hover:bg-[#FFF8EC] hover:text-[#C8922A] transition-all"
                    >
                      <Code size={16} />
                    </a>
                  )}
                  {user.snapchat && (
                    <a 
                      href={`https://snapchat.com/add/${user.snapchat}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#F3F2EE] flex items-center justify-center text-[#4A4A4A] hover:bg-[#FFF8EC] hover:text-[#C8922A] transition-all"
                    >
                      <Ghost size={18} />
                    </a>
                  )}
                  {!user.instagram && !user.linkedin && !user.github && !user.snapchat && (
                    <span className="text-xs text-[#888888]">No social links added.</span>
                  )}
                </div>
              </div>

              {/* Interests & Sports */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#888888] uppercase tracking-wider">Interests & Sports</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(user.interests || []).map((i, idx) => (
                    <span key={idx} className="bg-[#F3F2EE] px-3 py-1.5 rounded-full text-xs font-semibold text-[#6B6B6B] border border-transparent hover:border-[#C8922A]/20 transition-all">
                      {i}
                    </span>
                  ))}
                  {(user.sports || []).map((s, idx) => (
                    <span key={idx} className="bg-[#FFF8EC] px-3 py-1.5 rounded-full text-xs font-semibold text-[#C8922A] border border-[#C8922A]/10">
                      {s}
                    </span>
                  ))}
                  {(user.interests || []).length === 0 && (user.sports || []).length === 0 && (
                    <span className="text-xs text-[#888888]">No interests or sports added.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div className="space-y-6 pb-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
              className="grid grid-cols-3 gap-2"
            >
              {userPosts.length === 0 ? (
                <div className="col-span-3 py-20 bg-white border border-[#E8E6E0] shadow-sm rounded-[2.5rem] border-dashed text-center">
                  <p className="text-xl font-black text-[#888888]">No Posts Yet</p>
                  <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-2">Your story starts here</p>
                </div>
              ) : (
                userPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    variants={{
                      hidden: { scale: 0.8, opacity: 0 },
                      visible: { scale: 1, opacity: 1 }
                    }}
                    whileHover={{ scale: 0.98 }}
                    onClick={() => { setActivePostIndex(idx); setModal("post"); }}
                    className="aspect-square rounded-[1.5rem] overflow-hidden relative group cursor-pointer border border-[#E8E6E0]"
                  >
                    <img src={post.img} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-[#C8922A]/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-4">
                      <div className="flex items-center text-white text-xs font-black">
                        <Heart size={14} className="fill-white mr-1" /> {post.likes}
                      </div>
                      <div className="flex items-center text-white text-xs font-black">
                        <MessageCircle size={14} className="fill-white mr-1" /> {post.comments}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        )}

        {activeTab === "communities" && (
          <div className="py-20 text-center border border-dashed border-[#E8E6E0] rounded-[2rem] bg-white shadow-sm">
            <p className="text-sm font-bold text-[#888888]">No communities joined yet.</p>
            <p className="text-xs text-[#888888] mt-1">Explore and join student-run clubs on CampusAdda.</p>
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-[#F3F2EE] backdrop-blur-xl border border-[#E8E6E0] shadow-xl px-6 py-3 rounded-full text-sm font-bold text-[#1A1A1A]"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* Followers/Following Modal */}
        {(modal === "followers" || modal === "following") && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] bg-white border border-[#E8E6E0] shadow-sm sm:rounded-[3rem]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E8E6E0] flex items-center justify-between">
                <h3 className="text-lg font-black text-[#1A1A1A] capitalize">{modal}</h3>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={20} /></button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {(modal === "followers" ? followers : following).length === 0 ? (
                  <div className="py-10 text-center text-[#888888] font-bold uppercase tracking-widest text-[10px]">No connections yet</div>
                ) : (
                  (modal === "followers" ? followers : following).map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-[#F3F2EE] rounded-[2rem] transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full p-[1.5px] gradient-bg">
                          <img 
                            src={f.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=7C3AED&color=fff`} 
                            className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0F]" 
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#1A1A1A] flex items-center">{f.name} <VerifiedBadge user={f} size={14} className="ml-1" /></p>
                          <p className="text-[10px] text-[#6B6B6B] font-bold uppercase">{f.university}</p>
                        </div>
                      </div>
                      {modal === "following" && (
                        <button 
                          onClick={() => handleUnfollow(f._id)}
                          disabled={unfollowingId === f._id}
                          className="px-4 py-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl text-[10px] font-black uppercase text-red-400 border border-red-500/10 disabled:opacity-50"
                        >
                          {unfollowingId === f._id ? "..." : "Unfollow"}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Modal */}
        {modal === "edit" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] bg-white border border-[#E8E6E0] shadow-sm sm:rounded-[3rem]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#E8E6E0] flex items-center justify-between">
                <h3 className="text-lg font-black text-[#1A1A1A]">Edit Vibe</h3>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={20} /></button>
              </div>
              <div className="max-h-[72dvh] space-y-6 overflow-y-auto p-5 custom-scrollbar sm:max-h-[70vh] sm:p-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Full Name</label>
                  <input
                    value={editData.name}
                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Profile Photo URL</label>
                  <input
                    value={editData.profilePic}
                    onChange={e => setEditData({ ...editData, profilePic: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="Image URL or uploaded avatar data"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Bio</label>
                  <input
                    maxLength={100}
                    value={editData.bio}
                    onChange={e => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="Final year CSE | Dev | CAT 2025 Aspirant"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Pass Out Batch</label>
                    <select
                      value={editData.passOutBatch}
                      onChange={e => setEditData({ ...editData, passOutBatch: e.target.value })}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    >
                      <option value="" className="bg-[#0A0A0F]">Select batch</option>
                      {["2024", "2025", "2026", "2027", "2028", "2029", "2030"].map(year => <option key={year} value={year} className="bg-[#0A0A0F]">{year}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Year of Study</label>
                    <select
                      value={editData.studyYear}
                      onChange={e => setEditData({ ...editData, studyYear: e.target.value })}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    >
                      <option value="" className="bg-[#0A0A0F]">Select year</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"].map(year => <option key={year} value={year} className="bg-[#0A0A0F]">{year}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Course</label>
                    <select
                      value={editData.course}
                      onChange={e => setEditData({ ...editData, course: e.target.value })}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    >
                      <option value="" className="bg-[#0A0A0F]">Select course</option>
                      {["B.Tech", "BCA", "MCA", "MBA", "B.Sc", "M.Tech", "B.Com", "BA", "Other"].map(course => <option key={course} value={course} className="bg-[#0A0A0F]">{course}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Branch</label>
                    <input
                      value={editData.branch}
                      onChange={e => setEditData({ ...editData, branch: e.target.value })}
                      className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                      placeholder="Computer Science, ECE, Marketing"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Private Phone</label>
                  <div className="flex rounded-2xl border border-[#E8E6E0] bg-black/30">
                    <span className="border-r border-[#E8E6E0] px-4 py-3 text-sm font-black text-[#6B6B6B]">+91</span>
                    <input
                      value={editData.phone}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <input
                    value={editData.linkedin}
                    onChange={e => setEditData({ ...editData, linkedin: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="LinkedIn URL"
                  />
                  <input
                    value={editData.github}
                    onChange={e => setEditData({ ...editData, github: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="GitHub URL"
                  />
                  <input
                    value={editData.instaId}
                    onChange={e => setEditData({ ...editData, instaId: e.target.value })}
                    className="w-full rounded-2xl border border-[#E8E6E0] bg-black/30 px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#C8922A]"
                    placeholder="Instagram username"
                  />
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(i => (
                      <button
                        key={i.name}
                        onClick={() => toggleInterest(i.name)}
                        className={clsx(
                          "px-4 py-2 rounded-full text-[10px] font-bold transition-all border flex items-center space-x-2",
                          editData.interests.includes(i.name) ? "gradient-bg text-[#1A1A1A] border-transparent" : "bg-[#F9F8F5] border border-[#E8E6E0] text-[#6B6B6B] border-[#E8E6E0]"
                        )}
                      >
                        {i.icon}
                        <span>{i.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sports */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-2">Sports</label>
                  <div className="flex flex-wrap gap-2">
                    {SPORT_OPTIONS.map(s => (
                      <button
                        key={s.name}
                        onClick={() => toggleSport(s.name)}
                        className={clsx(
                          "px-4 py-2 rounded-full text-[10px] font-bold transition-all border flex items-center space-x-2",
                          editData.sports.includes(s.name) ? "bg-yellow-500 text-black border-transparent font-black" : "bg-[#F9F8F5] border border-[#E8E6E0] text-[#6B6B6B] border-[#E8E6E0]"
                        )}
                      >
                        {s.icon}
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveProfile}
                  disabled={isSaving}
                  className="w-full gradient-bg py-5 rounded-[2rem] text-sm font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl shadow-[0_4px_14px_rgba(200,146,42,0.15)] disabled:opacity-50 flex justify-center items-center h-16"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-[#E8E6E0] border-t-white rounded-full animate-spin" />
                  ) : saved ? (
                    "Saved!"
                  ) : (
                    "Update Profile"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Post Detail Modal */}
        {modal === "post" && activePostIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/95 p-3 backdrop-blur-xl sm:items-center sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-[#E8E6E0] bg-white border border-[#E8E6E0] shadow-sm sm:max-h-[90vh] sm:rounded-[3rem]"
              onClick={e => e.stopPropagation()}
            >
              {/* Post Header */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl p-[1.5px] gradient-bg">
                    <img src={user.profilePic} className="w-full h-full rounded-[0.9rem] object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#1A1A1A]">{user.name}</p>
                    <p className="text-[10px] text-[#6B6B6B] font-bold uppercase">Memories</p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={20} /></button>
              </div>

              {/* Post Image */}
              <div className="relative aspect-square">
                 <img src={userPosts[activePostIndex].img} className="w-full h-full object-cover" />
                 {/* Navigation buttons */}
                 <div className="absolute inset-y-0 left-0 flex items-center px-2">
                   <button onClick={(e) => { e.stopPropagation(); if(activePostIndex > 0) setActivePostIndex(activePostIndex-1); }} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A]"><ChevronLeft size={20}/></button>
                 </div>
                 <div className="absolute inset-y-0 right-0 flex items-center px-2">
                   <button onClick={(e) => { e.stopPropagation(); if(activePostIndex < userPosts.length-1) setActivePostIndex(activePostIndex+1); }} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A]"><ChevronRight size={20}/></button>
                 </div>
              </div>

              {/* Post Actions */}
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Heart size={24} className={clsx("cursor-pointer transition-all", userPosts[activePostIndex].isLiked ? "text-red-500 fill-red-500 scale-110" : "text-[#6B6B6B] hover:text-red-500")} />
                    <MessageCircle size={24} className="text-[#6B6B6B] hover:text-[#C8922A]" />
                    <Send size={24} className="text-[#6B6B6B] hover:text-[#C8922A]" />
                  </div>
                  <div className="text-xs font-black text-[#6B6B6B] uppercase tracking-widest">{userPosts[activePostIndex].likes} Vibes</div>
                </div>
                
                <div className="space-y-4">
                   <p className="text-sm text-[#4A4A4A] leading-relaxed font-medium">
                     <span className="font-black mr-2">{user.name}</span>
                     {userPosts[activePostIndex].content || "No caption provided."}
                   </p>
                   
                   <div className="space-y-3 pt-4 border-t border-[#E8E6E0]">
                      {userPosts[activePostIndex].commentsList.map(c => (
                        <div key={c.id} className="flex items-start space-x-2 text-sm">
                          <span className="font-black text-[#1A1A1A] whitespace-nowrap">{c.author}</span>
                          <span className="text-[#6B6B6B]">{c.text}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Add Comment Input */}
              <div className="p-4 bg-[#F9F8F5] border border-[#E8E6E0]-panel border-t border-[#E8E6E0] flex items-center space-x-3">
                 <input 
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder="Drop a vibe..."
                  className="flex-1 bg-transparent text-sm text-[#1A1A1A] focus:outline-none font-medium"
                 />
                 <button className="text-[#C8922A] font-black uppercase text-[10px] tracking-widest">Post</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ====== UPLOAD CHOICE MODAL ====== */}
        {modal === "uploadChoice" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md space-y-4 rounded-[1.75rem] border border-[#E8E6E0] bg-[#111118] p-5 sm:rounded-[2.5rem] sm:p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-center text-lg font-black text-[#1A1A1A] tracking-tight mb-2">What do you want to add?</h3>
              <button
                onClick={() => setModal("editPic")}
                className="w-full flex items-center space-x-4 p-5 bg-white border border-[#E8E6E0] shadow-sm rounded-2xl border border-[#E8E6E0] hover:border-[#C8922A]/30 transition-all group"
              >
                <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-[#1A1A1A] shadow-lg">
                  <Camera size={22} />
                </div>
                <div className="text-left">
                  <p className="font-black text-[#1A1A1A] text-sm">Profile Picture</p>
                  <p className="text-[11px] text-[#6B6B6B] font-medium mt-0.5">Visible to everyone, always</p>
                </div>
              </button>
              <button
                onClick={() => setModal("addStory")}
                className="w-full flex items-center space-x-4 p-5 bg-white border border-[#E8E6E0] shadow-sm rounded-2xl border border-[#E8E6E0] hover:border-pink-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#1A1A1A] shadow-lg"
                  style={{ background: "linear-gradient(135deg, #f09433, #dc2743, #bc1888)" }}
                >
                  <ImageIcon size={22} />
                </div>
                <div className="text-left">
                  <p className="font-black text-[#1A1A1A] text-sm">Add Story</p>
                  <p className="text-[11px] text-[#6B6B6B] font-medium mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> Disappears after 24 hours
                  </p>
                </div>
              </button>
              <button onClick={() => setModal(null)} className="w-full py-3 text-[#6B6B6B] text-sm font-bold">Cancel</button>
            </motion.div>
          </motion.div>
        )}

        {/* ====== EDIT PROFILE PIC MODAL ====== */}
        {modal === "editPic" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md space-y-4 rounded-[1.75rem] border border-[#E8E6E0] bg-[#111118] p-5 sm:rounded-[2.5rem] sm:p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-[#1A1A1A]">Update Profile Picture</h3>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={18} /></button>
              </div>
              {/* Preview */}
              {editData.profilePic && (
                <div className="flex justify-center">
                  <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-2 border-purple-500/50 shadow-xl">
                    <img src={editData.profilePic} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {/* File picker button */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureFile}
                />
                <div className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed border-[#C8922A]/30 bg-purple-500/5 hover:bg-[#C8922A]/10 transition-all">
                  <Camera size={32} className="text-[#C8922A]" />
                  <p className="text-sm font-black text-[#6B6B6B]">Tap to choose from gallery</p>
                  <p className="text-[10px] text-[#6B6B6B]">JPG, PNG, WEBP — visible to everyone</p>
                </div>
              </label>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={saveProfile}
                disabled={!editData.profilePic || isAvatarUploading || isSaving}
                className="w-full gradient-bg py-4 rounded-2xl text-sm font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl shadow-[0_4px_14px_rgba(200,146,42,0.15)] disabled:opacity-40"
              >
                {isAvatarUploading ? "Uploading..." : saved ? "Saved! ✅" : "Save Picture"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ====== ADD STORY MODAL ====== */}
        {modal === "addStory" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-h-[92dvh] w-full max-w-md space-y-4 overflow-y-auto rounded-[1.75rem] border border-[#E8E6E0] bg-[#111118] p-5 custom-scrollbar sm:rounded-[2.5rem] sm:p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#1A1A1A]">Add Story</h3>
                  <p className="text-[11px] text-[#6B6B6B] font-medium flex items-center gap-1 mt-0.5"><Clock size={10} /> Visible for 24 hours only</p>
                </div>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-full text-[#6B6B6B]"><X size={18} /></button>
              </div>
              {/* Preview */}
              {storyInput.imageUrl && (
                <div className="relative w-full aspect-[9/16] max-h-64 rounded-2xl overflow-hidden border border-[#E8E6E0]">
                  <img src={storyInput.imageUrl} className="w-full h-full object-cover" />
                  {storyInput.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[#1A1A1A] text-sm font-bold text-center">{storyInput.caption}</p>
                    </div>
                  )}
                </div>
              )}
              {/* File picker */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () => setStoryInput(prev => ({ ...prev, imageUrl: reader.result }));
                    reader.readAsDataURL(file);
                  }}
                />
                {!storyInput.imageUrl ? (
                  <div className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10 transition-all">
                    <ImageIcon size={32} className="text-pink-400" />
                    <p className="text-sm font-black text-[#6B6B6B]">Tap to choose from gallery</p>
                    <p className="text-[10px] text-[#6B6B6B]">JPG, PNG, WEBP — disappears in 24h</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-pink-400 text-center font-bold">Tap to change photo</p>
                )}
              </label>
              <div className="space-y-1">
                <label className="text-[11px] text-[#6B6B6B] font-bold uppercase tracking-widest">Caption (optional)</label>
                <input
                  value={storyInput.caption}
                  onChange={e => setStoryInput(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Write something..."
                  className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-2xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-pink-500/50 transition-colors placeholder-white/20"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddStory}
                disabled={storyUploading || !storyInput.imageUrl.trim()}
                className="w-full py-4 rounded-2xl text-sm font-black text-[#1A1A1A] uppercase tracking-widest shadow-xl disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #f09433, #dc2743, #bc1888)" }}
              >
                {storyUploading ? "Adding..." : "Share Story"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* ====== VIEW STORY MODAL ====== */}
        {modal === "viewStory" && activeStories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black p-0 sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative flex h-[100dvh] w-full max-w-sm flex-col sm:h-full sm:max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Progress bars */}
              <div className="absolute top-4 left-4 right-4 z-20 flex space-x-1">
                {activeStories.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-[#F3F2EE] overflow-hidden">
                    <div className={`h-full bg-white rounded-full transition-all duration-300 ${i < viewingStoryIndex ? 'w-full' : i === viewingStoryIndex ? 'w-1/2' : 'w-0'}`} />
                  </div>
                ))}
              </div>
              {/* Header */}
              <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white">
                    {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-bg flex items-center justify-center text-[#1A1A1A] font-black text-sm">{user.name?.charAt(0)}</div>}
                  </div>
                  <div>
                    <p className="text-[#1A1A1A] font-black text-sm">{user.name}</p>
                    <p className="text-[#6B6B6B] text-[10px] flex items-center gap-1">
                      <Clock size={9} />
                      {Math.round((Date.now() - activeStories[viewingStoryIndex]?.createdAt) / 60000)}m ago · expires in {Math.round((24 * 60 - (Date.now() - activeStories[viewingStoryIndex]?.createdAt) / 60000))}m
                    </p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-2 bg-[#F3F2EE] rounded-full text-[#1A1A1A]"><X size={18} /></button>
              </div>
              {/* Story Image */}
              <div className="relative h-full w-full overflow-hidden sm:rounded-3xl">
                <img src={activeStories[viewingStoryIndex]?.imageUrl} className="w-full h-full object-cover" />
                {activeStories[viewingStoryIndex]?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[#1A1A1A] font-bold text-center text-base">{activeStories[viewingStoryIndex].caption}</p>
                  </div>
                )}
                {/* Tap zones */}
                <button className="absolute left-0 top-0 w-1/3 h-full" onClick={() => setViewingStoryIndex(Math.max(0, viewingStoryIndex - 1))} />
                <button className="absolute right-0 top-0 w-1/3 h-full" onClick={() => viewingStoryIndex < activeStories.length - 1 ? setViewingStoryIndex(viewingStoryIndex + 1) : setModal(null)} />
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
