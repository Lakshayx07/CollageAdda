"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Check, PartyPopper, Phone, SkipForward, Sparkles, User } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import clsx from "clsx";
import AnimatedBackground from "@/components/AnimatedBackground";
import { saveProfileAvatarUrl, uploadAvatar } from "@/utils/supabaseUploads";
import { getDefaultAvatar } from "@/utils/defaultAvatars";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").trim();

const batchOptions = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];
const courseOptions = ["B.Tech", "BCA", "MCA", "MBA", "B.Sc", "M.Tech", "B.Com", "BA", "Other"];
const studyYearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"];
const interestOptions = [
  "Hackathons",
  "Coding",
  "Design",
  "Gaming",
  "Music",
  "Sports",
  "Placements",
  "Startups",
  "Content Creation",
  "Photography",
  "Reading",
  "Cultural Events"
];

const emptyForm = {
  name: "",
  profilePic: "",
  passOutBatch: "",
  course: "",
  branch: "",
  studyYear: "",
  interests: [],
  bio: "",
  phone: "",
  linkedin: "",
  github: "",
  instagram: ""
};



const MAX_LOCAL_AVATAR_LENGTH = 350_000;

const persistLocalUser = (profile) => {
  if (!profile) return;

  const localProfile = { ...profile };
  if (
    typeof localProfile.profilePic === "string" &&
    localProfile.profilePic.startsWith("data:") &&
    localProfile.profilePic.length > MAX_LOCAL_AVATAR_LENGTH
  ) {
    delete localProfile.profilePic;
  }

  try {
    localStorage.setItem("collegeadda_user", JSON.stringify(localProfile));
  } catch (storageError) {
    try {
      const minimalProfile = {
        _id: profile._id,
        id: profile.id,
        name: profile.name,
        email: profile.email,
        university: profile.university,
        onboardingStep: profile.onboardingStep,
        onboardingComplete: profile.onboardingComplete
      };
      localStorage.setItem("collegeadda_user", JSON.stringify(minimalProfile));
    } catch {
      console.warn("Could not cache the user profile locally.", storageError);
    }
  }
};

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const completedRequiredFields = useMemo(() => {
    return Boolean(
      form.name.trim() &&
      form.profilePic &&
      form.passOutBatch &&
      form.course &&
      form.branch.trim() &&
      form.studyYear &&
      form.interests.length >= 3
    );
  }, [form]);

  useEffect(() => {
    const token = localStorage.getItem("collegeadda_token");
    const stored = localStorage.getItem("collegeadda_user");
    if (!token || !stored) {
      router.push("/login");
      return;
    }

    const localUser = JSON.parse(stored);
    setUser(localUser);
    setForm({
      ...emptyForm,
      name: localUser.name || "",
      profilePic: localUser.profilePic || "",
      passOutBatch: localUser.passOutBatch || "",
      course: localUser.course || "",
      branch: localUser.branch || "",
      studyYear: localUser.studyYear || localUser.year || "",
      interests: localUser.interests || [],
      bio: localUser.bio || "",
      phone: localUser.phone || "",
      linkedin: localUser.linkedin || "",
      github: localUser.github || "",
      instagram: localUser.instagram || ""
    });
    setStep(Math.min(Math.max(localUser.onboardingStep || 1, 1), 9));

    const syncProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const profile = await res.json();
          if (profile.onboardingComplete) {
            router.push("/home");
            return;
          }
          setUser(profile);
          persistLocalUser(profile);
          setForm({
            ...emptyForm,
            name: profile.name || "",
            profilePic: profile.profilePic || "",
            passOutBatch: profile.passOutBatch || "",
            course: profile.course || "",
            branch: profile.branch || "",
            studyYear: profile.studyYear || profile.year || "",
            interests: profile.interests || [],
            bio: profile.bio || "",
            phone: profile.phone || "",
            linkedin: profile.linkedin || "",
            github: profile.github || "",
            instagram: profile.instagram || ""
          });
          setStep(Math.min(Math.max(profile.onboardingStep || 1, 1), 9));
        }
      } catch (err) {
        console.error(err);
      }
    };
    syncProfile();
  }, [router]);

  const saveProgress = async (nextStep, complete = false, overrides = {}) => {
    const token = localStorage.getItem("collegeadda_token");
    if (!token) return false;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        ...overrides,
        onboardingStep: nextStep,
        onboardingComplete: complete
      };
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not save onboarding.");
      setUser(data);
      setForm(prev => ({ ...prev, ...payload }));
      persistLocalUser(data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const validateStep = () => {
    if (step === 1 && !form.name.trim()) return "Full name is required.";
    if (step === 2 && !form.profilePic) return "Upload a photo or use a default avatar.";
    if (step === 3 && !form.passOutBatch) return "Select your graduation year.";
    if (step === 4 && (!form.course || !form.branch.trim())) return "Course and branch are required.";
    if (step === 5 && !form.studyYear) return "Select your current year of study.";
    if (step === 6 && form.interests.length < 3) return "Select at least 3 interests.";
    return "";
  };

  const goNext = async (overrides = {}) => {
    const validation = validateStep();
    if (validation) {
      setError(validation);
      return;
    }
    const nextStep = Math.min(step + 1, 9);
    if (await saveProgress(nextStep, false, overrides)) setStep(nextStep);
  };

  const skipPhoto = async () => {
    const avatar = getDefaultAvatar(form.name);
    setForm(prev => ({ ...prev, profilePic: avatar }));
    await goNext({ profilePic: avatar });
  };

  const finish = async () => {
    if (!completedRequiredFields) {
      setError("Complete steps 1 to 6 to enter Campus Adda.");
      return;
    }
    if (await saveProgress(9, true)) router.push("/home");
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setSaving(true);
    try {
      const userId = user?._id || user?.id;
      const { publicUrl } = await uploadAvatar(file, userId);
      await saveProfileAvatarUrl({
        userId,
        avatarUrl: publicUrl,
        name: form.name || user?.name,
        university: user?.university
      });
      setForm(prev => ({ ...prev, profilePic: publicUrl }));
    } catch (err) {
      setError(err.message || "Could not upload your profile picture.");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(item => item !== interest)
        : [...prev.interests, interest]
    }));
  };

  if (!user) return null;

  const fieldClass = "w-full rounded-2xl border border-[#E8E6E0] bg-[#F3F2EE] backdrop-blur-sm px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none transition focus:border-cyan-400 focus:bg-cyan-900/10 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]";

  return (
    <div className="relative min-h-screen bg-[#FAFAF8] px-4 py-5 text-[#1A1A1A] sm:px-6 lg:-ml-72 lg:px-10 overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-3xl flex-col">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.18em] text-[#C8922A]">
            <span>Step {Math.min(step, 8)} of 8</span>
            <span>{Math.round((Math.min(step, 8) / 8) * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-blue-900/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#D4A843] to-[#C8922A] transition-all shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              style={{ width: `${(Math.min(step, 8) / 8) * 100}%` }}
            />
          </div>
        </div>

        <section className="flex flex-1 items-center">
          <div className="w-full rounded-[1.75rem] border border-[#E8E6E0] bg-white/80 backdrop-blur-xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(34,211,238,0.05)] sm:p-10 relative overflow-hidden">
            {step === 1 && (
              <div className="space-y-5">
                <User className="text-[#C8922A]" size={34} />
                <h1 className="text-3xl font-black tracking-tight">What&apos;s your full name?</h1>
                <input className={fieldClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Camera className="text-[#C8922A]" size={34} />
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Add your profile picture</h1>
                  <p className="mt-2 text-sm text-[#888888]5">Use a campus-friendly photo or continue with a default avatar.</p>
                </div>
                <div className="flex flex-col items-center gap-5 sm:flex-row">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-cyan-300/40 bg-white/8">
                    {form.profilePic ? <img src={form.profilePic} className="h-full w-full object-cover" alt="Profile preview" /> : <img src={getDefaultAvatar(form.name)} className="h-full w-full object-cover" alt="Default avatar" />}
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-black">
                      Upload Photo
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                    </label>
                    <button onClick={skipPhoto} className="inline-flex items-center justify-center rounded-2xl border border-[#E8E6E0] px-5 py-3 text-sm font-black text-[#4A4A4A]">
                      <SkipForward size={16} className="mr-2" /> Use Initials Avatar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <h1 className="text-3xl font-black tracking-tight">Select your graduation year</h1>
                <select className={fieldClass} value={form.passOutBatch} onChange={e => setForm({ ...form, passOutBatch: e.target.value })}>
                  <option value="" className="bg-white">Pass out batch</option>
                  {batchOptions.map(year => <option key={year} value={year} className="bg-white">{year}</option>)}
                </select>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <h1 className="text-3xl font-black tracking-tight">Course and branch</h1>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select className={fieldClass} value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}>
                    <option value="" className="bg-white">Course</option>
                    {courseOptions.map(course => <option key={course} value={course} className="bg-white">{course}</option>)}
                  </select>
                  <input className={fieldClass} value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} placeholder="Computer Science, ECE, Marketing" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <h1 className="text-3xl font-black tracking-tight">Current year of study</h1>
                <div className="grid gap-2 sm:grid-cols-3">
                  {studyYearOptions.map(option => (
                    <button key={option} onClick={() => setForm({ ...form, studyYear: option })} className={clsx("rounded-2xl border px-4 py-3 text-sm font-black", form.studyYear === option ? "border-cyan-300 bg-cyan-300 text-black" : "border-[#E8E6E0] bg-[#F3F2EE] text-[#6B6B6B]")}>{option}</button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">What are you into?</h1>
                  <p className="mt-2 text-sm text-[#888888]5">Choose at least 3 interests.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(interest => (
                    <button key={interest} onClick={() => toggleInterest(interest)} className={clsx("rounded-full border px-4 py-2 text-xs font-black transition", form.interests.includes(interest) ? "border-blue-400 bg-blue-500 text-[#1A1A1A]" : "border-[#E8E6E0] bg-[#F3F2EE] text-[#888888]5")}>{interest}</button>
                  ))}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-5">
                <Sparkles className="text-[#C8922A]" size={34} />
                <h1 className="text-3xl font-black tracking-tight">Write a short bio</h1>
                <input className={fieldClass} maxLength={100} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Final year CSE | Dev | CAT 2025 Aspirant" />
                <p className="text-right text-xs font-bold text-[#888888]">{form.bio.length}/100</p>
              </div>
            )}

            {step === 8 && (
              <div className="space-y-5">
                <Phone className="text-[#C8922A]" size={34} />
                <h1 className="text-3xl font-black tracking-tight">Phone number</h1>
                <div className="flex rounded-2xl border border-[#E8E6E0] bg-[#F3F2EE]">
                  <span className="border-r border-[#E8E6E0] px-4 py-3 text-sm font-black text-[#888888]5">+91</span>
                  <input className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-semibold text-[#1A1A1A] outline-none" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
                </div>
              </div>
            )}

            {step === 9 && (
              <div className="space-y-6 text-center">
                <PartyPopper className="mx-auto text-[#C8922A]" size={44} />
                <div>
                  <h1 className="text-3xl font-black tracking-tight">You&apos;re all set, {form.name.split(" ")[0] || "student"}!</h1>
                  <p className="mt-2 text-sm text-[#888888]5">Your Campus Adda profile is ready.</p>
                </div>
                <div className="mx-auto max-w-sm rounded-[1.5rem] border border-[#E8E6E0] bg-[#F3F2EE] p-5 text-left">
                  <div className="flex items-center gap-4">
                    <img src={form.profilePic || getDefaultAvatar(form.name)} className="h-16 w-16 rounded-full object-cover" alt="Profile" />
                    <div>
                      <div className="flex items-center">
                        <h2 className="text-xl font-black">{form.name}</h2>
                        <VerifiedBadge user={{ isVerified: completedRequiredFields }} size={18} />
                      </div>
                      <p className="text-xs font-bold text-cyan-200">{user.university}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-[#4A4A4A]">{form.bio || `${form.course} ${form.branch} · Batch of ${form.passOutBatch}`}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.interests.map(item => <span key={item} className="rounded-full bg-blue-500/15 px-3 py-1 text-[10px] font-black text-blue-200">{item}</span>)}
                  </div>
                </div>
              </div>
            )}

            {error && <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">{error}</p>}

            <div className="mt-8 flex items-center justify-between gap-3 relative z-10">
              <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || saving} className="inline-flex items-center rounded-2xl border border-[#E8E6E0] bg-[#F3F2EE] px-6 py-3 text-sm font-black text-[#6B6B6B] transition hover:bg-[#F3F2EE] hover:text-[#1A1A1A] disabled:opacity-30">
                <ArrowLeft size={16} className="mr-2" /> Back
              </button>
              {step === 7 || step === 8 ? (
                <button onClick={() => goNext()} disabled={saving} className="rounded-2xl border border-[#E8E6E0] bg-[#F3F2EE] px-6 py-3 text-sm font-black text-[#4A4A4A] transition hover:bg-[#F3F2EE] hover:text-[#1A1A1A]">
                  {step === 8 ? "Skip All" : "Skip"}
                </button>
              ) : null}
              {step < 9 ? (
                <button onClick={() => goNext()} disabled={saving} className="ml-auto inline-flex items-center rounded-2xl bg-gradient-to-r from-[#D4A843] to-[#C8922A] px-6 py-3 text-sm font-black text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-60 transition hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]">
                  {saving ? "Saving..." : "Continue"} <ArrowRight size={16} className="ml-2" />
                </button>
              ) : (
                <button onClick={finish} disabled={saving} className="ml-auto inline-flex items-center rounded-2xl bg-gradient-to-r from-[#D4A843] to-[#C8922A] px-6 py-3 text-sm font-black text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-60 transition hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]">
                  Enter Campus Adda <Check size={16} className="ml-2" />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
