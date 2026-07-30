import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader, Briefcase, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import CollabCard from "./CollabCard";
import ContributeModal from "./ContributeModal";
import ApplicationsPanel from "./ApplicationsPanel";
import ShareCollabModal from "./ShareCollabModal";

export default function CollabCarousel({ currentUser, onPostCard }) {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [shareCard, setShareCard] = useState(null);
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
    if (!cards || cards.length === 0) return;
    if (typeof window !== "undefined") {
      const cardIdParam = new URL(window.location.href).searchParams.get("cardId");
      if (cardIdParam) {
        const idx = cards.findIndex((c) => c.id === cardIdParam);
        if (idx !== -1) setCurrentIndex(idx);
      }
    }
  }, [cards]);

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

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!currentUser) return;
    if (!cards || !cards.length || !userId) return;
    const currentCard = cards[currentIndex];
    if (!currentCard) return;
    if (appliedCards[currentCard.id] !== undefined) return;

    const checkIfApplied = async () => {
      const myId = (currentUser?.id || currentUser?._id || "").toString().trim();
      if (!myId) return;

      const { data: allApps } = await supabase
        .from("collab_applications")
        .select("id, card_id, applicant_user_id, status");

      const existingApp = (allApps || []).find(
        (app) =>
          String(app.card_id) === String(currentCard.id) &&
          String(app.applicant_user_id).trim() === myId
      );

      if (existingApp) {
        setAppliedCards((prev) => ({ ...prev, [currentCard.id]: true }));
        setAppStatusByCard((prev) => ({
          ...prev,
          [currentCard.id]: existingApp.status || "pending",
        }));
      } else {
        setAppliedCards((prev) => ({ ...prev, [currentCard.id]: false }));
      }
    };

    checkIfApplied();
  }, [currentIndex, cards, userId, currentUser, appliedCards]);

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

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleDelete = async (cardId) => {
    try {
      const { error } = await supabase.from("collab_cards").delete().eq("id", cardId);
      if (error) throw error;
      queryClient.setQueryData(["collab-cards"], (prev) =>
        (prev || []).filter((c) => c.id !== cardId)
      );
      if (currentIndex >= cards.length - 1) {
        setCurrentIndex(Math.max(0, cards.length - 2));
      }
    } catch (err) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete card.");
    }
  };

  /* ── Loading ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader size={32} className="animate-spin mb-4" style={{ color: "#C8922A" }} />
        <p className="text-sm font-bold" style={{ color: "#888888" }}>
          Loading campus cards…
        </p>
      </div>
    );
  }

  /* ── Empty ───────────────────────────────────────── */
  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl"
          style={{ background: "rgba(200,146,42,0.1)", color: "#C8922A" }}
        >
          <Briefcase size={34} />
        </div>
        <h3 className="text-2xl font-black tracking-tight" style={{ color: "#1A1A1A" }}>
          No cards on campus yet
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: "#888888" }}>
          Be the first to post a collab card and find your team!
        </p>
        <button
          onClick={onPostCard}
          className="mt-6 flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:scale-[1.03] active:scale-95"
          style={{
            background: "linear-gradient(135deg,#C8922A,#D4A843)",
            boxShadow: "0 4px 20px rgba(200,146,42,0.3)",
          }}
        >
          <Plus size={14} />
          Post Your Card
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isCardOwner = userId && String(currentCard?.user_id) === userId;
  const hasApplied = appliedCards[currentCard?.id] === true;
  const appStatus = appStatusByCard[currentCard?.id] || null;

  const variants = {
    enter: (d) => ({ x: d > 0 ? 160 : -160, opacity: 0, scale: 0.95 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ zIndex: 0, x: d < 0 ? 160 : -160, opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="w-full">
      {/* ── Applicant status toast ─────────────────── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 left-1/2 z-[999] -translate-x-1/2 rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest shadow-xl whitespace-nowrap"
            style={{ background: "#10b981", color: "#000" }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Carousel layout ───────────────────────── */}
      <div className="flex flex-col items-center gap-6">
        {/* Counter + arrows row */}
        <div className="flex w-full items-center justify-between">
          {/* Left arrow */}
          <button
            onClick={handlePrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:border-[#C8922A]/40 hover:bg-[#C8922A]/5 active:scale-95"
            style={{ borderColor: "#ECE6DD", background: "#FAF8F4", color: "#888888" }}
            aria-label="Previous card"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Counter dots */}
          <div className="flex items-center gap-2">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                }}
                className="rounded-full transition"
                style={{
                  width: i === currentIndex ? 24 : 8,
                  height: 8,
                  background: i === currentIndex ? "#C8922A" : "#ECE6DD",
                }}
                aria-label={`Go to card ${i + 1}`}
              />
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={handleNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border transition hover:border-[#C8922A]/40 hover:bg-[#C8922A]/5 active:scale-95"
            style={{ borderColor: "#ECE6DD", background: "#FAF8F4", color: "#888888" }}
            aria-label="Next card"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Card stage */}
        <div
          className="relative w-full"
          style={{ maxWidth: 440, minHeight: 480 }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentCard.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 320, damping: 30 },
                opacity: { duration: 0.18 },
              }}
              className="absolute inset-0 w-full h-full flex flex-col"
            >
              <CollabCard
                card={currentCard}
                currentUser={currentUser}
                hasApplied={hasApplied}
                appStatus={appStatus}
                onContribute={() => setShowModal(true)}
                onShare={(c) => setShareCard(c)}
                onDelete={handleDelete}
                onNext={handleNext}
                onPrev={handlePrev}
                currentIndex={currentIndex}
                totalCards={cards.length}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card counter label */}
        <p className="text-xs font-bold" style={{ color: "#888888" }}>
          {currentIndex + 1} of {cards.length} cards
        </p>
      </div>

      {/* ── Modals ────────────────────────────────── */}
      <ContributeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        card={currentCard}
        currentUser={currentUser}
        onApplied={() => {
          setAppliedCards((prev) => ({ ...prev, [currentCard.id]: true }));
          setAppStatusByCard((prev) => ({ ...prev, [currentCard.id]: "pending" }));
          setShowModal(false);
        }}
      />

      <ShareCollabModal
        isOpen={!!shareCard}
        onClose={() => setShareCard(null)}
        card={shareCard}
        currentUser={currentUser}
      />

      {isCardOwner && (
        <ApplicationsPanel cardId={currentCard.id} currentUser={currentUser} />
      )}
    </div>
  );
}
