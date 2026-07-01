"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users2, Globe, Plus, CheckCircle2, Loader2, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { supabase } from "../../utils/supabase";
import { getAuthenticatedSupabaseClient } from "../../utils/supabaseAuthUser";

export default function CommunityPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);
  
  // Data States
  const [communities, setCommunities] = useState([]);
  const [membershipSet, setMembershipSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [joiningCommunityId, setJoiningCommunityId] = useState(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState("all"); // all | my | public | invite
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [communityToast, setCommunityToast] = useState(null);
  
  // Create Form States
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [communityTags, setCommunityTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [communityPrivacy, setCommunityPrivacy] = useState("public");
  const [creatingCommunity, setCreatingCommunity] = useState(false);

  const popularTags = ["Cultural", "Sports", "Hackathons", "Design", "Academics", "Gaming", "Music", "Startups"];

  const communityGradients = [
    "from-amber-400 to-orange-500",
    "from-violet-500 to-purple-600",
    "from-teal-400 to-cyan-500",
    "from-rose-400 to-pink-500",
    "from-emerald-400 to-green-500",
    "from-blue-400 to-indigo-500",
  ];

  const getCommunityGradient = (id) => {
    if (!id) return communityGradients[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
    return communityGradients[Math.abs(hash) % communityGradients.length];
  };

  const showToast = (type, msg) => {
    setCommunityToast({ type, msg });
    setTimeout(() => setCommunityToast(null), 3500);
  };

  const fetchData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const [commRes, memRes] = await Promise.all([
        authSupabase.from("communities").select("*").order("created_at", { ascending: false }),
        authSupabase.from("community_members").select("community_id").eq("user_id", authUser.id)
      ]);
      
      if (commRes.data) setCommunities(commRes.data);
      if (memRes.data) setMembershipSet(new Set(memRes.data.map(m => m.community_id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("collegeadda_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(parsed);
      fetchData();
    } catch (e) {
      router.push("/login");
    }
  }, []);


  const handleJoinCommunity = async (community) => {
    if (!supabase) return;
    const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
    const currentUserId = authUser.id;
    if (!currentUserId || membershipSet.has(community.id)) return;
    
    setJoiningCommunityId(community.id);
    try {
      const { error: memberError } = await authSupabase
        .from("community_members")
        .insert([{ community_id: community.id, user_id: currentUserId, role: 'member' }]);
        
      if (memberError && memberError.code !== '23505') throw memberError;

      await authSupabase
        .from("communities")
        .update({ member_count: (community.member_count || 1) + 1 })
        .eq("id", community.id);

      setMembershipSet(prev => new Set([...prev, community.id]));
      setCommunities(prev => prev.map(c => 
        c.id === community.id ? { ...c, member_count: (c.member_count || 1) + 1 } : c
      ));
      
      showToast('success', community.privacy === 'invite_only' ? 'Request sent! 🎉' : `Joined ${community.name}! 🎉`);
    } catch (err) {
      showToast('error', err.message || 'Failed to join community.');
    } finally {
      setJoiningCommunityId(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!communityName.trim() || !supabase) return;

    setCreatingCommunity(true);
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const communityPayload = {
        name: communityName.trim(),
        description: communityDescription.trim(),
        tags: communityTags,
        privacy: communityPrivacy,
        created_by: authUser.id,
        member_count: 1
      };

      if (!communityPayload.created_by) {
        throw new Error("Community creation payload is missing created_by");
      }

      const { data: inserted, error } = await authSupabase
        .from("communities")
        .insert(communityPayload)
        .select()
        .single();

      if (error) {
        console.error("Community creation failed:", error);
        throw error;
      }

      if (inserted?.id) {
        await authSupabase.from("community_members").insert([{
          community_id: inserted.id,
          user_id: authUser.id,
          role: 'owner'
        }]);
        setCommunities(prev => [inserted, ...prev]);
        setMembershipSet(prev => new Set([...prev, inserted.id]));
      }

      setCommunityName("");
      setCommunityDescription("");
      setCommunityTags([]);
      setShowCreateModal(false);
      showToast('success', 'Community created! 🎉');
    } catch (error) {
      console.error("Community creation failed:", error);
      showToast('error', error.message || 'Failed to create community.');
    } finally {
      setCreatingCommunity(false);
    }
  };

  const handleTagToggle = (tag) => {
    if (communityTags.includes(tag)) {
      setCommunityTags(communityTags.filter(t => t !== tag));
    } else if (communityTags.length < 3) {
      setCommunityTags([...communityTags, tag]);
    }
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    const clean = customTag.trim().replace(/^#/, '');
    if (!clean) return;
    if (communityTags.includes(clean)) { setCustomTag(""); return; }
    if (communityTags.length >= 3) { showToast('error', 'Max 3 tags allowed!'); return; }
    setCommunityTags([...communityTags, clean]);
    setCustomTag("");
  };

  const filteredCommunities = communities.filter(c => {
    if (activeTab === "my") return membershipSet.has(c.id);
    if (activeTab === "public") return c.privacy === "public";
    if (activeTab === "invite") return c.privacy === "invite_only";
    return true; // "all"
  });

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F9F8F5] pb-24 lg:pb-8 pt-[70px] lg:pt-0">
      <div className="w-full max-w-none p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#1A1A1A] flex items-center gap-3">
              <Users2 className="text-[#C8922A]" size={32} />
              Communities
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-1 font-medium">
              Discover and join global student groups across all campuses.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            Create Community
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
          {["all", "my", "public", "invite"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer",
                activeTab === tab
                  ? "bg-[#FCF5E5] text-[#C8922A] border-[#C8922A] shadow-sm"
                  : "bg-white text-[#6B6B6B] border-[#E8E6E0] hover:bg-[#F3F2EE]"
              )}
            >
              {tab === "all" && "All Communities"}
              {tab === "my" && "My Communities"}
              {tab === "public" && "Public"}
              {tab === "invite" && "Invite Only"}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#C8922A]" size={32} />
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E6E0] shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4">
              <Globe size={32} className="text-[#C8922A]" />
            </div>
            <h3 className="text-xl font-black text-[#1A1A1A] mb-2">No communities found</h3>
            <p className="text-[#6B6B6B] text-sm max-w-sm mb-6 font-medium">
              {activeTab === "all" ? "Be the first to start a community and bring students together!" : "Try selecting a different filter or explore all communities."}
            </p>
            {activeTab === "all" && (
              <button onClick={() => setShowCreateModal(true)} className="text-[#C8922A] font-bold text-sm hover:underline cursor-pointer">
                + Create one now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCommunities.map((comm) => {
              const isMember = membershipSet.has(comm.id);
              const isJoining = joiningCommunityId === comm.id;
              const grad = getCommunityGradient(comm.id);
              
              return (
                <div key={comm.id} className="bg-white rounded-3xl overflow-hidden border border-[#E8E6E0] shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  {/* Banner */}
                  <div className={`h-20 w-full bg-gradient-to-r ${grad} relative`} />
                  
                  <div className="px-6 pb-6 pt-0 flex-1 flex flex-col relative">
                    {/* Avatar floating over banner */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${grad} border-4 border-white flex items-center justify-center text-white font-black text-2xl shadow-sm -mt-8 mb-3`}>
                      {comm.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Content */}
                    <div className="mb-auto">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 onClick={() => router.push(`/community/${comm.id}`)} className="text-lg font-black text-[#1A1A1A] leading-tight cursor-pointer hover:text-[#C8922A] transition-colors line-clamp-1">
                          {comm.name}
                        </h3>
                        {comm.privacy === 'invite_only' && (
                          <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#6B6B6B] line-clamp-2 leading-relaxed min-h-[40px] font-medium">
                        {comm.description || "No description provided."}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {(comm.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-bold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#F3F2EE]">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#888888]">
                        <Users2 size={14} className="text-[#C8922A]" />
                        {comm.member_count} member{comm.member_count !== 1 ? 's' : ''}
                      </div>
                      
                      {isMember ? (
                        <button 
                          onClick={() => router.push(`/community/${comm.id}`)}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl transition-colors hover:bg-emerald-100 cursor-pointer"
                        >
                          <CheckCircle2 size={14} /> Open
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinCommunity(comm)}
                          disabled={isJoining}
                          className="text-xs font-bold text-white bg-[#1A1A1A] hover:bg-[#C8922A] px-5 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                          {isJoining && <Loader2 size={12} className="animate-spin" />}
                          {comm.privacy === 'invite_only' ? 'Request' : 'Join'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] p-6"
            >
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="absolute top-4 right-4 p-2 bg-[#F9F8F5] rounded-full text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <h3 className="text-xl font-black text-[#1A1A1A] mb-1">Create a Community</h3>
              <p className="text-xs text-[#888888] mb-6 font-medium">Build a space for students to connect, collaborate, and share.</p>

              <form onSubmit={handleCreateSubmit} className="space-y-4 overflow-y-auto pr-1">
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#6B6B6B] mb-1.5">Name</label>
                  <input
                    required value={communityName} onChange={e => setCommunityName(e.target.value)}
                    placeholder="e.g. Web Dev Club"
                    className="w-full bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl px-4 py-3 text-sm focus:border-[#C8922A] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#6B6B6B] mb-1.5">Description</label>
                  <textarea
                    required rows={3} value={communityDescription} onChange={e => setCommunityDescription(e.target.value)}
                    placeholder="What is this community about?"
                    className="w-full bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl px-4 py-3 text-sm focus:border-[#C8922A] outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#6B6B6B] mb-1.5">Tags (Max 3)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {popularTags.map(tag => (
                      <button
                        key={tag} type="button" onClick={() => handleTagToggle(tag)}
                        className={clsx("text-[10px] px-3 py-1 rounded-full font-bold border transition-colors cursor-pointer", communityTags.includes(tag) ? "bg-amber-50 border-amber-400 text-amber-600" : "bg-[#F9F8F5] border-[#E8E6E0] text-[#6B6B6B]")}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={customTag} onChange={e => setCustomTag(e.target.value)}
                      placeholder="Add custom tag..."
                      className="flex-1 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl px-3 py-2 text-xs focus:border-[#C8922A] outline-none"
                    />
                    <button type="button" onClick={handleAddCustomTag} className="px-4 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl text-xs font-bold text-[#6B6B6B] cursor-pointer">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {communityTags.filter(t => !popularTags.includes(t)).map(tag => (
                      <span key={tag} onClick={() => handleTagToggle(tag)} className="text-[10px] bg-amber-50 border border-amber-400 px-3 py-1 rounded-full text-amber-600 font-bold flex items-center gap-1 cursor-pointer">
                        #{tag} <X size={10} />
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-[#6B6B6B] mb-2">Privacy</label>
                  <div className="grid grid-cols-2 gap-2 bg-[#F9F8F5] p-1.5 rounded-xl border border-[#E8E6E0]">
                    <button type="button" onClick={() => setCommunityPrivacy("public")} className={clsx("py-2 rounded-lg text-xs font-bold transition-all cursor-pointer", communityPrivacy === "public" ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm" : "text-[#6B6B6B]")}>Public</button>
                    <button type="button" onClick={() => setCommunityPrivacy("invite_only")} className={clsx("py-2 rounded-lg text-xs font-bold transition-all cursor-pointer", communityPrivacy === "invite_only" ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm" : "text-[#6B6B6B]")}>Invite Only</button>
                  </div>
                </div>
                <button type="submit" disabled={creatingCommunity} className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all">
                  {creatingCommunity ? <><Loader2 className="animate-spin" size={16} /> Creating...</> : "Create Community"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {communityToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${communityToast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {communityToast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {communityToast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
