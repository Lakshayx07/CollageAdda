import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader, Briefcase, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import CollabCard from "./CollabCard";
import ContributeModal from "./ContributeModal";
import ApplicationsPanel from "./ApplicationsPanel";
import ShareCollabModal from "./ShareCollabModal";

export default function CollabCarousel({ currentUser, onPostCard }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [shareCard, setShareCard] = useState(null);
  const [activeCard, setActiveCard] = useState(null); // For contribute modal
  const [appliedCards, setAppliedCards] = useState({});
  const [appStatusByCard, setAppStatusByCard] = useState({});
  const [toastMsg, setToastMsg] = useState("");

  const userId = currentUser ? (currentUser?.id || currentUser?._id || "").toString() : null;

  const { data: cards = [], isLoading: loading } = useQuery({
    queryKey: ["collab-cards"],
    queryFn: async () => {
      const { data: rawCards, error } = await supabase
        .from("collab_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return rawCards || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const subscription = supabase
      .channel("collab_cards_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "collab_cards" },
        (payload) =>
          queryClient.setQueryData(["collab-cards"], (prev) => [payload.new, ...(prev || [])])
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [queryClient]);

  useEffect(() => {
    if (!currentUser || !cards.length || !userId) return;

    const checkIfApplied = async () => {
      const { data: allApps } = await supabase
        .from("collab_applications")
        .select("id, card_id, applicant_user_id, status");

      const appsMap = {};
      const statusMap = {};
      
      (allApps || []).forEach(app => {
        if (String(app.applicant_user_id).trim() === String(userId).trim()) {
          appsMap[app.card_id] = true;
          statusMap[app.card_id] = app.status || "pending";
        }
      });

      setAppliedCards(appsMap);
      setAppStatusByCard(statusMap);
    };

    checkIfApplied();
  }, [cards, userId, currentUser]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`my-app-status-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "collab_applications",
          filter: `applicant_user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new;
          if (updated.status === "impressive") {
            setAppStatusByCard((prev) => ({ ...prev, [updated.card_id]: "impressive" }));
            setToastMsg("🎉 Your application was marked Impressive! Check your messages.");
            setTimeout(() => setToastMsg(""), 5000);
          } else if (updated.status === "rejected") {
            setAppStatusByCard((prev) => ({ ...prev, [updated.card_id]: "rejected" }));
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  const handleDelete = async (cardId) => {
    try {
      const { error } = await supabase.from("collab_cards").delete().eq("id", cardId);
      if (error) throw error;
      queryClient.setQueryData(["collab-cards"], (prev) =>
        (prev || []).filter((c) => c.id !== cardId)
      );
    } catch (err) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete card.");
    }
  };

  /* ── Loading ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 w-full">
        <Loader size={32} className="animate-spin mb-4" style={{ color: "#D6A12C" }} />
        <p className="text-sm font-bold" style={{ color: "#6F6F6F" }}>
          Loading campus collaborations…
        </p>
      </div>
    );
  }

  /* ── Empty ───────────────────────────────────────── */
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center w-full bg-[#FFFFFF] border border-[#ECE6DD] rounded-[24px]" style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.04)" }}>
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl"
          style={{ background: "rgba(47,58,69,0.08)", color: "#2F3A45" }}
        >
          <Briefcase size={34} />
        </div>
        <h3 className="text-2xl font-bold leading-snug" style={{ color: "#1B1B1B" }}>
          No cards on campus yet
        </h3>
        <p className="mt-3 max-w-sm text-base leading-relaxed" style={{ color: "#6F6F6F" }}>
          Be the first to post a collab card and find your team!
        </p>
        <button
          onClick={onPostCard}
          className="mt-6 flex items-center gap-2 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:scale-[1.03] active:scale-95"
          style={{
            background: "linear-gradient(135deg,#D6A12C,#C28F18)",
            boxShadow: "0 4px 20px rgba(214,161,44,0.35)",
          }}
        >
          <Plus size={14} />
          Post Your Card
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── Applicant status toast ─────────────────── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 left-1/2 z-[999] -translate-x-1/2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] shadow-xl whitespace-nowrap"
            style={{ background: "#3AA675", color: "#FFFFFF" }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Grid layout ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {cards.map((card) => (
          <CollabCard
            key={card.id}
            card={card}
            currentUser={currentUser}
            hasApplied={appliedCards[card.id]}
            appStatus={appStatusByCard[card.id]}
            onContribute={() => {
              setActiveCard(card);
              setShowModal(true);
            }}
            onShare={(c) => setShareCard(c)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* ── Modals ────────────────────────────────── */}
      <ContributeModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setActiveCard(null);
        }}
        card={activeCard}
        currentUser={currentUser}
        onApplied={() => {
          if (activeCard) {
            setAppliedCards((prev) => ({ ...prev, [activeCard.id]: true }));
            setAppStatusByCard((prev) => ({ ...prev, [activeCard.id]: "pending" }));
          }
          setShowModal(false);
          setActiveCard(null);
        }}
      />

      <ShareCollabModal
        isOpen={!!shareCard}
        onClose={() => setShareCard(null)}
        card={shareCard}
        currentUser={currentUser}
      />
    </div>
  );
}
