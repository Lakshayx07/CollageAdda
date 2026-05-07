"use client";
// Triggering fresh deployment with detailed error logging
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase";
import { Camera, ChevronRight, Loader2, Sparkles, User, Calendar, CheckCircle2 } from "lucide-react";

const STEPS = [
  { id: 1, title: "Profile Picture", icon: <Camera className="w-5 h-5" /> },
  { id: 2, title: "Your Name", icon: <User className="w-5 h-5" /> },
  { id: 3, title: "Batch Year", icon: <Calendar className="w-5 h-5" /> },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Form Data
  const [fullName, setFullName] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
    };
    checkUser();
  }, [router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let avatarUrl = "";

      // 1. Upload Avatar to Supabase Storage
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (uploadError) {
          console.error("Storage Upload Error:", uploadError);
          throw new Error(`Upload failed: ${uploadError.message}. Did you create the 'avatars' bucket in Supabase Storage?`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      // 2. Update Profiles Table
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          batch_year: batchYear,
          is_onboarding_complete: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileError) {
        console.error("Profile Upsert Error:", profileError);
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      // 3. Create First Post
      const { error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: "Just joined Campus Adda! 🎉",
          image_url: avatarUrl,
          post_type: "profile_picture",
        });

      if (postError) {
        console.error("Post Creation Error:", postError);
        // We don't necessarily want to block onboarding if the post fails, 
        // but for now let's track it.
      }

      // 4. Update local storage user if exists (for legacy compat)
      const stored = localStorage.getItem("collegeadda_user");
      if (stored) {
        const u = JSON.parse(stored);
        u.name = fullName;
        u.profilePic = avatarUrl;
        u.isOnboardingComplete = true;
        localStorage.setItem("collegeadda_user", JSON.stringify(u));
      }

      // Success Redirect
      router.push("/profile");
    } catch (err) {
      console.error("FULL ONBOARDING ERROR:", err);
      alert(`Error: ${err.message || "Failed to complete onboarding. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) return !avatarFile;
    if (currentStep === 2) return fullName.length < 3;
    if (currentStep === 3) return !batchYear;
    return false;
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 mb-4 shadow-lg shadow-purple-500/20"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Welcome to Campus Adda
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Let's get your profile ready in 3 quick steps.</p>
        </div>

        {/* Progress Bar */}
        <div className="relative h-1.5 w-full bg-zinc-800 rounded-full mb-10 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          />
        </div>

        {/* Steps Content */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center space-y-6"
              >
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-purple-500 bg-zinc-800/50">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full shadow-lg border-2 border-zinc-900 group-hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="text-center">
                  <h2 className="text-lg font-semibold">Upload Profile Photo</h2>
                  <p className="text-zinc-500 text-xs mt-1">Help your college mates recognize you!</p>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-white"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 ml-1">Minimum 3 characters required.</p>
                </div>
                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                  <p className="text-xs text-purple-400 leading-relaxed italic">
                    "Your name is how students will find you on Campus Adda."
                  </p>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Pass out Year</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <select
                      value={batchYear}
                      onChange={(e) => setBatchYear(e.target.value)}
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition-all text-white appearance-none"
                    >
                      <option value="" disabled>Select Year</option>
                      {[2024, 2025, 2026, 2027, 2028, 2029].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronRight className="w-4 h-4 text-zinc-500 rotate-90" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-2xl text-center">
                      <p className="text-xl font-bold text-white">🎓</p>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Connections</p>
                   </div>
                   <div className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-2xl text-center">
                      <p className="text-xl font-bold text-white">🔥</p>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">University Feed</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="mt-10 flex items-center justify-between gap-4">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-4 rounded-2xl border border-zinc-800 text-zinc-400 font-medium hover:bg-zinc-800 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isNextDisabled() || loading}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all shadow-xl ${
              isNextDisabled() || loading 
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] active:scale-[0.98] shadow-purple-500/20"
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {currentStep === 3 ? "Complete Setup" : "Continue"}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Step Indicators */}
      <div className="flex gap-2 mt-8">
        {STEPS.map((s) => (
          <div 
            key={s.id}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              s.id === currentStep ? "w-8 bg-purple-500" : s.id < currentStep ? "bg-green-500" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
