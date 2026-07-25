"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  GraduationCap,
  Eye,
  EyeOff,
  Mail,
  Medal,
  MessageSquareText,
  Network,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { motion } from "framer-motion";
import styles from "./login.module.css";

const fallbackColleges = [
  { name: "Delhi Technological University (DTU)" },
  { name: "Guru Gobind Singh Indraprastha University (IPU)" },
  { name: "IIIT Delhi" },
  { name: "IIT Delhi" },
  { name: "Jamia Millia Islamia" },
  { name: "Jawaharlal Nehru University (JNU)" },
  { name: "Kurukshetra University" },
  { name: "Netaji Subhas University of Technology (NSUT)" },
  { name: "Rishihood University" },
  { name: "School of Planning and Architecture (SPA)" },
  { name: "University of Delhi (DU)" },
  { name: "YMCA Faridabad" }
].sort((a, b) => a.name.localeCompare(b.name));

const featureCards = [
  {
    icon: MessageSquareText,
    title: "Anonymous Confessions",
    copy: "Share freely. Stay anonymous.",
    color: "violet"
  },
  {
    icon: Sparkles,
    title: "Campus Feed",
    copy: "See what’s trending in your campus.",
    color: "blue"
  },
  {
    icon: Medal,
    title: "College Leaderboard",
    copy: "See which college is on top.",
    color: "amber"
  },
  {
    icon: Users,
    title: "Connect Students",
    copy: "Meet and connect with students.",
    color: "green"
  }
];

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").trim();

function Brand({ compact = false }) {
  return (
    <div className={`${styles.brand} ${compact ? styles.brandCompact : ""}`}>
      <span className={styles.brandIcon}>
        <GraduationCap aria-hidden="true" />
      </span>
      <span className={styles.brandName}>
        Campus<span>Adda</span>
      </span>
    </div>
  );
}

function CampusNetwork() {
  return (
    <div className={styles.networkScene} aria-label="Animated student community network">
      <svg className={styles.networkLines} viewBox="0 0 560 500" aria-hidden="true">
        <defs>
          <linearGradient id="network-stroke" x1="0" x2="1">
            <stop offset="0" stopColor="#D4A843" stopOpacity=".2" />
            <stop offset=".52" stopColor="#F97316" stopOpacity=".95" />
            <stop offset="1" stopColor="#FB923C" stopOpacity=".2" />
          </linearGradient>
          <filter id="line-glow">
            <feGaussianBlur stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className={styles.lineGroup} stroke="url(#network-stroke)" strokeWidth="1.25" fill="none">
          <path pathLength="1" d="M58 82 L220 28 L390 70 L486 130" />
          <path pathLength="1" d="M58 82 L260 170 L390 70" />
          <path pathLength="1" d="M220 28 L260 170 L188 286 L322 370" />
          <path pathLength="1" d="M260 170 L470 216" />
          <path pathLength="1" d="M188 286 L322 370 L430 280" />
          <path pathLength="1" d="M322 370 L372 476 L498 400" />
          <path pathLength="1" d="M58 82 L150 180" />
        </g>
        <g className={styles.travelGroup} stroke="#F97316" strokeWidth="2" fill="none" filter="url(#line-glow)">
          <path pathLength="1" d="M58 82 L220 28 L390 70 L486 130" />
          <path pathLength="1" d="M220 28 L260 170 L188 286 L322 370 L372 476" />
          <path pathLength="1" d="M260 170 L470 216" />
        </g>
        {[
          [58, 82, 7],
          [390, 70, 6],
          [486, 130, 3],
          [150, 180, 3],
          [470, 216, 4],
          [430, 280, 6],
          [322, 370, 6],
          [372, 476, 5],
          [498, 400, 3]
        ].map(([cx, cy, r], index) => (
          <circle
            key={`${cx}-${cy}`}
            className={styles.networkDot}
            style={{ animationDelay: `${index * -0.38}s` }}
            cx={cx}
            cy={cy}
            r={r}
            fill="#F97316"
          />
        ))}
      </svg>

      {[
        { src: "/login/profile-1.png", className: styles.avatarOne, alt: "Campus student" },
        { src: "/login/profile-2.png", className: styles.avatarTwo, alt: "Campus student" },
        { src: "/login/profile-3.png", className: styles.avatarThree, alt: "Campus student" }
      ].map((avatar, index) => (
        <motion.div
          key={avatar.src}
          className={`${styles.networkAvatar} ${avatar.className}`}
          animate={{ y: [0, index % 2 ? -9 : 8, 0], x: [0, index === 1 ? 5 : -3, 0] }}
          transition={{ duration: 4.8 + index * 0.7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src={avatar.src} alt={avatar.alt} width={82} height={82} />
        </motion.div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [colleges, setColleges] = useState(fallbackColleges);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("collegeadda_token");
    if (token) {
      router.push("/home");
    }
  }, [router]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [university, setUniversity] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const publicResponse = await fetch(`${API_URL}/api/colleges/public`);
        const response = publicResponse.ok
          ? publicResponse
          : await fetch(`${API_URL}/api/colleges`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length) {
            data.sort((a, b) => a.name.localeCompare(b.name));
            setColleges(data);
          }
        }
      } catch {
        // The curated list keeps the public login usable while the API is waking up.
      }
    };
    fetchColleges();
  }, []);

  const finishLogin = (data) => {
    localStorage.setItem("collegeadda_token", data.token);
    localStorage.setItem("collegeadda_user", JSON.stringify(data));
    router.push(data.onboardingComplete ? "/home" : "/onboarding");
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setMessage("");

    if (isSignUp) {
      if (!name.trim()) {
        setMessage("Enter your full name to create an account.");
        return;
      }
      if (!university) {
        setMessage("Select your college before creating your account.");
        return;
      }
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/${isSignUp ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignUp ? { name, email, password, university } : { email, password, university }
        )
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Authentication failed.");
      finishLogin(data);
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "The login server is unavailable. Start the backend and try again."
          : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setMessage("");
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          university: university || undefined
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 400 && data.message === "University is required for registration") {
          throw new Error("First time here? Select your college, then continue with Google again.");
        }
        throw new Error(data.message || "Google authentication failed.");
      }
      finishLogin(data);
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "The login server is unavailable. Start the backend and try again."
          : error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp((current) => !current);
    setEmailOpen(true);
    setMessage("");
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <div className={styles.page}>
        <div className={styles.aurora} aria-hidden="true" />
        <div className={styles.content}>
          <section className={styles.storyPanel}>
            <Brand />

            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <div className={styles.eyebrow}>
                  <Users size={16} />
                  Built for Students. By Students.
                </div>
                <h1>
                  Your <span>Campus.</span>
                  <br />
                  Your <span>Community.</span>
                </h1>
                <p>
                  Connect, share, discuss and discover everything happening in your college community.
                </p>
              </div>
              <CampusNetwork />
            </div>

            <div className={styles.features}>
              {featureCards.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className={`${styles.feature} ${styles[feature.color]}`}
                    style={{ "--feature-index": index }}
                  >
                    <span className={styles.featureIcon}><Icon /></span>
                    <h2>{feature.title}</h2>
                    <p>{feature.copy}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.authPanel}>
            <Brand compact />
            <div className={styles.welcome}>
              <h2>Welcome Back! <span aria-hidden="true">👋</span></h2>
              <p>Login to continue to CampusAdda</p>
            </div>

            <div className={styles.authBody}>
              <label htmlFor="university">Select Your College / University</label>
              <div className={styles.selectWrap}>
                <GraduationCap aria-hidden="true" />
                <input
                  id="university"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setUniversity("");
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  placeholder="Search your college..."
                  aria-label="Search your college or university"
                  autoComplete="off"
                />
                {isDropdownOpen && (
                  <ul className={styles.customDropdown}>
                    {colleges
                      .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((college, index) => (
                        <li
                          key={college._id || college.id || index}
                          onClick={() => {
                            setUniversity(college.name);
                            setSearchQuery(college.name);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {college.name}
                        </li>
                      ))}
                    {colleges.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <li className={styles.noResult}>No college found</li>
                    )}
                  </ul>
                )}
                <ChevronDown aria-hidden="true" />
              </div>

              <div className={styles.googleWrap} aria-busy={isLoading}>
                <div className={styles.googleButtonFace} aria-hidden="true">
                  <span className={styles.googleLogo}>
                    <svg viewBox="0 0 24 24" role="img">
                      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
                      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.64-2.36l-3.24-2.54c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
                      <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.07 12c0-.67.12-1.32.32-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.63.39 3.18 1.04 4.55l3.35-2.62Z" />
                      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.88-2.88A9.66 9.66 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
                    </svg>
                  </span>
                  <span>Continue with Google</span>
                </div>
                <div className={styles.googleAuthControl}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setMessage("Google sign-in was cancelled or could not start.")}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    text="continue_with"
                    width="400"
                    useOneTap={false}
                  />
                </div>
              </div>

              <div className={styles.divider}><span>or continue with email</span></div>

              {!emailOpen && (
                <button
                  className={styles.emailTrigger}
                  type="button"
                  onClick={() => {
                    setEmailOpen(true);
                    setMessage("");
                  }}
                >
                  <Mail />
                  Continue with Email
                </button>
              )}

              {emailOpen && (
                  <form className={styles.emailForm} onSubmit={handleAuth}>
                    {isSignUp && (
                      <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Full name"
                        autoComplete="name"
                        required
                      />
                    )}
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="College email"
                      autoComplete="email"
                      required
                    />
                    <div className={styles.passwordField}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Password"
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                      </button>
                    </div>
                    <button className={styles.submitButton} type="submit" disabled={isLoading}>
                      {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Continue with Email"}
                    </button>
                    <p className={styles.switchMode}>
                      {isSignUp ? "Already have an account?" : "New to CampusAdda?"}
                      <button type="button" onClick={switchMode}>
                        {isSignUp ? "Sign in" : "Create account"}
                      </button>
                    </p>
                  </form>
              )}

              {message && <p className={styles.message} role="alert">{message}</p>}

              <p className={styles.terms}>
                By continuing, you agree to our
                <br />
                <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>
              </p>
            </div>

            <div className={styles.security}>
              <ShieldCheck />
              <span>Your data is safe and secure</span>
              <Check className={styles.securityCheck} />
            </div>
          </section>
        </div>

        <div className={styles.waves} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
