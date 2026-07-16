"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Users2, Send, Loader2, Globe, CheckCircle2, 
  AlertCircle, LogOut, MoreVertical, Plus, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { supabase } from "../../../utils/supabase";
import { getAuthenticatedSupabaseClient } from "../../../utils/supabaseAuthUser";

export default function CommunityChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [activeCommunityId, setActiveCommunityId] = useState(id);

  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);
  
  // Data States
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [membershipSet, setMembershipSet] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isMember, setIsMember] = useState(false);
  const [role, setRole] = useState(null); // owner | member | null
  const [currentUserId, setCurrentUserId] = useState("");
  
  // Status/Loading States
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joiningCommunityId, setJoiningCommunityId] = useState(null);
  const [leaving, setLeaving] = useState(false);
  
  // Input / UI States
  const [inputText, setInputText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState(null);

  const scrollRef = useRef(null);
  const channelRef = useRef(null);

  const showToastMsg = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const communityGradients = [
    "from-amber-400 to-orange-500",
    "from-violet-500 to-purple-600",
    "from-teal-400 to-cyan-500",
    "from-rose-400 to-pink-500",
    "from-emerald-400 to-green-500",
    "from-blue-400 to-indigo-500",
  ];

  const getCommunityGradient = (commId) => {
    if (!commId) return communityGradients[0];
    let hash = 0;
    for (let i = 0; i < commId.length; i++) hash = (hash * 31 + commId.charCodeAt(i)) & 0xffffffff;
    return communityGradients[Math.abs(hash) % communityGradients.length];
  };

  const buildUnreadCounts = (rows, userId, openCommunityId = activeCommunityId) => {
    return (rows || []).reduce((acc, msg) => {
      if (msg.sender_id === userId) return acc;
      if (msg.community_id === openCommunityId) return acc;
      const seenAt = localStorage.getItem(`community_seen_${msg.community_id}`);
      if (seenAt && new Date(msg.created_at) <= new Date(seenAt)) return acc;
      acc[msg.community_id] = (acc[msg.community_id] || 0) + 1;
      return acc;
    }, {});
  };

  const fetchDetails = async (targetId = activeCommunityId, showPageLoader = false) => {
    if (!supabase || !targetId) {
      setLoading(false);
      return;
    }
    if (showPageLoader) setLoading(true);
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      setCurrentUserId(authUser.id);
      setIsMember(false);
      setRole(null);
      // Fetch community details
      const { data: comm, error: commErr } = await authSupabase
        .from("communities")
        .select("*")
        .eq("id", targetId)
        .single();

      if (commErr || !comm) {
        showToastMsg("error", "Community not found.");
        router.push("/community");
        return;
      }
      setCommunity(comm);

      const { data: allCommunities } = await authSupabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });
      if (allCommunities) setCommunities(allCommunities);

      const { data: memberships } = await authSupabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", authUser.id);
      const nextMembershipSet = new Set(memberships?.map(m => m.community_id) || []);
      setMembershipSet(nextMembershipSet);

      // Check membership
      const { data: member } = await authSupabase
        .from("community_members")
        .select("*")
        .eq("community_id", targetId)
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (member) {
        setIsMember(true);
        setRole(member.role);
      }

      // Fetch messages history
      const { data: msgs } = await authSupabase
        .from("community_messages")
        .select("*")
        .eq("community_id", targetId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (msgs) {
        setMessages(msgs);
        const lastMessageAt = msgs[msgs.length - 1]?.created_at || new Date().toISOString();
        localStorage.setItem(`community_seen_${targetId}`, lastMessageAt);
      }

      if ((allCommunities || []).length > 0) {
        const { data: recentMessages } = await authSupabase
          .from("community_messages")
          .select("community_id,sender_id,created_at")
          .in("community_id", allCommunities.map(c => c.id))
          .order("created_at", { ascending: false })
          .limit(500);
        setUnreadCounts(buildUnreadCounts(recentMessages, authUser.id, targetId));
      }

      // Subscribe to Realtime messages
      if (channelRef.current) {
        authSupabase.removeChannel(channelRef.current);
      }
      const channel = authSupabase
        .channel(`community:${targetId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "community_messages",
            filter: `community_id=eq.${targetId}`,
          },
          (payload) => {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
            localStorage.setItem(`community_seen_${targetId}`, payload.new.created_at);
          }
        )
        .subscribe();
      channelRef.current = channel;
    } catch (err) {
      console.error("Error fetching community info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    return () => {
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setActiveCommunityId(id);
  }, [id]);

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
      fetchDetails(activeCommunityId, !community);
    } catch (e) {
      router.push("/login");
    }
  }, [activeCommunityId]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !isMember || !supabase) return;

    const senderName = user?.name || "Anonymous Student";
    const senderAvatar = user?.profilePicture || "";

    const content = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const senderId = authUser.id;
      if (!senderId) {
        showToastMsg("error", "Please log in again before sending a message.");
        return;
      }
      setCurrentUserId(senderId);

      const { data, error } = await authSupabase
        .from("community_messages")
        .insert([{
          community_id: activeCommunityId,
          sender_id: senderId,
          sender_name: senderName,
          sender_avatar: senderAvatar,
          content: content
        }])
        .select()
        .single();

      if (error) {
        showToastMsg("error", "Failed to send message.");
        setInputText(content); // restore content
      } else if (data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    } catch (err) {
      console.error(err);
      showToastMsg("error", "Network error. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleJoin = async () => {
    if (!supabase || joining) return;

    setJoining(true);
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const memberUserId = authUser.id;
      if (!memberUserId) return;
      setCurrentUserId(memberUserId);

      const { error: memberError } = await authSupabase
        .from("community_members")
        .insert([{ community_id: activeCommunityId, user_id: memberUserId, role: 'member' }]);

      if (memberError && memberError.code !== '23505') throw memberError;

      // Update community member count
      const newCount = (community?.member_count || 0) + 1;
      await authSupabase
        .from("communities")
        .update({ member_count: newCount })
        .eq("id", activeCommunityId);

      setCommunity((prev) => ({ ...prev, member_count: newCount }));
      setMembershipSet(prev => new Set([...prev, activeCommunityId]));
      setCommunities(prev => prev.map(comm => (
        comm.id === activeCommunityId ? { ...comm, member_count: newCount } : comm
      )));
      localStorage.setItem(`community_seen_${activeCommunityId}`, new Date().toISOString());
      setIsMember(true);
      setRole('member');
      showToastMsg("success", "You joined the community! 🎉");

      // Reload messages
      const { data: msgs } = await authSupabase
        .from("community_messages")
        .select("*")
        .eq("community_id", activeCommunityId)
        .order("created_at", { ascending: true });
      if (msgs) setMessages(msgs);
    } catch (err) {
      showToastMsg("error", "Failed to join community.");
    } finally {
      setJoining(false);
    }
  };

  const handleJoinCommunity = async (targetCommunity) => {
    if (!supabase || joiningCommunityId || membershipSet.has(targetCommunity.id)) return;

    setJoiningCommunityId(targetCommunity.id);
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const memberUserId = authUser.id;
      if (!memberUserId) return;
      setCurrentUserId(memberUserId);

      const { error: memberError } = await authSupabase
        .from("community_members")
        .insert([{ community_id: targetCommunity.id, user_id: memberUserId, role: 'member' }]);

      if (memberError && memberError.code !== '23505') throw memberError;

      const newCount = (targetCommunity.member_count || 0) + 1;
      await authSupabase
        .from("communities")
        .update({ member_count: newCount })
        .eq("id", targetCommunity.id);

      localStorage.setItem(`community_seen_${targetCommunity.id}`, new Date().toISOString());
      setMembershipSet(prev => new Set([...prev, targetCommunity.id]));
      setCommunities(prev => prev.map(comm => (
        comm.id === targetCommunity.id ? { ...comm, member_count: newCount } : comm
      )));
      if (targetCommunity.id === activeCommunityId) {
        setCommunity(prev => ({ ...prev, member_count: newCount }));
        setIsMember(true);
        setRole('member');
      }
      showToastMsg("success", `Joined ${targetCommunity.name}!`);
    } catch (err) {
      showToastMsg("error", "Failed to join community.");
    } finally {
      setJoiningCommunityId(null);
    }
  };

  const handleOpenCommunity = (targetId) => {
    if (!targetId || targetId === activeCommunityId) return;
    window.history.pushState(null, "", `/community/${targetId}`);
    setActiveCommunityId(targetId);
    setUnreadCounts(prev => ({ ...prev, [targetId]: 0 }));
    localStorage.setItem(`community_seen_${targetId}`, new Date().toISOString());
  };

  const handleLeave = async () => {
    if (!supabase || leaving || !isMember) return;

    const confirmLeave = window.confirm("Are you sure you want to leave this community?");
    if (!confirmLeave) return;

    setLeaving(true);
    setShowMenu(false);
    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const memberUserId = authUser.id;
      if (!memberUserId) return;
      setCurrentUserId(memberUserId);

      const { error } = await authSupabase
        .from("community_members")
        .delete()
        .eq("community_id", activeCommunityId)
        .eq("user_id", memberUserId);

      if (error) throw error;

      // Update community member count
      const newCount = Math.max(0, (community?.member_count || 1) - 1);
      await authSupabase
        .from("communities")
        .update({ member_count: newCount })
        .eq("id", activeCommunityId);

      setCommunity((prev) => ({ ...prev, member_count: newCount }));
      setMembershipSet(prev => {
        const next = new Set(prev);
        next.delete(activeCommunityId);
        return next;
      });
      setCommunities(prev => prev.map(comm => (
        comm.id === activeCommunityId ? { ...comm, member_count: newCount } : comm
      )));
      setIsMember(false);
      setRole(null);
      showToastMsg("success", "You left the community.");
    } catch (err) {
      showToastMsg("error", "Failed to leave community.");
    } finally {
      setLeaving(false);
    }
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F5] flex items-center justify-center pt-[70px] lg:pt-0">
        <Loader2 className="animate-spin text-[#C8922A]" size={32} />
      </div>
    );
  }

  const grad = getCommunityGradient(activeCommunityId);
  const railCommunities = [...communities].sort((a, b) => {
    if (a.id === activeCommunityId) return -1;
    if (b.id === activeCommunityId) return 1;
    return (b.member_count || 0) - (a.member_count || 0);
  });

  return (
    <div className="min-h-screen bg-[#F9F8F5] pt-[70px] lg:pt-0 h-screen lg:grid lg:grid-cols-[330px_minmax(0,1fr)]">
      <aside className="hidden lg:flex min-h-0 flex-col border-r border-[#E8E6E0] bg-white/70 backdrop-blur-sm">
        <div className="px-5 py-5 flex items-center gap-3 shrink-0">
          <button
            onClick={() => router.push("/community")}
            className="p-2 hover:bg-[#F3F2EE] rounded-xl text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-black text-[#1A1A1A]">Communities</h1>
        </div>

        <div className="px-5 pb-3 text-xs font-black text-[#1A1A1A]">Your communities</div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4 custom-scrollbar">
          {railCommunities.map((comm) => {
            const cardGrad = getCommunityGradient(comm.id);
            const active = comm.id === activeCommunityId;
            const member = membershipSet.has(comm.id);
            const isJoiningCard = joiningCommunityId === comm.id;
            const unread = unreadCounts[comm.id] || 0;

            return (
              <div
                key={comm.id}
                className={clsx(
                  "bg-white rounded-[1.35rem] overflow-hidden border shadow-sm transition-all",
                  active ? "border-[#D8A128] shadow-lg shadow-amber-500/10" : "border-[#E8E6E0] hover:shadow-md"
                )}
              >
                <div className={`h-12 w-full bg-gradient-to-r ${cardGrad} relative`}>
                  {active && (
                    <span className="absolute right-4 top-3 rounded-full bg-black/25 text-white text-[10px] font-black px-3 py-1">
                      Open
                    </span>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <div className={`relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br ${cardGrad} border-4 border-white flex items-center justify-center text-white font-black text-lg shadow-sm -mt-5 mb-3 leading-none`}>
                    {comm.name?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-black text-[#1A1A1A] text-base leading-tight truncate">{comm.name}</h3>
                  <p className="text-xs font-bold text-[#333333] line-clamp-1 mt-1">{comm.description || "Student community"}</p>
                  <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed mt-2 font-medium">
                    Join conversations, share ideas and grow together.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(comm.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-black">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-4">
                    <div className="flex items-center gap-2 text-xs font-black text-[#555555]">
                      <Users2 size={15} />
                      {comm.member_count || 0} member{comm.member_count !== 1 ? 's' : ''}
                    </div>
                    {!active && member && (
                      <button
                        onClick={() => handleOpenCommunity(comm.id)}
                        className="relative flex items-center gap-1.5 rounded-2xl bg-amber-50 text-[#C8922A] px-4 py-2 text-xs font-black cursor-pointer hover:bg-amber-100"
                      >
                        Explore Now <ArrowRight size={14} />
                        {unread > 0 && (
                          <span className="absolute -right-2 -top-2 min-w-6 h-6 px-1.5 rounded-full bg-[#1A1A1A] text-white text-[10px] font-black flex items-center justify-center">
                            +{unread > 99 ? "99" : unread}
                          </span>
                        )}
                      </button>
                    )}
                    {!active && !member && (
                      <button
                        onClick={() => handleJoinCommunity(comm)}
                        disabled={isJoiningCard}
                        className="flex items-center gap-1.5 rounded-2xl bg-white border border-[#E0AE52] text-[#C8922A] px-4 py-2 text-xs font-black cursor-pointer hover:bg-amber-50 disabled:opacity-50"
                      >
                        {isJoiningCard ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <section className="min-h-0 h-full flex flex-col">
      {/* Community Header */}
      <div className="bg-white border-b border-[#E8E6E0] px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => router.push("/community")}
            className="p-2 hover:bg-[#F3F2EE] rounded-xl text-[#6B6B6B] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-black shrink-0`}>
            {community?.name?.charAt(0).toUpperCase()}
          </div>
          
          <div className="min-w-0">
            <h2 className="font-black text-[#1A1A1A] leading-tight truncate text-base">
              {community?.name}
            </h2>
            <p className="text-xs text-[#888888] font-semibold flex items-center gap-1.5 mt-0.5">
              <span>{community?.member_count} member{community?.member_count !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="capitalize">{community?.privacy?.replace('_', ' ')}</span>
            </p>
          </div>
        </div>

        <div className="relative">
          {isMember && (
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-[#F3F2EE] rounded-xl text-[#6B6B6B] transition-colors cursor-pointer"
            >
              <MoreVertical size={18} />
            </button>
          )}

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-1 w-48 bg-white border border-[#E8E6E0] rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                >
                  <button
                    onClick={handleLeave}
                    disabled={role === 'owner'}
                    className={clsx(
                      "w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-bold transition-colors cursor-pointer",
                      role === 'owner' 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-red-600 hover:bg-red-50"
                    )}
                  >
                    <LogOut size={14} />
                    Leave Community
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0 bg-[#F9F8F5] custom-scrollbar">
        {/* Info Box */}
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 border border-[#E8E6E0] shadow-sm text-center mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-black text-xl mx-auto mb-3 shadow-sm`}>
            {community?.name?.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-black text-[#1A1A1A] text-lg leading-tight">{community?.name}</h3>
          <p className="text-xs text-[#888888] font-semibold mt-1">Created on {new Date(community?.created_at).toLocaleDateString()}</p>
          <p className="text-xs text-[#6B6B6B] leading-relaxed mt-3 font-medium bg-[#F9F8F5] p-3 rounded-2xl border border-[#E8E6E0]/60">
            {community?.description || "Welcome to the group! Start talking and collaborating."}
          </p>
        </div>

        {/* Message bubbles */}
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === currentUserId;
          const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
          
          return (
            <div key={msg.id} className={clsx("flex w-full mb-1", isMe ? "justify-end" : "justify-start")}>
              {!isMe && showAvatar && (
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-xs text-amber-800 border border-amber-200 mr-2 shrink-0 self-end mb-1">
                  {msg.sender_name.charAt(0).toUpperCase()}
                </div>
              )}
              {!isMe && !showAvatar && <div className="w-8 mr-2 shrink-0" />}

              <div className={clsx("flex flex-col max-w-[75%]", isMe ? "items-end" : "items-start")}>
                {!isMe && showAvatar && (
                  <span className="text-[10px] text-[#6B6B6B] font-bold mb-1 ml-1">
                    {msg.sender_name}
                  </span>
                )}
                
                <div className={clsx(
                  "px-4 py-2.5 text-sm shadow-sm relative font-medium whitespace-pre-wrap break-words leading-relaxed",
                  isMe 
                    ? "ca-chat-sent" 
                    : "ca-chat-received"
                )}>
                  {msg.content}
                </div>
                
                <span className="text-[9px] text-[#888888] font-bold mt-1 px-1">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-4" />
      </div>

      {/* Input Bar / Join Banner */}
      <div className="bg-white border-t border-[#E8E6E0] p-4 shrink-0">
        {isMember ? (
          <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send message..."
              disabled={sending}
              className="flex-1 bg-[#F9F8F5] border border-[#E8E6E0] rounded-2xl px-4 py-3 text-sm focus:border-[#C8922A] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl hover:from-amber-600 hover:to-amber-700 transition-colors shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        ) : (
          <div className="max-w-md mx-auto text-center py-2">
            <p className="text-sm text-[#6B6B6B] mb-3 font-semibold">You are not a member of this community.</p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {joining ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              Join Community to Participate
            </button>
          </div>
        )}
      </div>
      </section>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
