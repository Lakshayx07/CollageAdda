import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader, Briefcase, Plus } from "lucide-react";
import { supabase } from "@/utils/supabase";
import CollabCard from "./CollabCard";
import ContributeModal from "./ContributeModal";
import ApplicationsPanel from "./ApplicationsPanel";
import ShareCollabModal from "./ShareCollabModal";

export default function CollabCarousel({ currentUser, onPostCard }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for right, -1 for left
  const [showModal, setShowModal] = useState(false);
  const [shareCard, setShareCard] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCards = async () => {
      setLoading(true);
      try {
        const { data: cards, error } = await supabase
          .from('collab_cards')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('collab cards:', cards, error);

        if (error) throw error;

        if (isMounted) {
          const cardsWithProfiles = await Promise.all(
            (cards || []).map(async (card) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url, university')
                .eq('id', card.user_id)
                .single();
              
              return { ...card, profiles: profile || {} };
            })
          );
          
          setCards(cardsWithProfiles);
          
          // Check if we need to navigate to a specific card via URL
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            const cardIdParam = url.searchParams.get("cardId");
            if (cardIdParam && cardsWithProfiles && cardsWithProfiles.length > 0) {
              const foundIndex = cardsWithProfiles.findIndex(c => c.id === cardIdParam);
              if (foundIndex !== -1) {
                setCurrentIndex(foundIndex);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching collab cards:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCards();

    // Subscribe to new cards
    const subscription = supabase
      .channel('collab_cards_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'collab_cards' 
      }, (payload) => {
        setCards(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

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
      setCards(prev => prev.filter(c => c.id !== cardId));
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
      <section className="flex w-full flex-col items-center">
        <div className="relative w-full max-w-sm" style={{ minHeight: 480 }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] app-panel border border-white/10 bg-white/[0.02]">
            <Loader size={32} className="animate-spin text-primary mb-4" />
            <p className="text-sm text-muted font-bold">Loading campus cards…</p>
          </div>
        </div>
      </section>
    );
  }

  if (cards.length === 0) {
    return (
      <section className="flex w-full flex-col items-center">
        <div className="relative w-full max-w-sm" style={{ minHeight: 480 }}>
          <div className="app-panel absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] p-7 text-center border border-white/10 bg-white/[0.02]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Briefcase size={34} />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">No cards on campus</h3>
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

  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 200 : -200,
        opacity: 0,
        scale: 0.9,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 200 : -200,
        opacity: 0,
        scale: 0.9,
      };
    }
  };

  return (
    <section className="flex w-full flex-col items-center">
      <div className="mb-4 flex w-full max-w-sm items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted">Team cards</p>
          <h2 className="text-lg font-black text-white">Campus Collabs</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black text-muted">
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
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 w-full h-full flex flex-col"
          >
            <CollabCard 
              card={currentCard} 
              currentUser={currentUser}
              onContribute={() => setShowModal(true)} 
              onShare={(c) => setShareCard(c)}
              onDelete={handleDelete}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {cards.length > 1 && (
        <div className="w-full max-w-sm mt-6 flex flex-col items-center gap-3">
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition hover:scale-105 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Card {currentIndex + 1} of {cards.length}
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      <ContributeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        card={currentCard}
        currentUser={currentUser}
        onApplied={() => {
          // Handled inside ContributeModal, could show another toast here if needed
        }}
      />

      {/* Share Modal */}
      <ShareCollabModal
        isOpen={!!shareCard}
        onClose={() => setShareCard(null)}
        card={shareCard}
        currentUser={currentUser}
      />

      {/* Applications Panel for Card Owner */}
      {currentUser && currentCard.user_id === (currentUser.id || currentUser._id) && (
        <ApplicationsPanel cardId={currentCard.id} currentUser={currentUser} />
      )}
    </section>
  );
}
