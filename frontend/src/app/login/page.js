"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/utils/supabase";
import { MapPin, Mail, Lock, School } from "lucide-react";

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
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              university: university
            }
          }
        });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // In a real app, you would also update/check their university upon login
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Auth Error:", error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!university) {
      alert("Please select your university before continuing with Google.");
      return;
    }
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login Error:", error.message);
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
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 bg-white text-black py-3 px-4 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
        >
          <Image 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google" 
            width={24} 
            height={24} 
          />
          <span>Continue with Google</span>
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
