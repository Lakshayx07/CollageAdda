import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { Loader, Inbox } from "lucide-react";
import ApplicationCard from "./ApplicationCard";

export default function ApplicationsPanel({ cardId, currentUser }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cardId || !currentUser?.id) return;
    
    let isMounted = true;
    
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("collab_applications")
          .select(`
            *,
            profiles:applicant_user_id (avatar_url)
          `)
          .eq("card_id", cardId)
          .eq("card_owner_user_id", currentUser.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        
        if (isMounted) setApplications(data || []);
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
          filter: `card_id=eq.${cardId}`
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
  }, [cardId, currentUser?.id]);

  if (!cardId || !currentUser) return null;

  return (
    <div className="w-full mt-6 flex flex-col items-center">
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
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </div>
    </div>
  );
}
