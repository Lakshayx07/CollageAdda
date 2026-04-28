"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/utils/supabase";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login Error:", error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
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

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 bg-white text-black py-3 px-4 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
        >
          {isLoading ? (
             <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Image 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
                width={24} 
                height={24} 
              />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="mt-8 text-center text-xs text-muted">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
