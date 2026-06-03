"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  CalendarDays,
  Lock,
  Mail,
  MapPin,
  Rocket,
  School,
  User as UserIcon,
  Users,
  VenetianMask,
  Zap
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [colleges, setColleges] = useState([
    { name: "Rishihood University" },
    { name: "School of Planning and Architecture (SPA)" },
    { name: "IIT Delhi" },
    { name: "Delhi Technological University (DTU)" },
    { name: "Netaji Subhas University of Technology (NSUT)" },
    { name: "IIIT Delhi" },
    { name: "University of Delhi (DU)" },
    { name: "Jawaharlal Nehru University (JNU)" },
    { name: "Jamia Millia Islamia" },
    { name: "Guru Gobind Singh Indraprastha University (IPU)" },
    { name: "Kurukshetra University" },
    { name: "YMCA Faridabad" }
  ]);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        // Fetch colleges without auth token since login is public
        const res = await fetch(`${apiUrl}/api/colleges/public`);
        // If public route doesn't exist, try the standard one (though it might require protect)
        const targetRes = res.ok ? res : await fetch(`${apiUrl}/api/colleges`);

        if (targetRes.ok) {
          const data = await targetRes.json();
          setColleges(data);
        }
      } catch {
        // Keep the curated fallback list when the backend is unavailable in dev.
      }
    };
    fetchColleges();
  }, [apiUrl]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!university) {
      alert("Please select your university to continue.");
      return;
    }

    try {
      setIsLoading(true);

      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

      const bodyData = isSignUp
        ? { name, email, password, university }
        : { email, password };

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('collegeadda_token', data.token);
      localStorage.setItem('collegeadda_user', JSON.stringify(data));

      window.location.href = '/';

    } catch (error) {
      console.error("Auth Error:", error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

      const res = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          university: university || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.message === 'University is required for registration') {
          alert("Welcome to Campus Adda! Since this is your first time, please select your university/campus from the dropdown below to complete your registration.");
          return;
        }
        throw new Error(data.message || 'Google Authentication failed');
      }

      localStorage.setItem('collegeadda_token', data.token);
      localStorage.setItem('collegeadda_user', JSON.stringify(data));

      window.location.href = '/';

    } catch (error) {
      console.error("Google Auth Error:", error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
    <div className="min-h-[100dvh] px-3 py-5 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100dvh-2.5rem)] max-w-7xl items-center gap-6 sm:gap-8 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block"
        >
          <div className="max-w-xl">
            <div className="app-chip mb-6 text-[11px] font-bold uppercase tracking-[0.2em]">
              <Zap size={14} className="text-cyan-300" />
              India&apos;s student discovery network
            </div>
            <div className="mb-6 flex items-center gap-4">
              <div className="brand-mark flex h-16 w-16 items-center justify-center rounded-[1.6rem] text-white">
                <Zap size={28} fill="currentColor" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tight text-white">
                  Campus Adda<span className="text-cyan-300">.</span>
                </h1>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-white/38">
                  Meet your campus people faster
                </p>
              </div>
            </div>
            <p className="max-w-lg text-lg leading-8 text-white/72">
              A place for Indian college students to discover campuses, connect with people who match their vibe, and stay close to the pulse of student life.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="app-panel rounded-[1.6rem] p-5">
                <p className="text-2xl font-black text-white">50+</p>
                <p className="mt-2 text-sm leading-6 text-white/55">Colleges ready to explore and compare.</p>
              </div>
              <div className="app-panel rounded-[1.6rem] p-5">
                <p className="text-2xl font-black text-white">Swipe</p>
                <p className="mt-2 text-sm leading-6 text-white/55">Discover students without awkward follow culture.</p>
              </div>
              <div className="app-panel rounded-[1.6rem] p-5">
                <p className="text-2xl font-black text-white">Private</p>
                <p className="mt-2 text-sm leading-6 text-white/55">Verified, campus-focused conversations inside the app.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="w-full max-w-xl justify-self-center lg:max-w-lg z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-5 text-center sm:mb-8 lg:hidden"
          >
            <div className="mb-4 inline-flex items-center justify-center rounded-3xl border border-white/10 p-3 shadow-2xl glass">
              <div className="brand-mark flex h-12 w-12 items-center justify-center rounded-2xl text-white">
                <Zap size={24} fill="currentColor" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Campus Adda<span className="text-cyan-300">.</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              Join the exclusive student network
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-[1.55rem] border border-[#cfa75d]/22 bg-[radial-gradient(circle_at_74%_12%,rgba(207,167,93,0.16),transparent_24%),linear-gradient(180deg,rgba(18,23,32,0.96),rgba(8,12,17,0.98))] p-4 shadow-[0_24px_72px_rgba(0,0,0,0.42)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(244,207,114,0.08),transparent)]" />

            <div className="relative">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#d7ad52] text-[#111017] shadow-[0_0_24px_rgba(244,207,114,0.34)]">
                  <Zap size={18} fill="currentColor" />
                </div>
                <p className="text-base font-black tracking-tight text-white">
                  Campus<span className="text-[#f4cf72]">Adda</span>
                </p>
              </div>

              <div className="grid gap-2.5">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black leading-[1.04] tracking-tight text-[#f4cf72]">
                    Your Campus.<br />
                    Your Community.
                  </h2>
                  <p className="max-w-sm text-[11px] leading-5 text-white/68">
                    Connect with students, discover events, build projects and grow together.
                  </p>
                </div>

                <div className="relative min-h-24 overflow-hidden rounded-[1.1rem] border border-white/0 sm:min-h-28">
                  <div className="absolute inset-x-10 bottom-4 h-6 bg-[#f4cf72]/18 blur-2xl" />
                  <svg
                    viewBox="0 0 520 210"
                    className="relative h-full min-h-24 w-full drop-shadow-[0_0_14px_rgba(244,207,114,0.3)] sm:min-h-28"
                    role="img"
                    aria-label="Campus building illustration"
                  >
                    <g fill="none" stroke="#f4cf72" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
                      <path d="M182 177h166M225 177v-73h80v73M211 104h108M237 104l28-32 28 32M265 72V43M265 43h35l-8 12 8 12h-35" />
                      <path d="M245 177v-34c0-12 9-22 20-22s20 10 20 22v34M260 139h10M168 177v-62h57M348 177v-62h57M158 115h68M348 115h68" />
                      <path d="M184 134h12v29h-12zM211 134h12v29h-12zM370 134h12v29h-12zM397 134h12v29h-12z" />
                      <circle cx="265" cy="111" r="18" />
                      <path d="M265 101v12l8 5M109 177c0-18 14-32 31-32s31 14 31 32M132 145c0-11 8-20 18-20s18 9 18 20M384 177c0-18 14-32 31-32s31 14 31 32M397 146c0-12 9-22 20-22s20 10 20 22" />
                      <path d="M96 102c9-17 29-25 47-16 6-18 30-19 40-4 7-3 16-1 22 4M407 93c9-17 29-25 47-16 6-18 30-19 40-4 7-3 16-1 22 4" opacity=".7" />
                    </g>
                    <g fill="#f4cf72">
                      <circle cx="132" cy="41" r="2" />
                      <circle cx="154" cy="66" r="1.5" />
                      <circle cx="370" cy="38" r="2.5" />
                      <circle cx="402" cy="62" r="1.5" />
                      <path d="M439 35l3 7 7 3-7 3-3 7-3-7-7-3 7-3zM103 69l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
                    </g>
                  </svg>
                </div>

                <form onSubmit={handleAuth} className="space-y-2.5">
                  <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-5 z-10 flex items-center text-[#e8c775] transition-colors group-focus-within:text-[#f4cf72]">
                      <School size={18} />
                    </div>
                    <select
                      required
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-[#f4cf72]/78 bg-black/48 pl-13 pr-12 text-xs font-bold text-[#e8c775] shadow-[0_0_18px_rgba(244,207,114,0.16)] transition-all focus:border-[#f4cf72] focus:outline-none focus:shadow-[0_0_22px_rgba(244,207,114,0.2)]"
                    >
                      <option value="" disabled className="bg-[#0A0A0F] text-gray-400">
                        Select Your Campus
                      </option>
                      {colleges.map((c, idx) => (
                        <option key={c._id || c.id || idx} value={c.name} className="bg-[#0A0A0F] text-white">{c.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-5 z-10 flex items-center text-[#e8c775]">
                      <MapPin size={16} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#f4cf72]/78 bg-black/28 p-1.5 shadow-[0_0_20px_rgba(244,207,114,0.18)]">
                    <div className="flex h-9 w-full items-center justify-center overflow-hidden rounded-lg bg-[#131313]">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => alert('Google Login Failed')}
                        theme="filled_black"
                        shape="rectangular"
                        size="large"
                        text="continue_with"
                        width="370"
                      />
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#f4cf72]/32 to-transparent" />
                    <span className="px-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/45">
                      Or use email access
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#f4cf72]/32 to-transparent" />
                  </div>

                  <AnimatePresence mode="wait">
                    {isSignUp && (
                      <motion.div
                        key="signup-fields"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <div className="space-y-1.5">
                          <label className="ml-4 text-[8px] font-black uppercase tracking-widest text-white/38">Full Name</label>
                          <div className="relative group">
                            <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-white/24 transition-colors group-focus-within:text-[#f4cf72]">
                              <UserIcon size={18} />
                            </div>
                            <input
                              type="text"
                              required={isSignUp}
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Rahul Sharma"
                              className="h-10 w-full rounded-xl border border-white/10 bg-[#111723]/72 pl-14 pr-6 text-xs text-white transition-all placeholder:text-white/18 focus:border-[#f4cf72]/70 focus:outline-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <label className="ml-4 text-[8px] font-black uppercase tracking-widest text-white/38">College Email</label>
                    <div className="relative group">
                      <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-white/24 transition-colors group-focus-within:text-[#f4cf72]">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@college.edu"
                        className="h-10 w-full rounded-xl border border-white/10 bg-[#111723]/72 pl-14 pr-6 text-xs text-white transition-all placeholder:text-white/18 focus:border-[#f4cf72]/70 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="ml-4 text-[8px] font-black uppercase tracking-widest text-white/38">Secret Key</label>
                    <div className="relative group">
                      <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-white/24 transition-colors group-focus-within:text-[#f4cf72]">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-10 w-full rounded-xl border border-white/10 bg-[#111723]/72 pl-14 pr-6 text-xs text-white transition-all placeholder:text-white/18 focus:border-[#f4cf72]/70 focus:outline-none"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="flex h-10 w-full items-center justify-center rounded-xl border border-[#f4cf72]/25 bg-[linear-gradient(135deg,rgba(196,143,48,0.95),rgba(244,207,114,0.78))] text-[9px] font-black uppercase tracking-[0.18em] text-[#10131d] shadow-[0_14px_26px_rgba(244,207,114,0.17)] transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <span className="flex items-center">
                        {isSignUp ? "Create Account" : "Access Campus"}
                        <ArrowRight size={17} className="ml-2" />
                      </span>
                    )}
                  </motion.button>
                </form>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#f4cf72]/36 to-transparent" />
                    <p className="text-xs font-bold text-white">Why join CampusAdda?</p>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#f4cf72]/36 to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { icon: Users, title: "Meet Students", copy: "Connect with peers" },
                      { icon: CalendarDays, title: "Campus Events", copy: "Discover workshops" },
                      { icon: Rocket, title: "Build & Collab", copy: "Find teammates" },
                      { icon: VenetianMask, title: "Anonymous Adda", copy: "Share freely" }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="text-center">
                          <Icon className="mx-auto mb-1 text-[#f4cf72]" size={17} />
                          <p className="text-[8px] font-black text-white">{item.title}</p>
                          <p className="mt-0.5 text-[8px] leading-3 text-white/54">{item.copy}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-semibold text-white/38">
                    {isSignUp ? "Already on CampusAdda?" : "New on CampusAdda?"}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="ml-2 font-black text-[#f4cf72] transition-colors hover:text-[#ffe29a]"
                    >
                      {isSignUp ? "Sign In" : "Create Account"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
      </div>
    </div>
    </div>
    </GoogleOAuthProvider>
  );
}
