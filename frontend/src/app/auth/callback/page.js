"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) return;

      try {
        // The @supabase/ssr client in utils/supabase.js will handle 
        // the cookie exchange automatically when this page loads.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session && session.user) {
          // Optional: Sync with your custom backend if you still need it for other features
          const user = session.user;
          const userData = {
            _id: user.id,
            name: user.user_metadata.full_name || user.email.split('@')[0],
            email: user.email,
            university: localStorage.getItem('pending_university') || "Other",
            token: session.access_token
          };

          localStorage.setItem('collegeadda_token', session.access_token);
          localStorage.setItem('collegeadda_user', JSON.stringify(userData));
          localStorage.removeItem('pending_university');

          // Redirect to home (Middleware will handle the onboarding check)
          router.push("/");
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("OAuth Callback Error:", err);
        router.push("/login?error=auth_failed");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted font-medium">Completing login...</p>
      </div>
    </div>
  );
}
