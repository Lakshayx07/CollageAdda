"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Mail, Lock, School, User as UserIcon } from "lucide-react";
import { supabase } from "../../utils/supabase";

const UNIVERSITIES = [
  "Rishihood University, Sonipat",
  "Delhi University (DU)",
  "Jawaharlal Nehru University (JNU)",
  "Amity University, Noida",
  "Ashoka University, Sonipat",
  "SRM University, Delhi-NCR",
  "IIT Delhi",
  "DTU (Delhi Technological University)",
  "Other"
];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");

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

      // Save token and user info
      localStorage.setItem('collegeadda_token', data.token);
      localStorage.setItem('collegeadda_user', JSON.stringify(data));
      
      // Redirect to home
      window.location.href = '/';
      
    } catch (error) {
      console.error("Auth Error:", error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) return;
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && session.user) {
        const user = session.user;
        const pendingUni = localStorage.getItem('pending_university');
        
        // Sync with backend
        try {
          setIsLoading(true);
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
          const res = await fetch(`${apiUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: user.user_metadata.full_name || user.email.split('@')[0],
              email: user.email,
              password: user.id, // Use supabase ID as password for simplicity in this bridge
              university: pendingUni || "Other"
            })
          });

          // If register fails because user exists, try login
          let data;
          if (!res.ok) {
            const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                password: user.id
              })
            });
            data = await loginRes.json();
            if (!loginRes.ok) throw new Error(data.message || 'OAuth Sync Failed');
          } else {
            data = await res.json();
          }

          localStorage.setItem('collegeadda_token', data.token);
          localStorage.setItem('collegeadda_user', JSON.stringify(data));
          localStorage.removeItem('pending_university');
          window.location.href = '/';
        } catch (err) {
          console.error("OAuth Sync Error:", err);
          // alert("Error syncing Google account. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleAuthCallback();
  }, []);

  const [linkSent, setLinkSent] = useState(false);

  const handleMagicLink = async () => {
    if (!supabase) {
      alert("Supabase is not configured. Please check your environment variables.");
      return;
    }
    if (!email) {
      alert("Please enter your email first to receive a Magic Link.");
      return;
    }
    if (!university) {
      alert("Please select your university first to continue.");
      return;
    }
    
    try {
      setIsLoading(true);
      localStorage.setItem('pending_university', university);
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      
      if (error) throw error;
      setLinkSent(true);
      alert("Magic Link sent! Check your email to login.");
    } catch (error) {
      console.error("Magic Link Error:", error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden py-10">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/30 rounded-full blur-[120px]" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl z-10 animate-fade-in relative">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Campus Adda
          </h1>
          <p className="text-muted text-sm">Join the exclusive student network</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 mb-6">
          {isSignUp && (
            <div>
              <label className="block text-xs text-muted mb-1 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma" 
                  className="w-full bg-surface-hover border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-muted mb-1 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu" 
                className="w-full bg-surface-hover border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-surface-hover border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1 ml-1">Select University (Required)</label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <select 
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-surface-hover border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option value="" disabled>Choose your campus...</option>
                {UNIVERSITIES.map(uni => (
                  <option key={uni} value={uni}>{uni}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <MapPin className="text-muted" size={16} />
              </div>
            </div>
            <p className="text-[10px] text-muted mt-1 ml-1">Includes nearby universities in your region</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 mt-2 flex justify-center items-center h-12"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              isSignUp ? "Create Account" : "Sign In"
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
          <div className="relative bg-surface px-4 text-xs text-muted rounded-full">Or</div>
        </div>

        <button
          type="button"
          onClick={handleMagicLink}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 bg-white text-black py-3 px-4 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
        >
          <Mail className="text-primary" size={20} />
          <span>{linkSent ? "Link Sent! Check Email" : "Send Magic Link"}</span>
        </button>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted">{isSignUp ? "Already have an account?" : "New to Campus Adda?"}</span>
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-primary hover:text-primary-hover font-medium"
          >
            {isSignUp ? "Sign In" : "Create one"}
          </button>
        </div>

        <div className="mt-8 text-center text-[10px] text-muted">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
