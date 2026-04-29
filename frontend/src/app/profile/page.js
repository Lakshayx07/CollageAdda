"use client";
import { useEffect, useState } from "react";
import { LogOut, Edit3, Instagram, X, Check, Plus, Grid, Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const MOCK_POSTS = [
  { id: 1, img: "https://picsum.photos/seed/post1/300/300", likes: 124, comments: 18 },
  { id: 2, img: "https://picsum.photos/seed/post2/300/300", likes: 89, comments: 42 },
  { id: 3, img: "https://picsum.photos/seed/post3/300/300", likes: 342, comments: 89 },
  { id: 4, img: "https://picsum.photos/seed/post4/300/300", likes: 56, comments: 12 },
  { id: 5, img: "https://picsum.photos/seed/post5/300/300", likes: 211, comments: 33 },
  { id: 6, img: "https://picsum.photos/seed/post6/300/300", likes: 178, comments: 27 },
];

const MOCK_FOLLOWERS = [
  { id: 1, name: "Priya Sharma", university: "Rishihood University", avatar: "https://i.pravatar.cc/150?u=priya1" },
  { id: 2, name: "Arjun Mehta", university: "Delhi University", avatar: "https://i.pravatar.cc/150?u=arjun1" },
  { id: 3, name: "Sneha Gupta", university: "Amity University", avatar: "https://i.pravatar.cc/150?u=sneha1" },
];

const MOCK_FOLLOWING = [
  { id: 4, name: "Ravi Kumar", university: "IIT Delhi", avatar: "https://i.pravatar.cc/150?u=ravi1" },
  { id: 5, name: "Asha Patel", university: "DTU", avatar: "https://i.pravatar.cc/150?u=asha1" },
];

const INTEREST_OPTIONS = ["Music 🎵", "Cricket 🏏", "Coding 💻", "Art 🎨", "Travel ✈️", "Gaming 🎮", "Books 📚", "Fitness 💪", "Movies 🎬", "Cooking 🍳"];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null); // 'followers' | 'following' | 'edit'
  const [editData, setEditData] = useState({ instaId: "", snapId: "", interests: [] });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("collegeadda_user");
    if (!stored) { router.push("/login"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    const profile = JSON.parse(localStorage.getItem("collegeadda_profile") || "{}");
    setEditData({ instaId: profile.instaId || "", snapId: profile.snapId || "", interests: profile.interests || [] });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/login");
  };

  const saveProfile = () => {
    localStorage.setItem("collegeadda_profile", JSON.stringify(editData));
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); }, 1200);
  };

  const toggleInterest = (interest) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  if (!user) return null;

  const profile = JSON.parse(typeof window !== "undefined" ? (localStorage.getItem("collegeadda_profile") || "{}") : "{}");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{user.name?.split(" ")[0] || "Profile"}</h1>
        <button onClick={handleLogout} className="flex items-center space-x-1 text-muted hover:text-red-400 transition-colors text-sm">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full">
        {/* Instagram-style Profile Header */}
        <div className="p-4 space-y-4">
          {/* Avatar + Stats Row */}
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full p-[3px] flex-shrink-0" style={{ background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}>
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center text-2xl font-bold text-foreground">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-1 justify-around">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{MOCK_POSTS.length}</p>
                <p className="text-xs text-muted">Posts</p>
              </div>
              <button className="text-center hover:opacity-70 transition-opacity" onClick={() => setModal("followers")}>
                <p className="text-lg font-bold text-foreground">{MOCK_FOLLOWERS.length}</p>
                <p className="text-xs text-muted">Followers</p>
              </button>
              <button className="text-center hover:opacity-70 transition-opacity" onClick={() => setModal("following")}>
                <p className="text-lg font-bold text-foreground">{MOCK_FOLLOWING.length}</p>
                <p className="text-xs text-muted">Following</p>
              </button>
            </div>
          </div>

          {/* Name + Bio */}
          <div>
            <p className="font-bold text-foreground">{user.name}</p>
            <p className="text-xs text-muted">{user.university}</p>

            {/* Social Links */}
            {(profile.instaId || profile.snapId) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.instaId && (
                  <a
                    href={`https://instagram.com/${profile.instaId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs px-3 py-1 rounded-full text-white font-medium hover:scale-105 transition-transform"
                    style={{ background: "linear-gradient(135deg, #f09433, #dc2743, #bc1888)" }}
                  >
                    <Instagram size={12} />
                    <span>@{profile.instaId}</span>
                  </a>
                )}
                {profile.snapId && (
                  <a
                    href={`https://snapchat.com/add/${profile.snapId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs px-3 py-1 rounded-full font-medium hover:scale-105 transition-transform"
                    style={{ background: "#FFFC00", color: "#000" }}
                  >
                    <span>👻</span>
                    <span>{profile.snapId}</span>
                  </a>
                )}
              </div>
            )}

            {/* Interests */}
            {profile.interests?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profile.interests.map(i => (
                  <span key={i} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{i}</span>
                ))}
              </div>
            )}
          </div>

          {/* Edit Profile Button */}
          <button
            onClick={() => setModal("edit")}
            className="w-full py-2 rounded-xl border border-border/50 bg-surface-hover text-sm font-semibold text-foreground flex items-center justify-center space-x-2 hover:border-primary/40 transition-colors"
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Posts Grid Divider */}
        <div className="flex items-center justify-center border-t border-border/50 py-2">
          <Grid size={18} className="text-foreground" />
        </div>

        {/* Instagram-style Posts Grid */}
        <div className="grid grid-cols-3 gap-[2px]">
          {MOCK_POSTS.map(post => (
            <div key={post.id} className="relative group aspect-square overflow-hidden">
              <img src={post.img} alt="post" className="w-full h-full object-cover" />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                <span className="flex items-center space-x-1 text-white text-xs font-bold">
                  <Heart size={14} className="fill-white" />
                  <span>{post.likes}</span>
                </span>
                <span className="flex items-center space-x-1 text-white text-xs font-bold">
                  <MessageCircle size={14} className="fill-white" />
                  <span>{post.comments}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL: Followers ── */}
      {modal === "followers" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md bg-surface rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">Followers</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted" /></button>
            </div>
            <div className="space-y-3">
              {MOCK_FOLLOWERS.map(f => (
                <div key={f.id} className="flex items-center space-x-3">
                  <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{f.name}</p>
                    <p className="text-xs text-muted">{f.university}</p>
                  </div>
                  <button className="text-xs text-primary font-medium border border-primary/30 px-3 py-1 rounded-xl hover:bg-primary/10 transition-colors">
                    Follow back
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Following ── */}
      {modal === "following" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md bg-surface rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">Following</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted" /></button>
            </div>
            <div className="space-y-3">
              {MOCK_FOLLOWING.map(f => (
                <div key={f.id} className="flex items-center space-x-3">
                  <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{f.name}</p>
                    <p className="text-xs text-muted">{f.university}</p>
                  </div>
                  <button className="text-xs text-muted font-medium border border-border/50 px-3 py-1 rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors">
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit Profile ── */}
      {modal === "edit" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md bg-surface rounded-t-3xl p-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">Edit Profile</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-muted" /></button>
            </div>

            <div className="space-y-4">
              {/* Instagram ID */}
              <div>
                <label className="text-xs text-muted mb-1 block">Instagram Username</label>
                <div className="flex items-center bg-surface-hover border border-border/50 rounded-xl overflow-hidden">
                  <span className="px-3 text-sm" style={{ color: "#bc1888" }}>@</span>
                  <input
                    value={editData.instaId}
                    onChange={e => setEditData(prev => ({ ...prev, instaId: e.target.value.replace("@", "") }))}
                    placeholder="your_instagram"
                    className="flex-1 bg-transparent py-3 pr-4 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Snapchat ID */}
              <div>
                <label className="text-xs text-muted mb-1 block">Snapchat Username</label>
                <div className="flex items-center bg-surface-hover border border-border/50 rounded-xl overflow-hidden">
                  <span className="px-3 text-lg">👻</span>
                  <input
                    value={editData.snapId}
                    onChange={e => setEditData(prev => ({ ...prev, snapId: e.target.value }))}
                    placeholder="your_snapchat"
                    className="flex-1 bg-transparent py-3 pr-4 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="text-xs text-muted mb-2 block">Interests (select up to 5)</label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(interest => {
                    const selected = editData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        disabled={!selected && editData.interests.length >= 5}
                        className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full border transition-all ${
                          selected
                            ? "bg-primary/20 text-primary border-primary/40 font-medium"
                            : "bg-surface-hover text-muted border-border/50 hover:border-primary/30 disabled:opacity-40"
                        }`}
                      >
                        {selected && <Check size={10} />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveProfile}
                className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {saved ? <><Check size={18} /><span>Saved!</span></> : <><span>Save Changes</span></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
