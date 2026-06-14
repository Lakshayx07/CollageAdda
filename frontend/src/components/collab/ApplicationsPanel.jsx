import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/utils/supabase";
import { Loader, Inbox, Star, X, Linkedin, Github, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ApplicationCard({ application, onImpressive, onPass }) {
  const profile = application.profiles || {};
  const avatarUrl = profile.avatar_url || application.avatar_url;
  const name = application.name || profile.full_name || "Applicant";
  const initials = name.charAt(0).toUpperCase();
  const skillsArray = Array.isArray(application.skills)
    ? application.skills
    : application.skills
    ? application.skills.split(",")
    : [];
  const isPending = !application.status || application.status === "pending";
  const isImpressive = application.status === "impressive";
  const isRejected = application.status === "rejected";

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20">
      {/* Header */}
      <div className="p-4 flex items-start gap-3 border-b border-white/5">
        {/* Avatar */}
        <div className="shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-black text-white">
              {initials}
            </div>
          )}
        </div>

        {/* Name + info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white leading-tight">{name}</p>
          <p className="text-[11px] text-white/50 mt-0.5 truncate">
            {application.course_branch || ""}
            {application.year ? ` · ${application.year}` : ""}
          </p>
          <p className="text-[10px] text-white/30 mt-0.5">{timeAgo(application.created_at)}</p>
        </div>

        {/* Role badge + status */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {application.role_applying && (
            <span className="bg-violet-500/15 text-violet-300 border border-violet-500/30 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">
              {application.role_applying}
            </span>
          )}
          {isImpressive && (
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase px-2 py-1 rounded-full">
              ✨ Impressive
            </span>
          )}
          {isRejected && (
            <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-[9px] font-black uppercase px-2 py-1 rounded-full">
              ✗ Passed
            </span>
          )}
          {isPending && (
            <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-black uppercase px-2 py-1 rounded-full">
              ⏳ Pending
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Why join */}
        {application.why_join && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1.5">
              Why I want to join
            </p>
            <div className="bg-white/5 border-l-4 border-violet-500 rounded-r-xl p-3">
              <p className="text-xs text-white/70 leading-relaxed italic">
                "{application.why_join}"
              </p>
            </div>
          </div>
        )}

        {/* Skills */}
        {skillsArray.length > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1.5">
              Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(skillsArray || []).map((s, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold text-violet-200 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full"
                >
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {(application.linkedin_url || application.portfolio_url) && (
          <div className="flex gap-2">
            {application.linkedin_url && (
              <a
                href={application.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg transition"
              >
                <ExternalLink size={10} /> LinkedIn
              </a>
            )}
            {application.portfolio_url && (
              <a
                href={application.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition"
              >
                <ExternalLink size={10} /> Portfolio
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer — action buttons for pending only */}
      {isPending && (
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={() => onImpressive(application)}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl px-3 py-2.5 font-bold text-xs hover:scale-[1.02] transition-transform shadow-lg flex items-center justify-center gap-1.5"
          >
            ✨ Mark Impressive
          </button>
          <button
            onClick={() => onPass(application)}
            className="flex-1 bg-white/5 border border-white/10 text-white/50 hover:text-white/80 rounded-xl px-3 py-2.5 font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            ✗ Pass
          </button>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPanel({ cardId, currentUser }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success"); // "success" | "info"

  const userId = currentUser ? (currentUser?.id || currentUser?._id || "").toString() : null;

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const loadApplications = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Get ALL applications first (no filter)
      const { data: allApps, error } = await supabase
        .from('collab_applications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Get current user's MongoDB ID as plain string
      const myId = (
        currentUser?.id || 
        currentUser?._id || 
        currentUser?.user_id || 
        ''
      ).toString().replace(/['"]/g, '').trim()
      if (!myId) return;
      
      console.log('My ID:', myId)
      console.log('All apps:', allApps)
      
      // Filter client-side - compare as plain strings
      const myApplications = (allApps || []).filter(app => {
        const ownerId = String(app.card_owner_user_id || '').trim()
        return ownerId === myId
      })
      
      console.log('My applications:', myApplications)
      setApplications(myApplications)
      
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return;
    if (!cardId || !userId) return;

    loadApplications();

    // Realtime: new applications coming in
    const channel = supabase
      .channel(`apps-panel-${cardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "collab_applications",
          filter: `card_owner_user_id=eq.${userId}`,
        },
        () => {
          loadApplications();
          showToast("New application received! 🎉");
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [cardId, userId, loadApplications]);

  const handleImpressive = async (application) => {
    // Optimistic
    setApplications((prev) =>
      (prev || []).map((a) => (a.id === application.id ? { ...a, status: "impressive" } : a))
    );

    try {
      // 1. Update status
      const { error: upErr } = await supabase
        .from("collab_applications")
        .update({ status: "impressive" })
        .eq("id", application.id);
      if (upErr) throw upErr;

      // 2. Get project name
      const { data: cardData } = await supabase
        .from("collab_cards")
        .select("building")
        .eq("id", cardId)
        .single();
      const buildingName = cardData?.building || "the project";
      const applicantName = application.name || "there";

      // 3. Send congratulations DM via the exact API pattern used in messages/page.js
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

      const roomRes = await fetch(`${apiUrl}/api/chat/rooms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId: application.applicant_user_id }),
      });

      if (roomRes.ok) {
        const room = await roomRes.json();
        const msgText = `🎉 Congratulations ${applicantName}!\n\nYour application for the project '${buildingName}' has been marked as ✨ Impressive by the project owner. They love your profile and want to connect with you. Reply to this message to get started! 🚀`;

        await fetch(`${apiUrl}/api/chat/rooms/${room._id || room.id}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: msgText }),
        });
      }

      // 4. Try notifications table (non-blocking)
      await supabase.from("notifications").insert({
        user_id: application.applicant_user_id,
        sender_id: userId,
        type: "collab_impressive",
        message: "🎉 Your collab application was marked Impressive!",
        read: false,
      }).then(() => {}).catch(() => {}); // ignore if table doesn't exist

      showToast("Marked as Impressive! Congrats message sent 🚀");
    } catch (err) {
      console.error("Error marking impressive:", err);
      // Revert
      setApplications((prev) =>
        (prev || []).map((a) => (a.id === application.id ? { ...a, status: application.status } : a))
      );
      showToast("Failed to mark impressive. Try again.", "error");
    }
  };

  const handlePass = async (application) => {
    // Optimistic
    setApplications((prev) =>
      (prev || []).map((a) => (a.id === application.id ? { ...a, status: "rejected" } : a))
    );

    try {
      const { error: upErr } = await supabase
        .from("collab_applications")
        .update({ status: "rejected" })
        .eq("id", application.id);
      if (upErr) throw upErr;
      showToast("Application passed.", "info");
    } catch (err) {
      console.error("Error passing application:", err);
      setApplications((prev) =>
        (prev || []).map((a) => (a.id === application.id ? { ...a, status: application.status } : a))
      );
    }
  };

  if (!cardId || !currentUser) return null;

  const pendingCount = (applications || []).filter((a) => !a.status || a.status === "pending").length;

  return (
    <div className="w-full mt-8 flex flex-col items-center relative">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[999] rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest shadow-xl whitespace-nowrap ${
              toastType === "info"
                ? "bg-white/10 text-white border border-white/20"
                : "bg-emerald-500 text-black"
            }`}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Inbox size={18} className="text-primary" />
            Received Applications
            {/* Live count badge */}
            <span className="bg-violet-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black">
              {applications.length}
            </span>
            {pendingCount > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full">
                {pendingCount} new
              </span>
            )}
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
            People who want to join your team
          </p>
        </div>
      </div>

      {/* List */}
      <div className="w-full max-w-sm space-y-4">
        {loading ? (
          <div className="app-panel rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center">
            <Loader size={24} className="animate-spin text-primary mb-3" />
            <p className="text-xs font-bold text-muted">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="app-panel rounded-[1.5rem] p-6 text-center bg-red-500/5 border border-red-500/20">
            <p className="text-xs font-bold text-red-400 mb-2">{error}</p>
            <button
              onClick={fetchApplications}
              className="text-xs text-white/50 hover:text-white border border-white/10 rounded-xl px-3 py-1.5 transition"
            >
              Retry
            </button>
          </div>
        ) : (applications || []).length === 0 ? (
          <div className="app-panel rounded-[1.5rem] p-8 flex flex-col items-center justify-center text-center opacity-70">
            <Inbox size={32} className="text-white/20 mb-3" />
            <p className="text-sm font-bold text-white/50">No applications yet</p>
            <p className="text-[10px] text-white/30 mt-1">
              When someone applies, it will appear here.
            </p>
          </div>
        ) : (
          (applications || []).map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onImpressive={handleImpressive}
              onPass={handlePass}
            />
          ))
        )}
      </div>
    </div>
  );
}
