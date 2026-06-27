"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Clock3, Sparkles, Star, Trophy, UsersRound } from "lucide-react";
import clsx from "clsx";

const POLL_INTERVAL_MS = 15000;

const LOCAL_LOGOS = [
  { pattern: /school of planning|architecture.*spa|\bspa\b/i, logo: "/college-logos/spa-delhi.png" },
  { pattern: /jawaharlal nehru|jnu/i, logo: "/college-logos/jnu.png" },
  { pattern: /amity/i, logo: "/college-logos/amity-university.png" },
  { pattern: /delhi university|university of delhi/i, logo: "/college-logos/delhi-university.png" },
  { pattern: /symbiosis/i, logo: "/college-logos/symbiosis.png" },
  { pattern: /christ/i, logo: "/college-logos/christ-university.png" }
];

const FALLBACK_COLORS = ["#1f8a70", "#7c3aed", "#2563eb", "#ea580c", "#be123c", "#047857", "#0891b2"];

const formatTimestamp = (value) => {
  if (!value) return "Refreshing...";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
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
    lg: "h-[68px] w-[68px]",
    md: "h-[58px] w-[58px]",
    sm: "h-10 w-10"
  }[size];
  const initials = initialsFor(college.name);
  const hasImage = typeof college.logo === "string" && college.logo.startsWith("/");

  return (
    <div className={clsx("grid shrink-0 place-items-center overflow-hidden rounded-full bg-white p-1.5 shadow-[0_8px_22px_rgba(0,0,0,0.32)] ring-2 ring-white/12", dimensions)} aria-hidden="true">
      {hasImage ? (
        <Image src={college.logo} alt="" width={72} height={72} className="h-full w-full rounded-full object-contain" />
      ) : (
        <div
          className="grid h-full w-full place-items-center rounded-full text-sm font-black text-white"
          style={{ backgroundColor: college.accent }}
        >
          {college.fallbackLogo && college.fallbackLogo.length <= 3 ? college.fallbackLogo : initials}
        </div>
      )}
    </div>
  );
}

function Ribbon({ rank, tone }) {
  const toneStyles = {
    gold: "from-yellow-100 via-yellow-300 to-amber-500 text-[#1b1200] shadow-[0_0_18px_rgba(250,204,21,0.42)]",
    silver: "from-slate-50 via-slate-300 to-slate-500 text-[#111827] shadow-[0_0_14px_rgba(203,213,225,0.24)]",
    bronze: "from-orange-200 via-orange-400 to-orange-700 text-[#1f0b00] shadow-[0_0_14px_rgba(251,146,60,0.26)]"
  };

  return (
    <div className="absolute -top-5 left-1/2 z-30 -translate-x-1/2">
      <div className={clsx("relative flex h-[52px] w-[42px] items-start justify-center bg-gradient-to-b pt-2 text-[22px] font-black leading-none", toneStyles[tone])}>
        <span className="relative z-20 drop-shadow-[0_1px_0_rgba(255,255,255,0.45)]">{rank}</span>
        <div className="absolute -left-3 top-2.5 h-7 w-4 rounded-l-full border-l border-t border-current/25 opacity-65" />
        <div className="absolute -right-3 top-2.5 h-7 w-4 rounded-r-full border-r border-t border-current/25 opacity-65" />
        <div className="absolute bottom-0 left-0 h-0 w-0 border-b-[12px] border-l-[21px] border-r-[21px] border-b-[#0a0a14] border-l-transparent border-r-transparent" />
      </div>
    </div>
  );
}

function WinnerSparkles() {
  const sparkles = [
    { left: "5%", top: "14%", size: 12, delay: "0s", duration: "1.7s" },
    { left: "18%", top: "8%", size: 9, delay: "0.35s", duration: "2.2s" },
    { left: "80%", top: "13%", size: 13, delay: "0.75s", duration: "1.9s" },
    { left: "92%", top: "33%", size: 10, delay: "1.05s", duration: "2.4s" },
    { left: "11%", top: "48%", size: 8, delay: "1.3s", duration: "2s" }
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {sparkles.map((sparkle, index) => (
        <Sparkles
          key={index}
          size={sparkle.size}
          className="leaderboard-twinkle absolute text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.82)]"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            animationDelay: sparkle.delay,
            animationDuration: sparkle.duration
          }}
        />
      ))}
    </div>
  );
}

function PodiumCard({ college, variant }) {
  const isWinner = variant === "gold";
  const variantStyles = {
    gold: "min-h-[250px] border-yellow-400/70 bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.33),rgba(120,53,15,0.20)_46%,rgba(12,12,24,0.94)_100%)] shadow-[0_0_34px_rgba(245,158,11,0.25)] lg:-mt-8 lg:min-h-[265px]",
    silver: "min-h-[210px] border-indigo-300/45 bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.20),rgba(67,56,202,0.13)_46%,rgba(12,12,24,0.95)_100%)] lg:mt-5",
    bronze: "min-h-[210px] border-orange-500/50 bg-[radial-gradient(circle_at_50%_0%,rgba(234,88,12,0.24),rgba(88,28,13,0.18)_46%,rgba(12,12,24,0.95)_100%)] lg:mt-5"
  };
  const pointsColor = {
    gold: "#facc15",
    silver: "#a5a6ff",
    bronze: "#fb923c"
  }[variant];

  return (
    <article className={clsx("relative flex flex-col items-center justify-center rounded-[1.05rem] border px-4 pb-5 pt-10 text-center", variantStyles[variant])}>
      <Ribbon rank={college.rank} tone={variant} />
      {isWinner && <WinnerSparkles />}
      <CollegeMark college={college} size={isWinner ? "lg" : "md"} />
      <h3 className="mt-4 max-w-[14rem] text-base font-black leading-tight tracking-tight text-white sm:text-lg">
        {college.name}
      </h3>
      {isWinner && (
        <div className="mt-2 rounded-md border border-yellow-300/10 bg-yellow-400/12 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: "#facc15" }}>
          Top Campus 🏆
        </div>
      )}
      <div className="mt-4 flex items-end justify-center gap-1.5">
        <span className="text-3xl font-black leading-none sm:text-4xl" style={{ color: pointsColor }}>{college.points}</span>
        <span className="pb-0.5 text-lg font-black text-white">pts</span>
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-white/72 sm:text-sm">
        <UsersRound size={15} />
        {pluralizeStudents(college.verifiedStudents)}
      </p>
    </article>
  );
}

export default function CampusLeaderboard({ apiUrl }) {
  const [leaders, setLeaders] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let timerId;

    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("collegeadda_token");
        if (!token) return;
        const response = await fetch(`${apiUrl}/api/users/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (!alive) return;
        setLeaders(normalizeLeaderboard(payload));
        setLastUpdated(payload?.lastUpdated || new Date().toISOString());
      } catch (error) {
        console.error("Error fetching campus leaderboard:", error);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchLeaderboard();
    timerId = window.setInterval(fetchLeaderboard, POLL_INTERVAL_MS);

    return () => {
      alive = false;
      window.clearInterval(timerId);
    };
  }, [apiUrl]);

  const podium = useMemo(() => {
    const first = leaders.find(item => item.rank === 1);
    const second = leaders.find(item => item.rank === 2);
    const third = leaders.find(item => item.rank === 3);
    return { first, second, third };
  }, [leaders]);
  const tableRows = leaders.filter(item => item.rank >= 4);

  return (
    <section className="relative mx-auto max-w-[980px] overflow-visible rounded-[1.35rem] border border-white/10 bg-[#0a0a14] p-4 shadow-2xl shadow-black/30 sm:p-5 lg:p-6">
      <style>{`
        @keyframes leaderboardTwinkle {
          0%, 100% { opacity: 0.32; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .leaderboard-twinkle { animation-name: leaderboardTwinkle; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
      `}</style>
      <div className="absolute inset-x-0 top-0 h-44 rounded-t-[1.35rem] bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.18),transparent_66%)]" />
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Trophy size={32} strokeWidth={2.4} style={{ color: "#8b5cf6" }} />
            <h2 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
              <span className="text-white">Campus </span>
              <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">Leaderboard</span>
            </h2>
          </div>
          <p className="mt-2 text-sm font-medium text-white/62">
            Celebrating colleges with the most verified students on CampusAdda
          </p>
        </div>
        <div className="flex w-full max-w-[15rem] items-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.055] px-3 py-2.5 shadow-lg shadow-black/20">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/8">
            <Clock3 size={17} className="text-white/78" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white/82">Last Updated</p>
            <p className="mt-0.5 text-[11px] font-medium text-white/74">{formatTimestamp(lastUpdated)}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="relative z-10 mt-8 rounded-2xl border border-dashed border-white/12 py-10 text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Building leaderboard...</p>
        </div>
      ) : leaders.length === 0 ? (
        <div className="relative z-10 mt-8 rounded-2xl border border-dashed border-white/12 py-10 text-center">
          <p className="text-sm font-bold text-white/45">No colleges ranked yet.</p>
          <p className="mt-2 text-xs text-white/30">Rankings appear as more verified students join.</p>
        </div>
      ) : (
        <>
          <div className="relative z-10 mt-12 grid items-end gap-3 lg:grid-cols-[0.96fr_1.12fr_0.96fr]">
            {podium.second && <PodiumCard college={podium.second} variant="silver" />}
            {podium.first && <PodiumCard college={podium.first} variant="gold" />}
            {podium.third && <PodiumCard college={podium.third} variant="bronze" />}
          </div>

          <div className="relative z-10 mt-5 overflow-hidden rounded-[1.05rem] border border-white/10 bg-white/[0.045] p-2.5">
            <div className="grid grid-cols-[4.25rem_minmax(0,1fr)_7rem_5.75rem] rounded-lg bg-white/[0.045] px-3.5 py-2.5 text-[10px] font-black uppercase tracking-[0.13em] text-white/55 max-md:hidden">
              <span>Rank</span>
              <span>College / University</span>
              <span className="text-center">Verified Students</span>
              <span className="text-right">Points</span>
            </div>
            <div className="mt-2 space-y-1.5">
              {tableRows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 py-6 text-center">
                  <p className="text-xs font-bold text-white/35">More ranked colleges will appear here.</p>
                </div>
              ) : tableRows.map(college => (
                <div key={college.name} className="grid items-center gap-2.5 rounded-xl bg-[#12182a]/82 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] md:grid-cols-[4.25rem_minmax(0,1fr)_7rem_5.75rem]">
                  <div className="flex items-center gap-2.5 md:block">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.075] text-sm font-black text-white/86">
                      {college.rank}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/38 md:hidden">Rank</span>
                  </div>
                  <div className="flex min-w-0 items-center gap-3">
                    <CollegeMark college={college} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white">{college.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-white/55">
                        <UsersRound size={12} />
                        {pluralizeStudents(college.verifiedStudents)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left text-sm font-black text-white md:text-center">{college.verifiedStudents}</div>
                  <div className="text-left text-base font-black text-white md:text-right">{college.points} pts</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="relative z-10 mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-800">
            <Star size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black" style={{ color: "#a78bfa" }}>How it works?</p>
            <p className="mt-0.5 text-xs font-medium text-white/62">
              Colleges earn points based on the number of verified students on CampusAdda.
            </p>
          </div>
        </div>
        <p className="text-left text-sm font-black sm:text-right" style={{ color: "#a78bfa" }}>
          Invite more. Earn more. Climb the ranks! 🚀
        </p>
      </div>
    </section>
  );
}
