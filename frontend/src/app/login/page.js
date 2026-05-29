"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Mail, Lock, School, User as UserIcon, ArrowRight, Zap, Star } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

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
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
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
            className="mb-8 text-center lg:hidden"
          >
            <div className="mb-4 inline-flex items-center justify-center rounded-3xl border border-white/10 p-3 shadow-2xl glass">
              <div className="brand-mark flex h-12 w-12 items-center justify-center rounded-2xl text-white">
                <Zap size={24} fill="currentColor" />
              </div>
            </div>
            <h1 className="mb-2 text-4xl font-black tracking-tight text-white">
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
            className="glass-card relative overflow-hidden rounded-[2rem] border border-white/6 p-7 sm:p-9"
          >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl -z-10" />

          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300/80">
                Start here
              </p>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Step into your college circle
              </h2>
              <p className="text-sm leading-6 text-white/54">
                Sign in with Google for the fastest setup, then choose your campus to unlock the student network.
              </p>
            </div>

            {/* 1. Google Login at the TOP */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert('Google Login Failed')}
                theme="filled_black"
                shape="pill"
                size="large"
                text="signin_with"
                width="100%"
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative glass rounded-full border border-white/5 px-6 py-1 text-[9px] font-black uppercase tracking-widest text-white/20">
                Join Campus
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              {/* 2. University Selection below Google */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Your Campus</label>
                <div className="relative group">
                  <div className={clsx("absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors z-10", !university ? "text-gray-800" : "text-white/20 group-focus-within:text-purple-500")}>
                    <School size={18} />
                  </div>
                  <select
                    required
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className={clsx(
                      "w-full appearance-none rounded-2xl py-4 pl-14 pr-12 text-sm font-bold transition-all focus:outline-none cursor-pointer",
                      !university
                        ? "border border-cyan-200/45 bg-[linear-gradient(90deg,rgba(240,248,255,0.88),rgba(217,244,247,0.92))] text-slate-900 shadow-[0_0_28px_rgba(34,199,214,0.18)]"
                        : "glass border border-white/5 text-white focus:border-cyan-300/45"
                    )}
                  >
                    <option value="" disabled className="bg-[#0A0A0F] text-gray-400">
                      Select Your University
                    </option>
                    {colleges.map((c, idx) => (
                      <option key={c._id || c.id || idx} value={c.name} className="bg-[#0A0A0F] text-white">{c.name}</option>
                    ))}
                  </select>
                  <div className={clsx("absolute inset-y-0 right-5 flex items-center pointer-events-none z-10", !university ? "text-gray-800" : "text-white/20")}>
                    <MapPin size={16} />
                  </div>
                </div>
              </div>

              {/* 3. Access Campus Button below University */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="flex h-16 w-full items-center justify-center rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(124,92,255,0.22),rgba(34,199,214,0.2))] py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:border-white/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center">
                    {isSignUp ? "Create My Account" : "Access Campus"}
                    <ArrowRight size={16} className="ml-2" />
                  </span>
                )}
              </motion.button>

              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5 border-dashed"></div>
                </div>
                <div className="relative bg-[#0F1420] px-4 py-1 text-[8px] font-bold uppercase tracking-widest text-white/10">
                  Or use email access
                </div>
              </div>

              {/* 4. Email and Secret Key at the BOTTOM */}
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    key="signup-fields"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-6 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Full Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-purple-500 transition-colors">
                          <UserIcon size={18} />
                        </div>
                        <input
                          type="text"
                          required={isSignUp}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Rahul Sharma"
                          className="w-full glass border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-white/10"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">College Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-purple-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full glass border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-4">Secret Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-purple-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[11px] text-white/20 font-bold">
              {isSignUp ? "Already part of the squad?" : "New on campus?"}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-purple-400 hover:text-purple-300 font-black uppercase tracking-wider underline underline-offset-4 decoration-purple-500/30"
              >
                {isSignUp ? "Sign In" : "Register"}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center space-x-6 text-[9px] text-white/10 font-black uppercase tracking-[0.2em]"
        >
          <div className="flex items-center"><Star size={10} className="mr-1" /> Terms</div>
          <div className="flex items-center"><Star size={10} className="mr-1" /> Privacy</div>
          <div className="flex items-center"><Star size={10} className="mr-1" /> Help</div>
        </motion.div>
      </div>
    </div>
    </div>
    </GoogleOAuthProvider>
  );
}
