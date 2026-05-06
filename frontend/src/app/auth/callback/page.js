"use client";
import { useEffect } from "react";
import { supabase } from "../../../utils/supabase";

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) return;

      try {
        console.log("-----------")
        let session, data;
        try {
          data = await supabase.auth.getSession();
          console.log("111111111", data)
          session = data.session
          console.log("222222222", session)
        } catch (error) {
          console.log("333333333", error)
        }

        if (session && session.user) {

          const user = session.user;
          const pendingUni = localStorage.getItem('pending_university');
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

          // Sync with our custom backend
          let res = await fetch(`${apiUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: user.user_metadata.full_name || user.email.split('@')[0],
              email: user.email,
              password: user.id,
              university: pendingUni || "Other"
            })
          });

          let data;
          if (!res.ok) {
            // If user already exists, just login
            const loginRes = await fetch(`${apiUrl}/api/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                password: user.id
              })
            });
            data = await loginRes.json();
          } else {
            data = await res.json();
          }

          if (data.token) {
            localStorage.setItem('collegeadda_token', data.token);
            localStorage.setItem('collegeadda_user', JSON.stringify(data));
            localStorage.removeItem('pending_university');
            window.location.href = '/';
          }
        } else {
          window.location.href = '/login';
        }
      } catch (err) {
        console.error("OAuth Sync Error:", err);
        window.location.href = '/login?error=sync_failed';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted font-medium">Verifying your identity...</p>
      </div>
    </div>
  );
}
