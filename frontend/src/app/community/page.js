"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users2, Globe, Plus, CheckCircle2, Loader2, X, AlertCircle, ArrowRight, Flame, Sparkles, MessageCircle, Camera, Gamepad2, Code2, Send, Briefcase, Music, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { supabase } from "../../utils/supabase";
import { getAuthenticatedSupabaseClient } from "../../utils/supabaseAuthUser";

function JoinSparkles({ active }) {
  const pieces = Array.from({ length: 34 }, (_, index) => ({
    id: index,
    left: 8 + ((index * 19) % 84),
    delay: ((index * 7) % 35) / 100,
    duration: 1.9 + ((index * 11) % 9) / 10,
    size: 14 + ((index * 5) % 12),
    drift: ((index * 23) % 80) - 40,
  }));

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none fixed inset-0 z-[220] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ y: -40, x: 0, opacity: 0, rotate: 0, scale: 0.8 }}
              animate={{ y: "105vh", x: piece.drift, opacity: [0, 1, 1, 0], rotate: 260, scale: [0.8, 1.15, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: piece.duration, delay: piece.delay, ease: "easeIn" }}
              className="absolute top-0 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.65)]"
              style={{ left: `${piece.left}%`, fontSize: piece.size }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default function CommunityPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const queryClient = useQueryClient();
  
  // UI States
  const [joiningCommunityId, setJoiningCommunityId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all | my | public | invite
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [communityToast, setCommunityToast] = useState(null);
  const [showJoinSparkles, setShowJoinSparkles] = useState(false);
  
  // Create Form States
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [communityTags, setCommunityTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [communityPrivacy, setCommunityPrivacy] = useState("public");
  const [creatingCommunity, setCreatingCommunity] = useState(false);

  const popularTags = ["Cultural", "Sports", "Hackathons", "Design", "Academics", "Gaming", "Music", "Startups"];

  // -- TanStack Query: Communities --
  const { data: communities = [], isLoading: communitiesLoading } = useQuery({
    queryKey: ['community-list'],
    queryFn: async () => {
      const { client: authSupabase } = await getAuthenticatedSupabaseClient();
      const { data, error } = await authSupabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!supabase && isMounted,
    staleTime: 5 * 60 * 1000,
  });

  // -- TanStack Query: Memberships --
  const { data: membershipSet = new Set() } = useQuery({
    queryKey: ['community-memberships'],
    queryFn: async () => {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      setCurrentUserId(authUser.id);
      const { data, error } = await authSupabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", authUser.id);
      if (error) throw error;
      return new Set(data?.map(m => m.community_id) || []);
    },
    enabled: !!supabase && isMounted,
    staleTime: 5 * 60 * 1000,
  });

  const { data: unreadCounts = {} } = useQuery({
    queryKey: ['community-unread-counts', currentUserId, communities.map(c => c.id).join(",")],
    queryFn: async () => {
      if (!currentUserId || communities.length === 0) return {};
      const { client: authSupabase } = await getAuthenticatedSupabaseClient();
      const { data, error } = await authSupabase
        .from("community_messages")
        .select("community_id,sender_id,created_at")
        .in("community_id", communities.map(c => c.id))
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      return (data || []).reduce((acc, msg) => {
        if (msg.sender_id === currentUserId) return acc;
        const seenAt = localStorage.getItem(`community_seen_${msg.community_id}`);
        if (seenAt && new Date(msg.created_at) <= new Date(seenAt)) return acc;
        acc[msg.community_id] = (acc[msg.community_id] || 0) + 1;
        return acc;
      }, {});
    },
    enabled: !!supabase && isMounted && !!currentUserId && communities.length > 0,
    staleTime: 30 * 1000,
  });

  const loading = !isMounted || communitiesLoading;

  const communityThemes = {
    sports: { gradient: "from-sky-100 via-sky-200 to-cyan-100", soft: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: Users2 },
    gaming: { gradient: "from-violet-100 via-purple-200 to-indigo-100", soft: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", icon: Gamepad2 },
    tech: { gradient: "from-emerald-100 via-green-200 to-teal-100", soft: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: Code2 },
    business: { gradient: "from-amber-100 via-yellow-200 to-orange-100", soft: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Briefcase },
    art: { gradient: "from-rose-100 via-pink-200 to-orange-100", soft: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: Palette },
    music: { gradient: "from-fuchsia-100 via-pink-200 to-purple-100", soft: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200", icon: Music },
    default: { gradient: "from-amber-100 via-orange-200 to-yellow-100", soft: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: MessageCircle },
  };

  const getCommunityTheme = (community) => {
    const haystack = [community?.name, community?.description, ...(community?.tags || [])].join(" ").toLowerCase();
    if (haystack.includes("sport")) return communityThemes.sports;
    if (haystack.includes("gaming") || haystack.includes("esport") || haystack.includes("game")) return communityThemes.gaming;
    if (haystack.includes("tech") || haystack.includes("code") || haystack.includes("hack")) return communityThemes.tech;
    if (haystack.includes("business") || haystack.includes("startup")) return communityThemes.business;
    if (haystack.includes("art") || haystack.includes("design")) return communityThemes.art;
    if (haystack.includes("music")) return communityThemes.music;
    return communityThemes.default;
  };

  const showToast = (type, msg) => {
    setCommunityToast({ type, msg });
    setTimeout(() => setCommunityToast(null), 3500);
  };

  const triggerJoinSparkles = () => {
    setShowJoinSparkles(true);
    setTimeout(() => setShowJoinSparkles(false), 2600);
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
    } catch (e) {
      router.push("/login");
    }
  }, [router]);


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

      queryClient.setQueryData(['community-memberships'], (prev) => new Set([...(prev || []), community.id]));
      queryClient.setQueryData(['community-list'], (prev) => (prev || []).map(c => 
        c.id === community.id ? { ...c, member_count: (c.member_count || 1) + 1 } : c
      ));
      
      showToast('success', community.privacy === 'invite_only' ? 'Request sent! 🎉' : `Joined ${community.name}! 🎉`);
      triggerJoinSparkles();
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
        queryClient.setQueryData(['community-list'], (prev) => [inserted, ...(prev || [])]);
        queryClient.setQueryData(['community-memberships'], (prev) => new Set([...(prev || []), inserted.id]));
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
    if (categoryFilter) {
      const haystack = [c.name, c.description, ...(c.tags || [])].join(" ").toLowerCase();
      return haystack.includes(categoryFilter.toLowerCase());
    }
    return true; // "all"
  });

  const trendingCommunities = [...communities]
    .sort((a, b) => (b.member_count || 0) - (a.member_count || 0))
    .slice(0, 3);
  const categoryItems = [
    { label: "Sports", icon: Globe, idle: "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100 hover:border-sky-200", active: "bg-sky-100 text-sky-800 border-sky-300" },
    { label: "Gaming", icon: Gamepad2, idle: "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100 hover:border-violet-200", active: "bg-violet-100 text-violet-800 border-violet-300" },
    { label: "Tech", icon: Code2, idle: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200", active: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    { label: "Business", icon: Briefcase, idle: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:border-amber-200", active: "bg-amber-100 text-amber-800 border-amber-300" },
    { label: "Art & Design", icon: Palette, idle: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100 hover:border-rose-200", active: "bg-rose-100 text-rose-800 border-rose-300" },
    { label: "Music", icon: Music, idle: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 hover:bg-fuchsia-100 hover:border-fuchsia-200", active: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300" },
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 lg:pb-8 pt-[70px] lg:pt-0">
      <div className="w-full max-w-[1380px] mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6">
          <main className="min-w-0">
            <section className="relative overflow-hidden rounded-[1.5rem] bg-white border border-[#EEE7DD] shadow-sm mb-6">
              <div className="grid min-h-[210px] md:grid-cols-[0.92fr_1.08fr]">
                <div className="relative z-10 p-5 md:p-6 flex flex-col justify-between gap-6">
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm mb-4">
                      <Users2 size={23} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#151515] tracking-normal flex items-center gap-2">
                      Communities <Sparkles className="text-orange-400" size={21} />
                    </h1>
                    <p className="text-sm md:text-base text-[#585858] mt-3 font-semibold leading-relaxed max-w-xl">
                      Discover, join and connect with student communities across all campuses.
                    </p>
                  </div>

                  <div className="flex overflow-x-auto hide-scrollbar gap-2.5 pb-1">
                    {["all", "my", "public", "invite"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab);
                          setCategoryFilter("");
                        }}
                        className={clsx(
                          "px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer",
                          activeTab === tab
                            ? "bg-gradient-to-r from-amber-300 to-orange-300 text-[#1A1A1A] border-amber-200 shadow-lg shadow-orange-300/20"
                            : "bg-white/90 text-[#333333] border-[#ECE6DD] hover:border-amber-200 hover:text-amber-700"
                        )}
                      >
                        {tab === "all" && "All Communities"}
                        {tab === "my" && "My Communities"}
                        {tab === "public" && "Public"}
                        {tab === "invite" && "Invite Only"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative hidden md:block overflow-hidden">
                  <div className="absolute inset-y-6 right-0 left-0 rounded-l-[3rem] bg-gradient-to-br from-amber-50 via-orange-100/70 to-white" />
                  <div className="absolute right-[-70px] bottom-[-100px] w-[300px] h-[300px] rounded-full border-[24px] border-amber-200/50" />
                  <div className="absolute right-[-32px] bottom-[-70px] w-[235px] h-[235px] rounded-full border border-orange-300/30" />
                  <div className="absolute right-12 top-8 w-11 h-11 rotate-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-amber-600">
                    <Send size={22} />
                  </div>
                  <div className="absolute left-[38%] top-[43%] w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl flex items-center justify-center">
                    <MessageCircle size={26} />
                  </div>
                  <div className="absolute left-[52%] top-[62%] w-10 h-10 rounded-2xl bg-white shadow-lg flex items-center justify-center text-amber-600">
                    <Users2 size={19} />
                  </div>
                  {[
                    ["D", "left-[22%] top-[24%]", "bg-orange-100"],
                    ["A", "left-[18%] top-[58%]", "bg-emerald-100"],
                    ["R", "left-[62%] top-[30%]", "bg-white"],
                  ].map(([initial, pos, bg]) => (
                    <div key={initial} className={`absolute ${pos} w-12 h-12 rounded-full ${bg} border-4 border-white shadow-lg flex items-center justify-center font-black text-[#1A1A1A]`}>
                      {initial}
                    </div>
                  ))}
                  <div className="absolute left-[25%] top-[31%] w-[54%] h-px border-t border-dashed border-amber-300/60 rotate-12" />
                  <div className="absolute left-[27%] top-[58%] w-[35%] h-px border-t border-dashed border-amber-300/60 -rotate-12" />
                </div>
              </div>
            </section>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Flame size={19} />
                </div>
                <h2 className="text-xl font-black text-[#1A1A1A]">Top Communities</h2>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            ) : filteredCommunities.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E6E0] shadow-sm flex flex-col items-center">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                  <Globe size={32} className="text-orange-500" />
                </div>
                <h3 className="text-xl font-black text-[#1A1A1A] mb-2">No communities found</h3>
                <p className="text-[#6B6B6B] text-sm max-w-sm mb-6 font-medium">
                  {activeTab === "all" ? "Be the first to start a community and bring students together!" : "Try selecting a different filter or explore all communities."}
                </p>
                {activeTab === "all" && (
                  <button onClick={() => setShowCreateModal(true)} className="text-orange-600 font-bold text-sm hover:underline cursor-pointer">
                    + Create one now
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCommunities.map((comm) => {
                  const isMember = membershipSet.has(comm.id);
                  const isJoining = joiningCommunityId === comm.id;
                  const theme = getCommunityTheme(comm);
                  const Icon = theme.icon;
                  const unread = unreadCounts[comm.id] || 0;

                  return (
                    <div key={comm.id} className="bg-white rounded-[1.1rem] overflow-hidden border border-[#ECE6DD] shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all flex flex-col">
                      <div className={`h-[56px] w-full bg-gradient-to-r ${theme.gradient} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.55),transparent_26%),radial-gradient(circle_at_78%_10%,rgba(255,255,255,0.28),transparent_22%)]" />
                        {(comm.member_count || 0) >= (trendingCommunities[0]?.member_count || Infinity) && (
                          <span className="absolute right-4 top-4 rounded-full bg-black/25 text-white text-[10px] font-black px-3 py-1 shadow-sm">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="px-4 pb-4 pt-0 flex-1 flex flex-col relative">
                        <div className={`relative z-10 w-[46px] h-[46px] rounded-2xl ${theme.soft} ${theme.text} border-4 border-white flex items-center justify-center font-black text-xl shadow-lg -mt-5 mb-2.5`}>
                          <Icon size={22} />
                        </div>

                        <div className="mb-auto">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 onClick={() => router.push(`/community/${comm.id}`)} className="text-base font-black text-[#1A1A1A] leading-tight cursor-pointer hover:text-amber-700 transition-colors line-clamp-1">
                              {comm.name}
                            </h3>
                            {comm.privacy === 'invite_only' && (
                              <span className="bg-gray-100 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                                Private
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#333333] line-clamp-1 font-bold">
                            {comm.description || "Student community"}
                          </p>
                          <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed mt-2 min-h-[34px] font-medium">
                            {comm.description ? "Join conversations, share ideas and grow with students who care about the same things." : "A space for students to connect, collaborate and keep the conversation moving."}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {(comm.tags || []).slice(0, 3).map(tag => (
                              <span key={tag} className={`text-[11px] ${theme.soft} ${theme.text} px-3 py-1 rounded-full font-black`}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#F0ECE5]">
                          <div className="flex items-center gap-2 text-xs font-black text-[#555555] mb-3">
                            <Users2 size={16} className="text-[#1A1A1A]" />
                            {comm.member_count} member{comm.member_count !== 1 ? 's' : ''}
                          </div>

                          {isMember ? (
                            <button
                              onClick={() => router.push(`/community/${comm.id}`)}
                              className={clsx(
                                "relative w-full flex items-center justify-center gap-2 rounded-2xl border bg-transparent px-4 py-2 text-sm font-black transition-all cursor-pointer hover:bg-black/[0.02]",
                                theme.text,
                                theme.border
                              )}
                            >
                              Explore Now
                              <ArrowRight size={16} />
                              {unread > 0 && (
                                <span className="absolute -right-2 -top-2 min-w-7 h-7 px-2 rounded-full bg-[#1A1A1A] text-white text-xs font-black flex items-center justify-center shadow-lg">
                                  +{unread > 99 ? "99" : unread}
                                </span>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinCommunity(comm)}
                              disabled={isJoining}
                              className={clsx(
                                "w-full flex items-center justify-center gap-2 rounded-2xl border bg-transparent px-4 py-2 text-sm font-black transition-all disabled:opacity-50 cursor-pointer hover:bg-black/[0.02]",
                                theme.text,
                                theme.border
                              )}
                            >
                              {isJoining ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                              {comm.privacy === 'invite_only' ? 'Request to Join' : 'Join Community'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          <aside className="space-y-5 xl:sticky xl:top-6 self-start">
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-orange-50 border border-[#ECE6DD] rounded-[1.35rem] shadow-sm p-6 min-h-[190px]">
              <div className="relative z-10">
                <h3 className="text-lg font-black text-[#1A1A1A] mb-3">Create Community</h3>
                <p className="text-sm text-[#666666] font-semibold leading-relaxed mb-5">
                  Start your own community and bring like-minded students together.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-amber-300 to-orange-300 hover:from-amber-400 hover:to-orange-400 text-[#1A1A1A] px-5 py-3 rounded-2xl text-sm font-black shadow-lg shadow-orange-300/20 flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={17} />
                  Create Community
                </button>
              </div>
              <div className="absolute right-5 top-14 w-20 h-20 rotate-12 rounded-[1.5rem] bg-white shadow-lg flex items-center justify-center text-amber-500">
                <Users2 size={36} />
              </div>
            </div>

            <div className="bg-white border border-[#ECE6DD] rounded-[1.35rem] shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl leading-none" aria-hidden="true">🔥</span>
                <h3 className="text-lg font-black text-[#1A1A1A]">Trending Communities</h3>
              </div>
              <div className="space-y-5">
                {trendingCommunities.map((comm) => {
                  const theme = getCommunityTheme(comm);
                  const Icon = theme.icon;
                  return (
                    <button
                      key={comm.id}
                      onClick={() => router.push(`/community/${comm.id}`)}
                      className="w-full flex items-center gap-4 text-left rounded-2xl p-2 hover:bg-[#FAF7F1] transition-colors cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-2xl ${theme.soft} ${theme.text} flex items-center justify-center shrink-0`}>
                        <Icon size={23} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-[#1A1A1A] truncate">{comm.name}</p>
                        <p className="text-xs text-[#777777] font-bold mt-0.5">{comm.member_count || 0} member{comm.member_count !== 1 ? 's' : ''}</p>
                      </div>
                      <ArrowRight size={16} className={theme.text} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-[#ECE6DD] rounded-[1.35rem] shadow-sm p-6">
              <h3 className="text-lg font-black text-[#1A1A1A] mb-5">Categories</h3>
              <div className="grid grid-cols-2 gap-3">
                {categoryItems.map(({ label, icon: Icon, idle, active }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setActiveTab("all");
                      setCategoryFilter(categoryFilter === label ? "" : label);
                    }}
                    className={clsx(
                      "flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-black transition-colors cursor-pointer",
                      categoryFilter === label ? active : idle
                    )}
                  >
                    <Icon size={17} />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
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
      <JoinSparkles active={showJoinSparkles} />
    </div>
  );
}
