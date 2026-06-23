"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const SLIDES = [
  { src: "/welcome-tour/slide-1.png", alt: "Welcome to CampusAdda" },
  { src: "/welcome-tour/slide-2.png", alt: "Campus Pulse" },
  { src: "/welcome-tour/slide-3.png", alt: "Find your people" },
  { src: "/welcome-tour/slide-4.png", alt: "Explore beyond your circle" },
  { src: "/welcome-tour/slide-5.png", alt: "Hustle Hub" },
  { src: "/welcome-tour/slide-6.png", alt: "Collab" },
  { src: "/welcome-tour/slide-7.png", alt: "College Pride" },
  { src: "/welcome-tour/slide-8.png", alt: "Your campus journey starts now" },
];

const skipSlides = new Set([1, 3, 4, 5, 6]);

export default function WelcomeTourPage() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const isFirst = activeSlide === 0;
  const isLast = activeSlide === SLIDES.length - 1;

  const completeTour = useCallback(() => {
    router.push("/");
  }, [router]);

  const goToSlide = useCallback((nextIndex) => {
    const safeIndex = Math.min(Math.max(nextIndex, 0), SLIDES.length - 1);
    if (safeIndex === activeSlide) return;
    setDirection(safeIndex > activeSlide ? 1 : -1);
    setActiveSlide(safeIndex);
  }, [activeSlide]);

  const goBack = useCallback(() => goToSlide(activeSlide - 1), [activeSlide, goToSlide]);
  const goNext = useCallback(() => {
    if (isLast) {
      completeTour();
      return;
    }
    goToSlide(activeSlide + 1);
  }, [activeSlide, completeTour, goToSlide, isLast]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft" && !isFirst) goBack();
      if (event.key === "Escape" && !isFirst && !isLast) completeTour();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completeTour, goBack, goNext, isFirst, isLast]);

  return (
    <main
      data-page="welcome-tour"
      className="fixed inset-0 z-[250] flex min-h-screen items-center justify-center overflow-hidden bg-[#020314] text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(110,42,255,0.2),transparent_38%),linear-gradient(180deg,#020314_0%,#050016_100%)]" />

      <div className="relative h-screen w-screen overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={SLIDES[activeSlide].src}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -80, scale: 0.985 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img
              src={SLIDES[activeSlide].src}
              alt={SLIDES[activeSlide].alt}
              className="h-auto max-h-screen w-auto max-w-screen select-none object-contain"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <motion.div
          key={`pulse-${activeSlide}`}
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: [0, 0.45, 0], scale: [0.82, 1, 1.08] }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="pointer-events-none absolute inset-[12%] rounded-[48px] border border-purple-400/30 shadow-[0_0_80px_rgba(117,67,255,0.35)]"
        />

        <ResponsiveHitLayer>
          {skipSlides.has(activeSlide) && (
            <button
              type="button"
              onClick={completeTour}
              aria-label="Skip welcome tour"
              className="absolute left-[88%] top-[2.5%] h-[7%] w-[10%] rounded-2xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80"
            />
          )}

          {!isFirst && !isLast && (
            <button
              type="button"
              onClick={goBack}
              aria-label="Go to previous tour slide"
              className="absolute left-[69%] top-[88.5%] h-[9%] w-[10%] rounded-2xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80"
            />
          )}

          {!isLast && (
            <button
              type="button"
              onClick={goNext}
              aria-label="Go to next tour slide"
              className="absolute left-[80.5%] top-[88.5%] h-[9%] w-[16%] rounded-2xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80"
            />
          )}

          {isLast && (
            <button
              type="button"
              onClick={completeTour}
              aria-label="Enter CampusAdda"
              className="absolute left-[18%] top-[81%] h-[10%] w-[64%] rounded-2xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80"
            />
          )}

          <div className="absolute left-[36%] top-[90%] flex h-[7%] w-[28%] items-center justify-center gap-[2.5%]">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className="h-[34%] min-h-3 w-[7%] min-w-3 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80"
              />
            ))}
          </div>
        </ResponsiveHitLayer>
      </div>
    </main>
  );
}

function ResponsiveHitLayer({ children }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-[3/2] h-auto max-h-screen w-screen max-w-[150vh] -translate-x-1/2 -translate-y-1/2">
      <div className="pointer-events-auto absolute inset-0">{children}</div>
    </div>
  );
}
