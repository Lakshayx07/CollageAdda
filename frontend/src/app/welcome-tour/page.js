'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const features = [
  {
    number: '01',
    tag: 'HOME FEED',
    headline: 'Your Campus. Live & Unfiltered.',
    subheadline: 'Everything happening on your campus — right now.',
    description: 'Stay updated with posts, photos, videos, polls, and campus trends. Follow your classmates, seniors and college clubs. React, comment, share — be part of every moment on campus before you miss it.',
    bullets: ['📸 Share photos, videos & polls', "🔥 See what's trending on your campus", '💬 Comment, react & connect instantly', '🌐 Campus-wide & global feed toggle'],
    tags: ['Feed', 'Trending', 'Polls', 'Campus Pulse'],
    image: '/landing/feature-feed.png',
    color: '#7c3aed',
  },
  {
    number: '02',
    tag: 'COLLEGE PRIDE',
    headline: 'Represent. Verify. Dominate.',
    subheadline: 'Climb the leaderboard. Put your college on the map.',
    description: "Verify your student identity with your college email or ID. Earn XP points by engaging, posting and connecting. Watch your college climb India's campus leaderboard and carry the pride of your institution.",
    bullets: ['✅ Verified student badge — zero fakes', '🏆 College leaderboard — campus vs campus', '⭐ Earn XP for every action you take', '🎓 Only real verified students allowed'],
    tags: ['Verified', 'Leaderboard', 'XP Points', 'College Pride'],
    image: '/landing/feature-pride.png',
    color: '#d97706',
  },
  {
    number: '03',
    tag: 'EXPLORE',
    headline: 'Beyond Your Campus Walls.',
    subheadline: 'Discover colleges, people and opportunities across India.',
    description: 'Explore colleges pan-India, discover students from other universities through Daily Discovery, and compete in cross-campus Arena battles. Your world just got a lot bigger than your hostel corridor.',
    bullets: ['🏛️ Browse colleges across India', '⭐ Daily Discovery — handpicked student profiles', '🎮 Arena — cross-campus sports & esports', '🗺️ Map-based campus exploration'],
    tags: ['Explore', 'Daily Discovery', 'Arena', 'Pan-India'],
    image: '/landing/feature-explore.png',
    color: '#0891b2',
  },
  {
    number: '04',
    tag: 'SQUAD',
    headline: 'Find Your People. Build Your Circle.',
    subheadline: 'Connect with classmates, seniors, juniors and future teammates.',
    description: 'Squad is your campus social graph. Send connection requests, build your network, message directly and discover people you actually want to know — from your batch, your department, or your dream team.',
    bullets: ['👥 Connect with students campus-wide', '💌 Direct messages & group chats', '🤝 Smart suggestions based on your interests', '🔗 Build your campus network from day one'],
    tags: ['Connect', 'Messages', 'Network', 'Friends'],
    image: '/landing/feature-squad.png',
    color: '#2563eb',
  },
  {
    number: '05',
    tag: 'HUSTLE HUB',
    headline: 'Buy. Sell. Earn. As a Student.',
    subheadline: 'A marketplace made for campus life — trusted, verified, local.',
    description: 'Sell your old books, buy hostel essentials, offer your skills as a service or pick up gigs. Every buyer and seller is a verified student — no scams, no strangers, just your campus community doing business.',
    bullets: ['📚 Books, notes & study material', '🛏️ Hostel items & room essentials', '💼 Student gigs & freelance services', '💰 Earn from your skills & unused stuff'],
    tags: ['Marketplace', 'Books', 'Gigs', 'Student Economy'],
    image: '/landing/feature-hustle.png',
    color: '#16a34a',
  },
  {
    number: '06',
    tag: 'COLLAB',
    headline: 'Build Together. Win Together.',
    subheadline: 'Find teammates for hackathons, startups and college projects.',
    description: "Post your project idea, define what skills you need, and watch the right people find you. Whether it's a 24-hour hackathon or a year-long startup, Collab helps you assemble the perfect team fast.",
    bullets: ['⚡ Post ideas & find teammates fast', '🧑‍💻 Filter by skill — Dev, Design, Marketing', '🏅 Hackathon team finder', '🚀 Startup co-founder matching'],
    tags: ['Hackathon', 'Startup', 'Teammates', 'Projects'],
    image: '/landing/feature-collab.png',
    color: '#db2777',
  },
  {
    number: '07',
    tag: "YOU'RE ALL SET",
    headline: 'Your Campus Journey Starts Now.',
    subheadline: 'Connect. Engage. Grow. Make your college life unforgettable.',
    description: "You've seen everything CampusAdda has to offer. Now it's time to dive in, find your people, explore your campus and make memories that last beyond graduation. Your story starts here.",
    bullets: ['🎓 Verified student community', '🚀 Everything in one platform', '💜 Built for Indian college students', '🌟 Your college life, elevated'],
    tags: ['Get Started', 'Campus Life', 'Community', 'India'],
    image: '/landing/feature-final.png',
    color: '#7c3aed',
    isFinal: true,
  },
]

export default function WelcomeTourPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const cardRefs = useRef([])

  // Track responsive screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Pure auto scroll behaviour — no snap, no hijacking
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto'
    return () => { document.documentElement.style.scrollBehavior = 'auto' }
  }, [])

  // IntersectionObserver — updates activeIndex when a card enters center viewport
  // NO setInterval, NO auto-cycling — 100% scroll-driven
  useEffect(() => {
    setActiveIndex(0) // Explicitly set to 0 on mount

    const observers = []
    cardRefs.current.forEach((ref, index) => {
      if (!ref) return
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index)
            }
          })
        },
        {
          threshold: 0.4,
          rootMargin: '-5% 0px -5% 0px',
        }
      )
      observer.observe(ref)
      observers.push(observer)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'auto',
      zIndex: 50,
      background: '#07091a',
    }}>
      <div
      style={{
        background: '#07091a',
        minHeight: '100vh',
        fontFamily: 'Inter, -apple-system, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >

      {/* ============ ANIMATED BACKGROUND ============ */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Orb top-left */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '-10%', left: '-10%',
            width: '700px', height: '700px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Orb top-right */}
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, 50, 0], scale: [1, 0.85, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          style={{
            position: 'absolute', top: '5%', right: '-10%',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Orb bottom */}
        <motion.div
          animate={{ x: [0, 40, -30, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
          style={{
            position: 'absolute', bottom: '0%', left: '25%',
            width: '600px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }} />
        {/* Top fade */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '350px',
          background: 'linear-gradient(180deg, rgba(124,58,237,0.07) 0%, transparent 100%)',
        }} />
      </div>

      {/* ============ HEADING SECTION ============ */}
      <div style={{ textAlign: 'center', padding: '80px 24px 20px', position: 'relative', zIndex: 2 }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '880px',
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px',
        }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.35)',
              borderRadius: '100px',
              padding: '8px 22px',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.16em',
              color: '#a78bfa',
              marginBottom: '36px',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ fontSize: '14px' }}>✦</span> PLATFORM FEATURES
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            style={{
              fontSize: 'clamp(48px, 7vw, 88px)',
              fontWeight: '900',
              lineHeight: '1.05',
              margin: '0 0 28px',
              letterSpacing: '-0.03em',
            }}
          >
            <span style={{ color: '#ffffff' }}>One </span>
            <span style={{
              background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 55%, #6d28d9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Campus.</span>
            <br />
            <span style={{ color: '#ffffff' }}>Infinite </span>
            <span style={{
              background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 55%, #6d28d9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Possibilities.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 'clamp(16px, 1.8vw, 20px)',
              color: '#64748b',
              lineHeight: '1.8',
              margin: '0 auto 40px',
              maxWidth: '580px',
            }}
          >
            Every part of your college life — social, academic, professional and fun — lives in one place.{' '}
            <span style={{ color: '#94a3b8' }}>No more juggling 5 apps. Just </span>
            <span style={{
              background: 'linear-gradient(90deg, #a78bfa, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '600',
            }}>CampusAdda.</span>
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '8px',
            }}
          >
            <div style={{ height: '1px', width: '80px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4))' }} />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {features.map((f, i) => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: i === activeIndex ? features[activeIndex].color : 'rgba(124,58,237,0.25)',
                  transition: 'background 0.3s ease',
                }} />
              ))}
            </div>
            <div style={{ height: '1px', width: '80px', background: 'linear-gradient(90deg, rgba(124,58,237,0.4), transparent)' }} />
          </motion.div>

        </div>
      </div>

      {/* ============ STICKY SCROLL SECTION ============
          ARCHITECTURE (mirrored from hatch.co.in):
          - LEFT: normal flow, 100vh per card (auto on mobile) — SCROLLS NATURALLY
          - RIGHT: position sticky, height 100vh — DESKTOP MONITOR — NEVER MOVES
          - IntersectionObserver watches each card, updates activeIndex
          - NO snap, NO hijack, NO setInterval
      ============================================= */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100vw',
        maxWidth: '100%',
        margin: '0 auto',
        paddingTop: '0px',
        minHeight: `${features.length * 100}vh`,
      }}>
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: isMobile ? '0 20px' : '0 48px', 
          gap: '80px', 
          alignItems: 'flex-start' 
        }}>

          {/* ===== LEFT: SCROLLING FEATURE CARDS ===== */}
          <div style={{ flex: 1 }}>
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => { cardRefs.current[index] = el }}
                style={{
                  height: isMobile ? 'auto' : '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  paddingTop: isMobile ? '60px' : '20px',
                  paddingBottom: isMobile ? '60px' : '20px',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? 20 : 0 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: false, amount: isMobile ? 0.2 : 0.4 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  {/* Number + tag */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                    <div style={{
                      width: '46px', height: '46px', borderRadius: '50%',
                      background: feature.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: '800', color: 'white', flexShrink: 0,
                      boxShadow: `0 0 20px ${feature.color}50`,
                    }}>
                      {feature.number}
                    </div>
                    <span style={{
                      fontSize: '12px', fontWeight: '700',
                      letterSpacing: '0.16em', color: feature.color,
                      textTransform: 'uppercase',
                    }}>
                      {feature.tag}
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 style={{
                    fontSize: 'clamp(32px, 3.5vw, 50px)',
                    fontWeight: '800', color: '#f1f5f9',
                    lineHeight: '1.15', margin: '0 0 14px',
                    letterSpacing: '-0.02em',
                  }}>
                    {feature.headline}
                  </h2>

                  {/* Subheadline */}
                  <p style={{
                    fontSize: '17px', fontWeight: '500',
                    color: feature.color, margin: '0 0 16px', lineHeight: '1.6',
                  }}>
                    {feature.subheadline}
                  </p>

                  {/* Divider */}
                  <div style={{
                    width: '44px', height: '3px',
                    background: feature.color, borderRadius: '2px',
                    marginBottom: '20px',
                  }} />

                  {/* Mobile mockup image */}
                  {isMobile && (
                    <div style={{
                      margin: '24px 0 32px',
                      background: 'linear-gradient(180deg, #1e1e30 0%, #16162a 100%)',
                      borderRadius: '12px',
                      border: '2px solid #2c2c44',
                      padding: '12px 12px 8px 12px',
                      boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 40px ${feature.color}15`,
                    }}>
                      <div style={{
                        borderRadius: '6px',
                        overflow: 'hidden',
                        aspectRatio: '16/10',
                        position: 'relative',
                        background: '#000',
                      }}>
                        <img
                          src={feature.image}
                          alt={feature.tag}
                          style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'top',
                            display: 'block',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p style={{
                    fontSize: '16px', color: '#94a3b8',
                    lineHeight: '1.85', margin: '0 0 24px', maxWidth: '480px',
                  }}>
                    {feature.description}
                  </p>

                  {/* Bullets */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '26px' }}>
                    {feature.bullets.map((bullet, i) => (
                      <div key={i} style={{
                        fontSize: '15px', color: '#cbd5e1',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        {bullet}
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                    {feature.tags.map((tag) => (
                      <span key={tag} style={{
                        padding: '6px 16px', borderRadius: '100px',
                        fontSize: '13px', fontWeight: '500',
                        background: `${feature.color}15`,
                        border: `1px solid ${feature.color}40`,
                        color: feature.color,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA button — only on final slide */}
                  {feature.isFinal && (
                    <Link href="/" passHref legacyBehavior>
                      <motion.a
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'inline-block',
                          padding: '16px 44px',
                          borderRadius: '100px',
                          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                          color: 'white',
                          fontSize: '17px', fontWeight: '700',
                          textDecoration: 'none',
                          boxShadow: '0 0 40px rgba(124,58,237,0.45)',
                          cursor: 'pointer',
                        }}
                      >
                        {"Let's Go to CampusAdda 🚀"}
                      </motion.a>
                    </Link>
                  )}

                </motion.div>
              </div>
            ))}
          </div>

          {/* ===== RIGHT: STICKY DESKTOP MONITOR ===== */}
          {!isMobile && (
            <div style={{
              position: 'sticky',
              top: 0,
              height: '100vh',
              width: '520px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'flex-start',
            }}>

              {/* Glow behind monitor — color tinted per feature */}
              <div
                style={{
                  position: 'absolute',
                  width: '420px',
                  height: '280px',
                  borderRadius: '50%',
                  background: features[activeIndex].color,
                  opacity: 0.08,
                  filter: 'blur(80px)',
                  zIndex: 0,
                  transition: 'background 0.6s ease',
                }}
              />

              {/* Feature counter */}
              <div style={{
                position: 'absolute',
                top: '18%',
                right: '0px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.2)',
                fontWeight: '600',
                letterSpacing: '0.08em',
              }}>
                {String(activeIndex + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
              </div>

              {/* ===== iMAC DESKTOP MONITOR ===== */}
              <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>

                {/* Monitor bezel */}
                <div style={{
                  background: 'linear-gradient(180deg, #1e1e30 0%, #16162a 100%)',
                  borderRadius: '14px 14px 6px 6px',
                  border: '2px solid #2c2c44',
                  padding: '14px 14px 10px 14px',
                  boxShadow: `0 0 0 1px #0c0c1a, 0 30px 80px rgba(0,0,0,0.8), 0 0 60px ${features[activeIndex].color}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  transition: 'box-shadow 0.5s ease',
                }}>

                  {/* Camera dot */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '10px',
                  }}>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#2a2a40', border: '1px solid #3a3a58',
                    }} />
                  </div>

                  {/* Screen */}
                  <div style={{
                    background: '#000',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    aspectRatio: '16/10',
                    position: 'relative',
                  }}>
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeIndex}
                        src={features[activeIndex].image}
                        alt={features[activeIndex].tag}
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover', objectPosition: 'top',
                          display: 'block',
                        }}
                      />
                    </AnimatePresence>

                    {/* Feature label badge on screen */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`badge-${activeIndex}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        style={{
                          position: 'absolute', top: '12px', left: '12px',
                          background: 'rgba(0,0,0,0.7)',
                          backdropFilter: 'blur(12px)',
                          border: `1px solid ${features[activeIndex].color}55`,
                          borderRadius: '100px',
                          padding: '4px 13px',
                          fontSize: '10px', fontWeight: '700',
                          color: features[activeIndex].color,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {features[activeIndex].tag}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Neck / stem */}
                <div style={{
                  width: '12px', height: '44px',
                  background: 'linear-gradient(180deg, #1a1a2c, #111120)',
                  margin: '0 auto',
                  borderLeft: '1px solid #2c2c44',
                  borderRight: '1px solid #2c2c44',
                }} />

                {/* Base */}
                <div style={{
                  height: '16px', width: '200px',
                  background: 'linear-gradient(180deg, #1a1a2c, #111120)',
                  margin: '0 auto',
                  borderRadius: '0 0 14px 14px',
                  border: '1px solid #2c2c44',
                  borderTop: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                }} />

              </div>

              {/* Progress dots below monitor */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '32px', zIndex: 1 }}>
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === activeIndex ? '28px' : '8px',
                      background: i === activeIndex ? features[activeIndex].color : 'rgba(255,255,255,0.15)',
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      height: '8px', borderRadius: '100px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (cardRefs.current[i]) {
                        cardRefs.current[i].scrollIntoView({ behavior: 'smooth', block: 'center' })
                      }
                    }}
                  />
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Bottom padding */}
      <div style={{ height: '100px' }} />

      </div>
    </div>
  )
}
