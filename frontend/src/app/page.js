'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Playfair_Display } from 'next/font/google'
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

const features = [
  {
    number: '01',
    tag: 'HOME FEED',
    headlineParts: ['Your Campus.', 'Live &', 'Unfiltered.'],
    subheadline: 'Everything happening on your campus — right now.',
    description: 'Stay updated with posts, photos, videos, polls, and campus trends. Follow your classmates, seniors and college clubs. React, comment, and share. Be part of every moment on campus before you miss it.',
    bullets: [
      { icon: '📸', title: 'Share photos, videos & polls', desc: 'Capture moments and share with your campus.' },
      { icon: '🔥', title: 'See what\'s trending on your campus', desc: 'Discover what everyone is talking about.' },
      { icon: '💬', title: 'Comment, react & connect instantly', desc: 'Engage in real-time with your campus community.' },
      { icon: '🌐', title: 'Campus-wide & global feed toggle', desc: 'Switch between campus feed and global updates.' }
    ],
    tags: ['Feed', 'Trending', 'Polls', 'Campus Pulse'],
    image: '/landing/feature-feed.png',
    color: '#F97316',
  },
  {
    number: '02',
    tag: 'COLLEGE PRIDE',
    headlineParts: ['Represent.', 'Verify.', 'Dominate.'],
    subheadline: 'Climb the leaderboard. Put your college on the map.',
    description: 'Verify your student identity with your college email or ID. Earn XP points by engaging, posting and connecting. Watch your college climb India\'s campus leaderboard and carry the pride of your institution.',
    bullets: [
      { icon: '✅', title: 'Verified student badge — zero fakes', desc: 'Join a trusted community of real students.' },
      { icon: '🏆', title: 'College leaderboard — campus vs campus', desc: 'Compete to make your college number one.' },
      { icon: '⭐', title: 'Earn XP for every action you take', desc: 'Get rewarded for your campus engagement.' },
      { icon: '🎓', title: 'Only real verified students allowed', desc: 'A safe and exclusive space for college students.' }
    ],
    tags: ['Verified', 'Leaderboard', 'XP Points', 'College Pride'],
    image: '/landing/feature-pride.png',
    color: '#F97316',
  },
  {
    number: '03',
    tag: 'EXPLORE',
    headlineParts: ['Beyond Your', 'Campus', 'Walls.'],
    subheadline: 'Discover colleges, people and opportunities across India.',
    description: 'Explore colleges pan-India. Discover students from other universities through Daily Discovery. Compete in cross-campus Arena battles. Your world just got a lot bigger than your hostel corridor.',
    bullets: [
      { icon: '🏛️', title: 'Browse colleges across India', desc: 'Explore campuses and communities nationwide.' },
      { icon: '⭐', title: 'Daily Discovery — handpicked profiles', desc: 'Meet interesting students from other colleges.' },
      { icon: '🎮', title: 'Arena — cross-campus esports', desc: 'Compete in inter-college gaming tournaments.' },
      { icon: '🗺️', title: 'Map-based campus exploration', desc: 'Navigate and find events near you.' }
    ],
    tags: ['Explore', 'Daily Discovery', 'Arena', 'Pan-India'],
    image: '/landing/feature-explore.png',
    color: '#F97316',
  },
  {
    number: '04',
    tag: 'NETWORK',
    headlineParts: ['Find Your People.', 'Build Your', 'Circle.'],
    subheadline: 'Connect with classmates, seniors, juniors and future teammates.',
    description: 'Network is your campus social graph. Send connection requests and build your network. Message directly and discover people you actually want to know. Form your dream team right from day one.',
    bullets: [
      { icon: '👥', title: 'Connect with students campus-wide', desc: 'Grow your network within your college.' },
      { icon: '💌', title: 'Direct messages & group chats', desc: 'Stay in touch with your friends and clubs.' },
      { icon: '🤝', title: 'Smart suggestions based on interests', desc: 'Find people who share your passions.' },
      { icon: '🔗', title: 'Build your campus network', desc: 'Create lasting connections for your future.' }
    ],
    tags: ['Connect', 'Messages', 'Network', 'Friends'],
    image: '/landing/feature-network.png',
    color: '#F97316',
  },
  {
    number: '05',
    tag: 'HUSTLE HUB',
    headlineParts: ['Buy. Sell.', 'Earn.', 'As a Student.'],
    subheadline: 'A marketplace made for campus life — trusted, verified, local.',
    description: 'Sell your old books and buy hostel essentials. Offer your skills as a service or pick up gigs. Every buyer and seller is a verified student. No scams, no strangers, just your campus community doing business.',
    bullets: [
      { icon: '📚', title: 'Books, notes & study material', desc: 'Buy and sell academic resources easily.' },
      { icon: '🛏️', title: 'Hostel items & room essentials', desc: 'Find everything you need for your dorm.' },
      { icon: '💼', title: 'Student gigs & freelance services', desc: 'Offer your skills and earn on campus.' },
      { icon: '💰', title: 'Earn from your unused stuff', desc: 'Turn your clutter into extra cash.' }
    ],
    tags: ['Marketplace', 'Books', 'Gigs', 'Student Economy'],
    image: '/landing/feature-hustle.png',
    color: '#F97316',
  },
  {
    number: '06',
    tag: 'COLLAB',
    headlineParts: ['Build Together.', 'Win', 'Together.'],
    subheadline: 'Find teammates for hackathons, startups and college projects.',
    description: 'Post your project idea and define what skills you need. Watch the right people find you instantly. Whether it\'s a 24-hour hackathon or a year-long startup, Collab helps you assemble the perfect team fast.',
    bullets: [
      { icon: '⚡', title: 'Post ideas & find teammates fast', desc: 'Recruit the right talent for your projects.' },
      { icon: '🧑‍💻', title: 'Filter by skill — Dev, Design, Marketing', desc: 'Find exactly what your team is missing.' },
      { icon: '🏅', title: 'Hackathon team finder', desc: 'Form winning teams for upcoming events.' },
      { icon: '🚀', title: 'Startup co-founder matching', desc: 'Meet your future business partner.' }
    ],
    tags: ['Hackathon', 'Startup', 'Teammates', 'Projects'],
    image: '/landing/feature-collab.png',
    color: '#F97316',
  },
  {
    number: '07',
    tag: "YOU'RE ALL SET",
    headlineParts: ['Your Campus', 'Journey', 'Starts Now.'],
    subheadline: 'Connect. Engage. Grow. Make your college life unforgettable.',
    description: 'You\'ve seen everything CampusAdda has to offer. Now it\'s time to dive in. Find your people, explore your campus, and make memories that last beyond graduation. Your story starts right here.',
    bullets: [
      { icon: '🎓', title: 'Verified student community', desc: 'Join thousands of real college students.' },
      { icon: '🚀', title: 'Everything in one platform', desc: 'All your campus needs in a single app.' },
      { icon: '💜', title: 'Built for Indian college students', desc: 'Tailored for the local campus experience.' },
      { icon: '🌟', title: 'Your college life, elevated', desc: 'Make the most out of your university years.' }
    ],
    tags: ['Get Started', 'Campus Life', 'Community', 'India'],
    image: '/landing/feature-final.png',
    color: '#F97316',
    isFinal: true,
  },
]

export default function WelcomeTourPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const scrollRootRef = useRef(null)
  const cardRefs = useRef([])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("collegeadda_token")
    if (token) {
      router.push("/home")
    }
  }, [router])

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

  // Scroll-driven active feature. The tour uses its own fixed scroll container,
  // so we measure card centers against that container instead of the window.
  useEffect(() => {
    const scrollRoot = scrollRootRef.current
    if (!scrollRoot) return

    let frame = null

    const updateActiveFeature = () => {
      const rootRect = scrollRoot.getBoundingClientRect()
      const rootCenter = rootRect.top + rootRect.height / 2
      let closestIndex = 0
      let closestDistance = Infinity

      cardRefs.current.forEach((card, index) => {
        if (!card) return
        const rect = card.getBoundingClientRect()
        const cardCenter = rect.top + rect.height / 2
        const distance = Math.abs(cardCenter - rootCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      setActiveIndex(closestIndex)
      frame = null
    }

    const requestUpdate = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(updateActiveFeature)
    }

    updateActiveFeature()
    scrollRoot.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      scrollRoot.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [])

  return (
    <div ref={scrollRootRef} data-tour-scroll-root style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'auto',
      zIndex: 50,
      background: '#FFFDF8',
    }}>
      <div
        style={{
          background: '#FFFDF8',
          minHeight: '100vh',
          fontFamily: 'Inter, -apple-system, sans-serif',
          position: 'relative',
          overflowX: 'clip',
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
              background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 65%)',
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
              background: 'radial-gradient(circle, rgba(176,125,32,0.12) 0%, transparent 65%)',
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
              background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 65%)',
              filter: 'blur(70px)',
            }}
          />
          {/* Grid pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }} />
          {/* Top fade */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '350px',
            background: 'linear-gradient(180deg, rgba(249,115,22,0.07) 0%, transparent 100%)',
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
                background: 'rgba(249,115,22,0.12)',
                border: '1px solid rgba(249,115,22,0.35)',
                borderRadius: '100px',
                padding: '8px 22px',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.16em',
                color: '#D4A843',
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
              <span style={{ color: '#1A1A1A' }}>One </span>
              <span className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #D4A843 0%, #F97316 55%, #FB923C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Campus.</span>
              <br />
              <span style={{ color: '#1A1A1A' }}>Infinite </span>
              <span className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #D4A843 0%, #F97316 55%, #FB923C 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Possibilities.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontSize: 'clamp(16px, 1.8vw, 20px)',
                color: '#6B6B6B',
                lineHeight: '1.8',
                margin: '0 auto 40px',
                maxWidth: '580px',
              }}
            >
              Every part of your college life — social, academic, professional and fun — lives in one place.{' '}
              <span style={{ color: '#6B6B6B' }}>No more juggling 5 apps. Just </span>
              <span className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #D4A843, #F97316)',
                fontWeight: '600',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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
              <div style={{ height: '1px', width: '80px', background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.4))' }} />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {features.map((f, i) => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: i === activeIndex ? features[activeIndex].color : 'rgba(249,115,22,0.25)',
                    transition: 'background 0.3s ease',
                  }} />
                ))}
              </div>
              <div style={{ height: '1px', width: '80px', background: 'linear-gradient(90deg, rgba(249,115,22,0.4), transparent)' }} />
            </motion.div>

          </div>
        </div>

        {/* ============ STICKY SCROLL SECTION ============
          ARCHITECTURE (mirrored from hatch.co.in):
          - LEFT: normal flow, 100vh per card (auto on mobile) — SCROLLS NATURALLY
          - RIGHT: position sticky, height 100vh — DESKTOP MOCKUP — NEVER MOVES
          - Scroll listener watches each card center and updates activeIndex
          - NO snap, NO hijack, NO setInterval
      ============================================= */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          width: '100vw',
          maxWidth: '100%',
          margin: '0 auto',
          paddingTop: '0px',
          minHeight: isMobile ? 'auto' : `${features.length * 100}vh`,
        }}>
          <div style={{
            display: isMobile ? 'block' : 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(460px, 580px)',
            width: '100%',
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '0 20px' : '0 48px',
            columnGap: isMobile ? 0 : '88px',
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
                    {/* CTA at top — above 01 HOME FEED for easy access */}
                    {index === 0 && (
                      <Link href="/login" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '28px' }}>
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            display: 'inline-block',
                            padding: '12px 32px',
                            borderRadius: '100px',
                            background: 'linear-gradient(135deg, #F97316, #FB923C)',
                            color: 'white',
                            fontSize: '15px', fontWeight: '700',
                            textDecoration: 'none',
                            boxShadow: '0 0 40px rgba(249,115,22,0.45)',
                            cursor: 'pointer',
                          }}
                        >
                          {"Let's Go to CampusAdda 🚀"}
                        </motion.div>
                      </Link>
                    )}

                    {/* Number + tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '50%',
                        background: '#F97316',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '800', color: 'white', flexShrink: 0,
                        boxShadow: `0 0 20px rgba(249, 115, 22, 0.3)`,
                      }}>
                        {feature.number}
                      </div>
                      <span style={{
                        fontSize: '12px', fontWeight: '700',
                        letterSpacing: '0.16em', color: '#F97316',
                        textTransform: 'uppercase',
                      }}>
                        {feature.tag}
                      </span>
                    </div>

                    {/* Headline */}
                    <h2 className={playfair.className} style={{
                      fontSize: 'clamp(32px, 3.5vw, 48px)',
                      fontWeight: '800', color: '#18181B',
                      lineHeight: '0.95', margin: '0 0 24px',
                      letterSpacing: '-0.03em',
                    }}>
                      {feature.headlineParts[0]}{' '}
                      <span style={{ color: '#F97316' }}>{feature.headlineParts[1]}</span>{' '}
                      {feature.headlineParts[2]}
                    </h2>

                    {/* Subheadline */}
                    <p style={{
                      fontSize: '15px', fontWeight: '600',
                      color: '#F97316', margin: '0 0 16px', lineHeight: '1.4',
                    }}>
                      {feature.subheadline}
                    </p>

                    {/* Divider */}
                    <div style={{
                      width: '80px', height: '4px',
                      background: '#FB923C', borderRadius: '4px',
                      marginBottom: '28px',
                    }} />

                    {/* Mobile mockup image */}
                    {isMobile && (
                      <div style={{
                        margin: '24px 0 32px',
                        background: 'linear-gradient(180deg, #f5f5f7 0%, #e5e5ea 100%)',
                        borderRadius: '12px',
                        border: '2px solid #d1d1d6',
                        padding: '12px 12px 8px 12px',
                        boxShadow: `0 20px 50px rgba(0,0,0,0.15), 0 0 40px rgba(249, 115, 22, 0.15)`,
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
                      fontSize: '14px', color: '#52525B', fontWeight: '500',
                      lineHeight: '1.8', margin: '0 0 40px', maxWidth: '520px',
                    }}>
                      {feature.description}
                    </p>

                    {/* Bullets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                      {feature.bullets.map((bullet, i) => (
                        <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '44px', height: '44px', flexShrink: 0,
                            borderRadius: '12px', background: '#FFF7ED',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '20px'
                          }}>
                            {bullet.icon}
                          </div>
                          <div style={{ paddingTop: '2px' }}>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#18181B', marginBottom: '4px', lineHeight: '1.3' }}>
                              {bullet.title}
                            </div>
                            <div style={{ fontSize: '13px', color: '#52525B', lineHeight: '1.5' }}>
                              {bullet.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '48px' }}>
                      {feature.tags.map((tag, i) => (
                        <motion.button key={tag}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            height: '38px', padding: '0 16px', borderRadius: '999px',
                            fontSize: '13px', fontWeight: '600',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'box-shadow 0.2s',
                            ...(i === 0 ? {
                                background: '#F97316', color: 'white', border: 'none',
                                boxShadow: '0 8px 16px rgba(249, 115, 22, 0.2)'
                            } : {
                                background: 'white', color: '#18181B', border: '2px solid #FB923C',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                            })
                          }}
                        >
                          {tag}
                        </motion.button>
                      ))}
                    </div>

                    {/* CTA button — only on final slide */}
                    {feature.isFinal && (
                      <Link href="/login" style={{ textDecoration: 'none' }}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4, duration: 0.4 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            display: 'inline-block',
                            padding: '12px 32px',
                            borderRadius: '100px',
                            background: 'linear-gradient(135deg, #F97316, #FB923C)',
                            color: 'white',
                            fontSize: '15px', fontWeight: '700',
                            textDecoration: 'none',
                            boxShadow: '0 0 40px rgba(249,115,22,0.45)',
                            cursor: 'pointer',
                          }}
                        >
                          {"Let's Go to CampusAdda 🚀"}
                        </motion.div>
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
                width: '580px',
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
                    width: '470px',
                    height: '310px',
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
                  color: 'rgba(0,0,0,0.3)',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                }}>
                  {String(activeIndex + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
                </div>

                {/* ===== iMAC DESKTOP MONITOR ===== */}
                <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>

                  {/* Monitor bezel */}
                  <div style={{
                    background: 'linear-gradient(180deg, #f5f5f7 0%, #e5e5ea 100%)',
                    borderRadius: '14px 14px 6px 6px',
                    border: '2px solid #d1d1d6',
                    padding: '14px 14px 10px 14px',
                    boxShadow: `0 0 0 1px #c7c7cc, 0 30px 80px rgba(0,0,0,0.15), 0 0 60px ${features[activeIndex].color}18, inset 0 1px 0 rgba(255,255,255,0.5)`,
                    transition: 'box-shadow 0.5s ease',
                  }}>

                    {/* Camera dot */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '10px',
                    }}>
                      <div style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: '#000', border: '1px solid #000',
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
                          data-tour-desktop-mockup
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
                    background: 'linear-gradient(180deg, #d1d1d6, #c7c7cc)',
                    margin: '0 auto',
                    borderLeft: '1px solid #aeaeb2',
                    borderRight: '1px solid #aeaeb2',
                  }} />

                  {/* Base */}
                  <div style={{
                    height: '16px', width: '200px',
                    background: 'linear-gradient(180deg, #e5e5ea, #d1d1d6)',
                    margin: '0 auto',
                    borderRadius: '0 0 14px 14px',
                    border: '1px solid #aeaeb2',
                    borderTop: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  }} />

                </div>

                {/* Progress dots below monitor */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '32px', zIndex: 1 }}>
                  {features.map((f, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i === activeIndex ? '28px' : '8px',
                        background: i === activeIndex ? features[activeIndex].color : 'rgba(0,0,0,0.1)',
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
