import re
import sys

file_path = "/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/page.js"

with open(file_path, "r") as f:
    content = f.read()

# 1. Add imports
if "Playfair_Display" not in content:
    content = content.replace(
        "import { useRouter } from 'next/navigation'",
        "import { useRouter } from 'next/navigation'\nimport { Playfair_Display } from 'next/font/google'\nconst playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })"
    )

# 2. Replace background colors
content = content.replace("#FAFAF8", "#FFFDF8")

# 3. Replace features array
# We will use regex to find the features array and replace it.
features_pattern = re.compile(r"const features = \[.*?\]\n\nexport default function WelcomeTourPage", re.DOTALL)

new_features = """const features = [
  {
    number: '01',
    tag: 'HOME FEED',
    headlineParts: ['Your Campus.', 'Live &', 'Unfiltered.'],
    subheadline: 'Everything happening on your campus — right now.',
    description: 'Stay updated with posts, photos, videos, polls, and campus trends. Follow your classmates, seniors and college clubs. React, comment, and share. Be part of every moment on campus before you miss it.',
    bullets: [
      { icon: '📸', title: 'Share photos, videos & polls', desc: 'Capture moments and share with your campus.' },
      { icon: '🔥', title: 'See what\\'s trending on your campus', desc: 'Discover what everyone is talking about.' },
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
    description: 'Verify your student identity with your college email or ID. Earn XP points by engaging, posting and connecting. Watch your college climb India\\'s campus leaderboard and carry the pride of your institution.',
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
    tag: 'SQUAD',
    headlineParts: ['Find Your People.', 'Build Your', 'Circle.'],
    subheadline: 'Connect with classmates, seniors, juniors and future teammates.',
    description: 'Squad is your campus social graph. Send connection requests and build your network. Message directly and discover people you actually want to know. Form your dream team right from day one.',
    bullets: [
      { icon: '👥', title: 'Connect with students campus-wide', desc: 'Grow your network within your college.' },
      { icon: '💌', title: 'Direct messages & group chats', desc: 'Stay in touch with your friends and clubs.' },
      { icon: '🤝', title: 'Smart suggestions based on interests', desc: 'Find people who share your passions.' },
      { icon: '🔗', title: 'Build your campus network', desc: 'Create lasting connections for your future.' }
    ],
    tags: ['Connect', 'Messages', 'Network', 'Friends'],
    image: '/landing/feature-squad.png',
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
    description: 'Post your project idea and define what skills you need. Watch the right people find you instantly. Whether it\\'s a 24-hour hackathon or a year-long startup, Collab helps you assemble the perfect team fast.',
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
    description: 'You\\'ve seen everything CampusAdda has to offer. Now it\\'s time to dive in. Find your people, explore your campus, and make memories that last beyond graduation. Your story starts right here.',
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

export default function WelcomeTourPage"""

content = features_pattern.sub(new_features, content)

# 4. Replace left side content inside map
# The map block starts around line 379: {features.map((feature, index) => (
# It ends at line 538: ))}

left_side_pattern = re.compile(r"\{\/\* Number \+ tag \*\/\}[\s\S]*?(?=\{\/\* CTA button — only on final slide \*\/\})", re.DOTALL)

new_left_side = """{/* Number + tag */}
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
                      fontSize: 'clamp(56px, 6vw, 84px)',
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
                      fontSize: '24px', fontWeight: '600',
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
                      fontSize: '20px', color: '#52525B', fontWeight: '500',
                      lineHeight: '1.8', margin: '0 0 40px', maxWidth: '520px',
                    }}>
                      {feature.description}
                    </p>

                    {/* Bullets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '40px' }}>
                      {feature.bullets.map((bullet, i) => (
                        <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '52px', height: '52px', flexShrink: 0,
                            borderRadius: '16px', background: '#FFF7ED',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '24px'
                          }}>
                            {bullet.icon}
                          </div>
                          <div style={{ paddingTop: '2px' }}>
                            <div style={{ fontSize: '22px', fontWeight: '700', color: '#18181B', marginBottom: '6px', lineHeight: '1.3' }}>
                              {bullet.title}
                            </div>
                            <div style={{ fontSize: '16px', color: '#52525B', lineHeight: '1.5' }}>
                              {bullet.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '48px' }}>
                      {feature.tags.map((tag, i) => (
                        <motion.button key={tag}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            height: '48px', padding: '0 24px', borderRadius: '999px',
                            fontSize: '16px', fontWeight: '600',
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

                    """

content = left_side_pattern.sub(new_left_side, content)

with open(file_path, "w") as f:
    f.write(content)

print("Modifications applied.")
