import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Loader, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ApplicationCard from "./ApplicationCard";

export default function ApplicationsPanel({ cardId, currentUser }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const userId = currentUser ? String(currentUser.id || currentUser._id) : null;

  useEffect(() => {
    if (!cardId || !userId) return;
    
    let isMounted = true;
    
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: applications, error: fetchError } = await supabase
          .from("collab_applications")
          .select(`
            *,
            profiles:applicant_user_id (avatar_url)
          `)
          .eq("card_id", cardId)
          .eq("card_owner_user_id", userId)
          .order('created_at', { ascending: false });

        console.log('applications fetched:', applications, fetchError);
        if (fetchError) throw fetchError;
        
        if (isMounted) setApplications(applications || []);
      } catch (err) {
        console.error("Error fetching applications:", err);
        if (isMounted) setError("Could not load applications.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchApplications();

    // Subscribe to new applications for this specific card
    const subscription = supabase
      .channel(`applications-for-${cardId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collab_applications',
          filter: `card_owner_user_id=eq.${userId}`
        },
        (payload) => {
          // Add new application to the list (would be better to refetch to get profile data, 
          // but for simplicity we refetch the whole list)
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, [cardId, userId]);

  if (!cardId || !currentUser) return null;

  const handleImpressive = async (application) => {
    // Optimistic UI update
    setApplications(prev => prev.map(a => a.id === application.id ? { ...a, status: 'impressive' } : a));
    
    try {
      // 1. Update in supabase
      const { error: updateErr } = await supabase
        .from('collab_applications')
        .update({ status: 'impressive' })
        .eq('id', application.id);
        
      if (updateErr) throw updateErr;

      // 2. Fetch building name for message
      const { data: cardData } = await supabase.from('collab_cards').select('building').eq('id', cardId).single();
      const buildingName = cardData?.building || "the project";

      // 3. Send message using exact API flow
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      
      const roomRes = await fetch(`${apiUrl}/api/chat/rooms`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: application.applicant_user_id })
      });
      
      if (roomRes.ok) {
        const room = await roomRes.json();
        const msgText = `🎉 Congratulations! Your application for the project '${buildingName}' has been marked as Impressive by the project owner. They are interested in working with you! Check your messages to connect further.`;

        await fetch(`${apiUrl}/api/chat/rooms/${room._id || room.id}/messages`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ text: msgText })
        });
      }

      setToastMsg("Marked as Impressive! Applicant notified 🚀");
      setTimeout(() => setToastMsg(""), 4000);
    } catch (err) {
      console.error("Error marking impressive:", err);
      // Revert optimistic update
      setApplications(prev => prev.map(a => a.id === application.id ? { ...a, status: application.status } : a));
    }
  };

  return (
    <div className="w-full mt-6 flex flex-col items-center relative">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute -top-12 z-50 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-black shadow-xl whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full max-w-sm text-left mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white flex items-center">
            <Inbox size={18} className="mr-2 text-primary" />
            Received Applications
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
            People who want to join your team
          </p>
        </div>
        <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-black px-2 py-1 rounded-lg">
          {applications.length}
        </span>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {loading ? (
          <div className="app-panel rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center">
            <Loader size={24} className="animate-spin text-primary mb-3" />
            <p className="text-xs font-bold text-muted">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="app-panel rounded-[1.5rem] p-6 text-center border-red-500/20 bg-red-500/5">
            <p className="text-xs font-bold text-red-400">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="app-panel rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center opacity-70">
            <Inbox size={32} className="text-white/20 mb-3" />
            <p className="text-sm font-bold text-white/50">No applications yet</p>
            <p className="text-[10px] text-white/30 mt-1">When someone applies, it will appear here.</p>
          </div>
        ) : (
          applications.map(app => (
            <ApplicationCard key={app.id} application={app} onImpressive={handleImpressive} />
          ))
        )}
      </div>
    </div>
  );
}
