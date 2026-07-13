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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [shareCard, setShareCard] = useState(null);
  const [appliedCards, setAppliedCards] = useState({});
  const [appStatusByCard, setAppStatusByCard] = useState({});
  const [toastMsg, setToastMsg] = useState("");

  const userId = currentUser ? (currentUser?.id || currentUser?._id || "").toString() : null;

  const { data: cards = [], isLoading: loading } = useQuery({
    queryKey: ['collab-cards'],
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
    // Subscribe to new cards
    const subscription = supabase
      .channel("collab_cards_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "collab_cards" },
        (payload) => queryClient.setQueryData(['collab-cards'], (prev) => [payload.new, ...(prev || [])])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [queryClient]);

  // When current card changes, check DB to see if user already applied + get status
  useEffect(() => {
    if (!currentUser) return;
    if (!cards || !cards.length || !userId) return;
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    // Skip if we already know
    if (appliedCards[currentCard.id] !== undefined) return;

    const checkIfApplied = async () => {
      const myId = (currentUser?.id || currentUser?._id || '').toString().trim();
      if (!myId) return;

      const { data: allApps } = await supabase
        .from('collab_applications')
        .select('id, card_id, applicant_user_id, status');

      const existingApp = (allApps || []).find(app => 
        String(app.card_id) === String(currentCard.id) &&
        String(app.applicant_user_id).trim() === myId
      );

      console.log(`=== CHECK APPLIED for card ${currentCard.id} ===`, existingApp);
      if (existingApp) {
        setAppliedCards((prev) => ({ ...prev, [currentCard.id]: true }));
        setAppStatusByCard((prev) => ({ ...prev, [currentCard.id]: existingApp.status || 'pending' }));
      } else {
        setAppliedCards((prev) => ({ ...prev, [currentCard.id]: false }));
      }
    };

    checkIfApplied();
  }, [currentIndex, cards, userId, currentUser, appliedCards]);

  // Realtime: listen for status updates on MY applications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`my-app-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'collab_applications',
          filter: `applicant_user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new;
          if (updated.status === 'impressive') {
            setAppStatusByCard((prev) => ({ ...prev, [updated.card_id]: 'impressive' }));
            setToastMsg('🎉 Your application was marked Impressive! Check your messages.');
            setTimeout(() => setToastMsg(''), 5000);
          } else if (updated.status === 'rejected') {
            setAppStatusByCard((prev) => ({ ...prev, [updated.card_id]: 'rejected' }));
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
      queryClient.setQueryData(['collab-cards'], (prev) => (prev || []).filter((c) => c.id !== cardId));
      if (currentIndex >= cards.length - 1) {
        setCurrentIndex(Math.max(0, cards.length - 2));
      }
    } catch (err) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete card.");
    }
  };

  if (loading) {
    return (
    <section className="flex w-full flex-col items-end pl-16">
        <div className="relative w-full max-w-sm" style={{ minHeight: 480 }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] app-panel border border-[#E8E6E0] bg-[#F3F2EE]">
            <Loader size={32} className="animate-spin text-primary mb-4" />
            <p className="text-sm text-muted font-bold">Loading campus cards…</p>
          </div>
        </div>
      </section>
    );
  }

  if (!cards || cards.length === 0) {
    return (
    <section className="flex w-full flex-col items-end pl-16">
        <div className="relative w-full max-w-sm" style={{ minHeight: 480 }}>
          <div className="app-panel absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] p-7 text-center border border-[#E8E6E0] bg-[#F3F2EE]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Briefcase size={34} />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-[#1A1A1A]">No cards on campus</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Be the first to post a collab card for your campus!
            </p>
            <button
              onClick={onPostCard}
              className="mt-6 primary-button px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center"
            >
              <Plus size={14} className="mr-2" /> Post Your Card
            </button>
          </div>
        </div>
      </section>
    );
  }

  const currentCard = cards[currentIndex];
  const isCardOwner = userId && String(currentCard?.user_id) === userId;
  const hasApplied = appliedCards[currentCard?.id] === true;
  const appStatus = appStatusByCard[currentCard?.id] || null;

  const variants = {
    enter: (d) => ({ x: d > 0 ? 200 : -200, opacity: 0, scale: 0.9 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ zIndex: 0, x: d < 0 ? 200 : -200, opacity: 0, scale: 0.9 }),
  };

  return (
    <section className="flex w-full flex-col items-end pl-16">
      {/* Applicant status toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 left-1/2 z-[999] -translate-x-1/2 rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-black uppercase tracking-widest text-black shadow-xl whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 flex w-full max-w-sm items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Team cards</p>
          <h2 className="text-lg font-black text-[#1A1A1A]">Campus Collabs</h2>
        </div>
        <span className="rounded-full border border-[#E8E6E0] bg-[#F3F2EE] px-3 py-1 text-[10px] font-black text-muted">
          Swipe
        </span>
      </div>

      <div className="relative w-full max-w-sm" style={{ minHeight: 480 }}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentCard.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
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

      {/* Contribute Modal */}
      <ContributeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        card={currentCard}
        currentUser={currentUser}
        onApplied={() => {
          setAppliedCards((prev) => ({ ...prev, [currentCard.id]: true }));
          setAppStatusByCard((prev) => ({ ...prev, [currentCard.id]: 'pending' }));
          setShowModal(false);
        }}
      />

      {/* Share Modal */}
      <ShareCollabModal
        isOpen={!!shareCard}
        onClose={() => setShareCard(null)}
        card={shareCard}
        currentUser={currentUser}
      />

      {/* Applications Panel — only for card owner */}
      {isCardOwner && (
        <ApplicationsPanel cardId={currentCard.id} currentUser={currentUser} />
      )}
    </section>
  );
}
