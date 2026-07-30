"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Clock3, Sparkles, Star, Trophy, UsersRound } from "lucide-react";
import clsx from "clsx";
import { useApiQuery } from "@/utils/useApiQuery";
import { motion } from "framer-motion";

const POLL_INTERVAL_MS = 15000;

const LOCAL_LOGOS = [
  { pattern: /school of planning|architecture.*spa|\bspa\b/i, logo: "/college-logos/spa-delhi.png" },
  { pattern: /jawaharlal nehru|jnu/i, logo: "/college-logos/jnu.png" },
  { pattern: /amity/i, logo: "/college-logos/amity-university.png" },
  { pattern: /delhi university|university of delhi/i, logo: "/college-logos/delhi-university.png" },
  { pattern: /symbiosis/i, logo: "/college-logos/symbiosis.png" },
  { pattern: /christ/i, logo: "/college-logos/christ-university.png" }
];

const FALLBACK_COLORS = ["#FDE68A", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"];

const formatTimestamp = (value) => {
  if (!value) return "Refreshing...";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(value));
};

const pluralizeStudents = (count) => `${count} verified student${count === 1 ? "" : "s"}`;

const initialsFor = (name) => {
  const words = String(name || "Campus")
    .replace(/\([^)]*\)/g, "")
    .split(/[\s,]+/)
    .filter(Boolean);
  return (words.slice(0, 2).map(word => word[0]).join("") || "CA").toUpperCase();
};

const localLogoFor = (name) => LOCAL_LOGOS.find(item => item.pattern.test(name))?.logo || "";

const normalizeLeaderboard = (payload) => {
  const rows = Array.isArray(payload) ? payload : payload?.leaderboard || [];
  return rows.map((item, index) => {
    const name = item.college || item.name || item._id || "Unknown University";
    return {
      rank: item.rank || index + 1,
      name,
      verifiedStudents: item.verifiedStudents ?? item.verifiedCount ?? 0,
      points: item.points ?? item.score ?? 0,
      logo: item.logo || localLogoFor(name),
      fallbackLogo: item.fallbackLogo,
      accent: item.accent || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
    };
  });
};

function CollegeMark({ college, size = "md" }) {
  const dimensions = {
    lg: "h-[72px] w-[72px]",
    md: "h-[60px] w-[60px]",
    sm: "h-11 w-11"
  }[size];
  const initials = initialsFor(college.name);
  const hasImage = typeof college.logo === "string" && college.logo.startsWith("/");

  return (
    <div className={clsx("grid shrink-0 place-items-center overflow-hidden rounded-full bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-[#EDE9E0]", dimensions)} aria-hidden="true">
      {hasImage ? (
        <Image src={college.logo} alt="" width={72} height={72} className="h-full w-full rounded-full object-contain" />
      ) : (
        <div
          className="grid h-full w-full place-items-center rounded-full text-sm font-black text-white"
          style={{ background: `linear-gradient(135deg, ${college.accent}, #202124)` }}
        >
          {college.fallbackLogo && college.fallbackLogo.length <= 3 ? college.fallbackLogo : initials}
        </div>
      )}
    </div>
  );
}

function WinnerSparkles() {
  const sparkles = [
    { left: "10%", top: "15%", size: 14, delay: "0s", duration: "2s" },
    { left: "20%", top: "5%", size: 10, delay: "0.4s", duration: "2.5s" },
    { left: "85%", top: "10%", size: 16, delay: "0.8s", duration: "2.2s" },
    { left: "90%", top: "35%", size: 12, delay: "1.2s", duration: "2.8s" },
    { left: "12%", top: "50%", size: 9, delay: "1.5s", duration: "2.4s" }
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl">
      {sparkles.map((sparkle, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{
            duration: parseFloat(sparkle.duration),
            repeat: Infinity,
            delay: parseFloat(sparkle.delay),
            ease: "easeInOut"
          }}
          className="absolute text-[#FDE68A]"
          style={{ left: sparkle.left, top: sparkle.top }}
        >
          <Sparkles size={sparkle.size} fill="#FDE68A" />
        </motion.div>
      ))}
    </div>
  );
}

function PodiumCard({ college, variant, maxPoints }) {
  const isWinner = variant === "gold";
  
  const variantStyles = {
    gold: {
      container: "min-h-[270px] lg:-mt-6 border-primary/40 bg-gradient-to-b from-[#FFFDF5] to-card",
      shadow: "shadow-[0_8px_28px_rgba(201,161,75,0.15)] hover:shadow-[0_16px_40px_rgba(201,161,75,0.22)]",
      badge: "bg-gradient-to-br from-primary to-[#EAC87A] border-white text-white shadow-sm",
      text: "text-primary",
    },
    silver: {
      container: "min-h-[230px] lg:mt-4 border-slate-300/50 bg-gradient-to-b from-[#F8FAFC] to-card",
      shadow: "shadow-[0_8px_24px_rgba(148,163,184,0.12)] hover:shadow-[0_16px_36px_rgba(148,163,184,0.18)]",
      badge: "bg-gradient-to-br from-slate-400 to-slate-200 border-white text-white shadow-sm",
      text: "text-slate-600",
    },
    bronze: {
      container: "min-h-[210px] lg:mt-8 border-amber-600/30 bg-gradient-to-b from-[#FFFBF0] to-card",
      shadow: "shadow-[0_8px_24px_rgba(217,119,6,0.12)] hover:shadow-[0_16px_36px_rgba(217,119,6,0.18)]",
      badge: "bg-gradient-to-br from-amber-600 to-amber-400 border-white text-white shadow-sm",
      text: "text-amber-700",
    }
  }[variant];

  const progress = maxPoints > 0 ? (college.points / maxPoints) * 100 : 0;

  return (
    <motion.article 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={clsx(
        "relative flex flex-col items-center justify-center rounded-[20px] border-2 px-4 pb-6 pt-10 text-center transition-all duration-300 cursor-default",
        variantStyles.container,
        variantStyles.shadow
      )}
    >
      {/* Animated Rank Badge */}
      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className={clsx(
          "absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full border-[3px] text-lg font-black shadow-md z-20",
          variantStyles.badge
        )}
      >
        {college.rank}
      </motion.div>

      {isWinner && <WinnerSparkles />}

      <CollegeMark college={college} size={isWinner ? "lg" : "md"} />
      
      <h3 className="mt-4 max-w-[14rem] text-base font-bold leading-tight tracking-tight text-foreground">
        {college.name}
      </h3>
      
      {isWinner && (
        <div className="mt-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-primary">
          Top Campus 🏆
        </div>
      )}

      <div className="mt-4 flex flex-col items-center gap-1.5 w-full px-2">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className={clsx("text-3xl font-black leading-none", variantStyles.text)}>
            {college.points}
          </span>
          <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider">weekly pts</span>
        </div>
        
        {/* Tiny Progress Bar */}
        <div className="mt-1 h-1.5 w-full max-w-[100px] overflow-hidden rounded-full bg-border">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={clsx("h-full rounded-full", variantStyles.badge)}
          />
        </div>
      </div>
    </motion.article>
  );
}

export default function CampusLeaderboard({ apiUrl }) {
  const { data, isLoading: loading } = useApiQuery(
    "users-leaderboard",
    "/api/users/leaderboard",
    {
      refetchInterval: POLL_INTERVAL_MS,
      staleTime: POLL_INTERVAL_MS,
    }
  );

  const leaders = useMemo(() => {
    if (!data) return [];
    return normalizeLeaderboard(data);
  }, [data]);

  const lastUpdated = data?.lastUpdated || null;

  const podium = useMemo(() => {
    const first = leaders.find(item => item.rank === 1);
    const second = leaders.find(item => item.rank === 2);
    const third = leaders.find(item => item.rank === 3);
    return { first, second, third };
  }, [leaders]);
  
  const tableRows = leaders.filter(item => item.rank >= 4);
  const maxPoints = podium.first?.points || 1;

  return (
    <section className="relative mx-auto max-w-[980px] overflow-visible rounded-3xl border border-border bg-card p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] sm:p-6 lg:p-8">
      {/* Soft Top Gradient */}
      <div className="absolute inset-x-0 top-0 h-32 rounded-t-3xl bg-gradient-to-b from-background to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 border border-primary/20 shadow-[0_2px_8px_rgba(252, 211, 77,0.12)]">
              <Trophy size={24} strokeWidth={2.5} className="text-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Campus Leaderboard
                </h2>
                <span className="flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-0.5 text-[10px] font-bold text-danger border border-danger/20 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger animate-ping" />
                  Live
                </span>
              </div>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-foreground-muted">
            Celebrating colleges with the most verified students on CampusAdda
          </p>
        </div>
        <div className="flex w-full max-w-[14rem] items-center gap-3 rounded-2xl border border-border bg-secondary-background px-3.5 py-2.5 shadow-xs">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-card shadow-sm border border-border">
            <Clock3 size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Last Updated</p>
            <p className="mt-0.5 text-xs font-semibold text-foreground-muted">{formatTimestamp(lastUpdated)}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="relative z-10 mt-8 rounded-2xl border-2 border-dashed border-border bg-background py-12 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="mx-auto h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-foreground-muted">Building leaderboard...</p>
        </div>
      ) : leaders.length === 0 ? (
        <div className="relative z-10 mt-8 rounded-2xl border-2 border-dashed border-border bg-background py-12 text-center">
          <p className="text-sm font-bold text-foreground-muted">No colleges ranked yet.</p>
          <p className="mt-2 text-xs font-medium text-foreground-muted">Rankings appear as more verified students join.</p>
        </div>
      ) : (
        <>
          <div className="relative z-10 mt-10 grid items-end gap-4 lg:grid-cols-[1fr_1.1fr_1fr]">
            {podium.second && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <PodiumCard college={podium.second} variant="silver" maxPoints={maxPoints} />
              </motion.div>
            )}
            {podium.first && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <PodiumCard college={podium.first} variant="gold" maxPoints={maxPoints} />
                </motion.div>
              </motion.div>
            )}
            {podium.third && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <PodiumCard college={podium.third} variant="bronze" maxPoints={maxPoints} />
              </motion.div>
            )}
          </div>

          <div className="relative z-10 mt-8 flex flex-col gap-2">
            <div className="hidden grid-cols-[4rem_minmax(0,1fr)_10rem] rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-foreground-muted md:grid">
              <span>Rank</span>
              <span>College</span>
              <span className="text-right">Weekly Points</span>
            </div>
            
            <div className="space-y-2">
              {tableRows.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border bg-background py-8 text-center">
                  <p className="text-xs font-bold text-foreground-muted">More ranked colleges will appear here.</p>
                </div>
              ) : tableRows.map((college, idx) => (
                <motion.div 
                  key={college.name} 
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.35 + idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.015, x: 6, backgroundColor: "var(--color-card)" }}
                  className="grid items-center gap-3 rounded-2xl border border-border/60 px-4 py-3 shadow-xs transition-all hover:border-primary/40 hover:shadow-[0_4px_16px_rgba(252, 211, 77,0.12)] md:grid-cols-[4rem_minmax(0,1fr)_10rem] bg-secondary-background cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border text-sm font-black text-foreground-muted shadow-sm transition-colors group-hover:border-primary">
                      {college.rank}
                    </div>
                  </div>
                  
                  <div className="flex min-w-0 items-center gap-3">
                    <CollegeMark college={college} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{college.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-foreground-muted">
                        <UsersRound size={12} />
                        {pluralizeStudents(college.verifiedStudents)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center px-2 text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-base font-bold text-primary">{college.points}</span>
                      <span className="text-[10px] font-bold uppercase text-foreground-muted">pts</span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${maxPoints > 0 ? (college.points/maxPoints)*100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.4 + idx * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="relative z-10 mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-hover shadow-md">
            <Star size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground">How it works?</p>
            <p className="mt-0.5 text-xs font-medium text-foreground-muted">
              Colleges earn points based on the number of verified students on CampusAdda.
            </p>
          </div>
        </div>
        <p className="text-left text-sm font-bold text-primary sm:text-right px-2 py-1.5 rounded-lg bg-background">
          Invite more. Earn more. Climb the ranks! 🚀
        </p>
      </div>
    </section>
  );
}
