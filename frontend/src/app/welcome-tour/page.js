"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  HeroSection,
  PulseSection,
  FindPeopleSection,
  ExploreSection,
  HustleHubSection,
  CollabSection,
  PrideSection,
  FinalCTASection,
} from "@/components/onboarding/OnboardingSections";

const NAV_LABELS = [
  "Welcome",
  "Campus Pulse",
  "Find People",
  "Explore",
  "Hustle Hub",
  "Collab",
  "College Pride",
  "Get Started",
];

export default function WelcomeTourPage() {
  const router = useRouter();
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("collegeadda_token");
    if (!token) { router.replace("/login"); return; }
    setReady(true);
  }, [router]);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    if (!ready) return;
    const els = containerRef.current?.querySelectorAll("[data-section]");
    if (!els) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(Number(e.target.dataset.section));
        });
      },
      { root: containerRef.current, rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ready]);

  const completeTour = () => {
    localStorage.setItem("campusadda_tour_completed", "true");
    router.push("/");
  };

  const scrollToSection = (idx) => {
    containerRef.current
      ?.querySelectorAll("[data-section]")
      [idx]?.scrollIntoView({ behavior: "smooth" });
  };

  if (!ready) return null;

  return (
    <div data-page="welcome-tour" className="fixed inset-0 z-50" style={{ background: "#0b0c16" }}>
    <div
      ref={containerRef}
      className="relative h-full overflow-y-auto"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {/* ─── Scroll progress bar ──────────────────── */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-white/5 z-[200]">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-cyan-400"
          style={{ width: progressWidth }}
        />
      </div>

      {/* ─── Floating sticky header ───────────────── */}
      <header className="fixed top-0 left-0 right-0 z-[180] flex items-center justify-between px-6 pt-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="pointer-events-auto"
        >
          <span className="text-lg font-black tracking-tight text-white select-none">
            Campus
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Adda
            </span>
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          onClick={completeTour}
          className="pointer-events-auto text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md"
        >
          Skip Tour
        </motion.button>
      </header>

      {/* ─── Side nav dots ────────────────────────── */}
      <nav className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[150] flex flex-col gap-2 items-end">
        {NAV_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => scrollToSection(i)}
            className="group flex items-center gap-2 cursor-pointer"
            aria-label={`Jump to ${label}`}
          >
            <span
              className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 hidden md:block ${
                activeSection === i
                  ? "text-white opacity-100"
                  : "text-white/0 group-hover:text-white/60 group-hover:opacity-100"
              }`}
            >
              {label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                activeSection === i
                  ? "w-2 h-6 bg-gradient-to-b from-purple-400 to-cyan-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                  : "w-1.5 h-1.5 bg-white/20 hover:bg-white/50"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* ─── Global ambient background glows ─────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[55%] h-[55%] bg-purple-700/15 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[55%] h-[55%] bg-cyan-700/15 blur-[160px] rounded-full" />
      </div>

      {/* ─── Grain texture overlay ────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* ─── Sections ─────────────────────────────── */}
      <div data-section="0">
        <HeroSection
          onStart={() => scrollToSection(1)}
          onSkip={completeTour}
        />
      </div>

      <div data-section="1">
        <PulseSection />
      </div>

      <div data-section="2">
        <FindPeopleSection />
      </div>

      <div data-section="3">
        <ExploreSection />
      </div>

      <div data-section="4">
        <HustleHubSection />
      </div>

      <div data-section="5">
        <CollabSection />
      </div>

      <div data-section="6">
        <PrideSection />
      </div>

      <div data-section="7">
        <FinalCTASection onComplete={completeTour} />
      </div>
    </div>
    </div>
  );
}
