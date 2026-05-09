"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Mail, Lock, School, User as UserIcon, ArrowRight, Zap, Star } from "lucide-react";
import { supabase } from "../../utils/supabase";
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
    { name: "Guru Gobind Singh Indraprastha University (IPU)" }
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
      } catch (err) {
        console.error("Error fetching colleges:", err);
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

  const handleGoogleLogin = async () => {
    if (!supabase) {
      alert("Supabase is not configured.");
      return;
    }
    if (!university) {
      alert("Please select your university first.");
      return;
    }

    try {
      setIsLoading(true);
      localStorage.setItem('pending_university', university);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 relative overflow-hidden py-10">
      {/* Background Decorative Glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-600/10 blur-[150px] rounded-full z-0" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      <div className="w-full max-w-lg z-10">
        {/* Logo/Brand Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-3 glass rounded-3xl mb-4 border border-white/10 shadow-2xl">
            <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Zap size={24} fill="currentColor" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            Campus Adda<span className="text-purple-500">.</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">
            Join the exclusive student network
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-[3rem] p-8 sm:p-12 border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl -z-10" />
          
          <form onSubmit={handleAuth} className="space-y-6">
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
                    "w-full rounded-2xl py-4 pl-14 pr-12 text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer",
                    !university 
                      ? "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-900 border-[3px] border-gray-300 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_25px_rgba(209,213,219,0.3)] hover:shadow-[0_0_35px_rgba(209,213,219,0.5)]"
                      : "glass border border-white/5 text-white focus:border-purple-500/50"
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

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full gradient-bg py-5 rounded-[2rem] text-[11px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 flex justify-center items-center h-16 disabled:opacity-50"
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
          </form>

          <div className="relative flex items-center justify-center my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative glass px-6 py-1 text-[10px] text-white/20 font-black uppercase tracking-widest rounded-full border border-white/5">
              Social Connect
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full glass flex items-center justify-center space-x-4 py-4 rounded-[1.5rem] border border-white/5 hover:border-white/20 transition-all disabled:opacity-50"
          >
            <div className="w-6 h-6 relative">
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xs font-black text-white/60 uppercase tracking-widest">Sign in with Google</span>
          </motion.button>

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
  );
}
