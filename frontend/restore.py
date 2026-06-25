import re

content = """1: 'use client'
2: 
3: import { useEffect, useRef, useState } from 'react'
4: import { motion, AnimatePresence } from 'framer-motion'
5: import Link from 'next/link'
6: 
7: const features = [
8:   {
9:     number: '01',
10:     tag: 'HOME FEED',
11:     headline: 'Your Campus. Live & Unfiltered.',
12:     subheadline: 'Everything happening on your campus — right now.',
13:     description: 'Stay updated with posts, photos, videos, polls, and campus trends. Follow your classmates, seniors and college clubs. React, comment, share — be part of every moment on campus before you miss it.',
14:     bullets: ['📸 Share photos, videos & polls', "🔥 See what's trending on your campus", '💬 Comment, react & connect instantly', '🌐 Campus-wide & global feed toggle'],
15:     tags: ['Feed', 'Trending', 'Polls', 'Campus Pulse'],
16:     image: '/landing/feature-feed.png',
17:     color: '#7c3aed',
18:   },
19:   {
20:     number: '02',
21:     tag: 'COLLEGE PRIDE',
22:     headline: 'Represent. Verify. Dominate.',
23:     subheadline: 'Climb the leaderboard. Put your college on the map.',
24:     description: "Verify your student identity with your college email or ID. Earn XP points by engaging, posting and connecting. Watch your college climb India's campus leaderboard and carry the pride of your institution.",
25:     bullets: ['✅ Verified student badge — zero fakes', '🏆 College leaderboard — campus vs campus', '⭐ Earn XP for every action you take', '🎓 Only real verified students allowed'],
26:     tags: ['Verified', 'Leaderboard', 'XP Points', 'College Pride'],
27:     image: '/landing/feature-pride.png',
28:     color: '#d97706',
29:   },
30:   {
31:     number: '03',
32:     tag: 'EXPLORE',
33:     headline: 'Beyond Your Campus Walls.',
34:     subheadline: 'Discover colleges, people and opportunities across India.',
35:     description: 'Explore colleges pan-India, discover students from other universities through Daily Discovery, and compete in cross-campus Arena battles. Your world just got a lot bigger than your hostel corridor.',
36:     bullets: ['🏛️ Browse colleges across India', '⭐ Daily Discovery — handpicked student profiles', '🎮 Arena — cross-campus sports & esports', '🗺️ Map-based campus exploration'],
37:     tags: ['Explore', 'Daily Discovery', 'Arena', 'Pan-India'],
38:     image: '/landing/feature-explore.png',
39:     color: '#0891b2',
40:   },
41:   {
42:     number: '04',
43:     tag: 'SQUAD',
44:     headline: 'Find Your People. Build Your Circle.',
45:     subheadline: 'Connect with classmates, seniors, juniors and future teammates.',
46:     description: 'Squad is your campus social graph. Send connection requests, build your network, message directly and discover people you actually want to know — from your batch, your department, or your dream team.',
47:     bullets: ['👥 Connect with students campus-wide', '💌 Direct messages & group chats', '🤝 Smart suggestions based on your interests', '🔗 Build your campus network from day one'],
48:     tags: ['Connect', 'Messages', 'Network', 'Friends'],
49:     image: '/landing/feature-squad.png',
50:     color: '#2563eb',
51:   },
52:   {
53:     number: '05',
54:     tag: 'HUSTLE HUB',
55:     headline: 'Buy. Sell. Earn. As a Student.',
56:     subheadline: 'A marketplace made for campus life — trusted, verified, local.',
57:     description: 'Sell your old books, buy hostel essentials, offer your skills as a service or pick up gigs. Every buyer and seller is a verified student — no scams, no strangers, just your campus community doing business.',
58:     bullets: ['📚 Books, notes & study material', '🛏️ Hostel items & room essentials', '💼 Student gigs & freelance services', '💰 Earn from your skills & unused stuff'],
59:     tags: ['Marketplace', 'Books', 'Gigs', 'Student Economy'],
60:     image: '/landing/feature-hustle.png',
61:     color: '#16a34a',
62:   },
63:   {
64:     number: '06',
65:     tag: 'COLLAB',
66:     headline: 'Build Together. Win Together.',
67:     subheadline: 'Find teammates for hackathons, startups and college projects.',
68:     description: "Post your project idea, define what skills you need, and watch the right people find you. Whether it's a 24-hour hackathon or a year-long startup, Collab helps you assemble the perfect team fast.",
69:     bullets: ['⚡ Post ideas & find teammates fast', '🧑‍💻 Filter by skill — Dev, Design, Marketing', '🏅 Hackathon team finder', '🚀 Startup co-founder matching'],
70:     tags: ['Hackathon', 'Startup', 'Teammates', 'Projects'],
71:     image: '/landing/feature-collab.png',
72:     color: '#db2777',
73:   },
74:   {
75:     number: '07',
76:     tag: "YOU'RE ALL SET",
77:     headline: 'Your Campus Journey Starts Now.',
78:     subheadline: 'Connect. Engage. Grow. Make your college life unforgettable.',
79:     description: "You've seen everything CampusAdda has to offer. Now it's time to dive in, find your people, explore your campus and make memories that last beyond graduation. Your story starts here.",
80:     bullets: ['🎓 Verified student community', '🚀 Everything in one platform', '💜 Built for Indian college students', '🌟 Your college life, elevated'],
81:     tags: ['Get Started', 'Campus Life', 'Community', 'India'],
82:     image: '/landing/feature-final.png',
83:     color: '#7c3aed',
84:     isFinal: true,
85:   },
86: ]
87: 
88: export default function WelcomeTourPage() {
89:   const [activeIndex, setActiveIndex] = useState(0)
90:   const [isMobile, setIsMobile] = useState(false)
91:   const cardRefs = useRef([])
92: 
93:   // Track responsive screen size
94:   useEffect(() => {
95:     const handleResize = () => {
96:       setIsMobile(window.innerWidth < 1024)
97:     }
98:     handleResize()
99:     window.addEventListener('resize', handleResize)
100:     return () => window.removeEventListener('resize', handleResize)
101:   }, [])
102: 
103:   // Pure auto scroll behaviour — no snap, no hijacking
104:   useEffect(() => {
105:     document.documentElement.style.scrollBehavior = 'auto'
106:     return () => { document.documentElement.style.scrollBehavior = 'auto' }
107:   }, [])
108: 
109:   // IntersectionObserver — updates activeIndex when a card enters center viewport
110:   // NO setInterval, NO auto-cycling — 100% scroll-driven
111:   useEffect(() => {
112:     setActiveIndex(0) // Explicitly set to 0 on mount
113: 
114:     const observers = []
115:     cardRefs.current.forEach((ref, index) => {
116:       if (!ref) return
117:       const observer = new IntersectionObserver(
118:         (entries) => {
119:           entries.forEach((entry) => {
120:             if (entry.isIntersecting) {
121:               setActiveIndex(index)
122:             }
123:           })
124:         },
125:         {
126:           threshold: 0.4,
127:           rootMargin: '-5% 0px -5% 0px',
128:         }
129:       )
130:       observer.observe(ref)
131:       observers.push(observer)
132:     })
133:     return () => observers.forEach((o) => o.disconnect())
134:   }, [])
135: 
136:   return (
137:     <div style={{
138:       position: 'fixed',
139:       top: 0,
140:       left: 0,
141:       width: '100vw',
142:       height: '100vh',
143:       overflow: 'auto',
144:       zIndex: 50,
145:       background: '#07091a',
146:     }}>
147:       <div
148:       style={{
149:         background: '#07091a',
150:         minHeight: '100vh',
151:         fontFamily: 'Inter, -apple-system, sans-serif',
152:         position: 'relative',
153:         overflowX: 'hidden',
154:       }}
155:     >
156: 
157:       {/* ============ ANIMATED BACKGROUND ============ */}
158:       <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
159:         {/* Orb top-left */}
160:         <motion.div
161:           animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
162:           transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
163:           style={{
164:             position: 'absolute', top: '-10%', left: '-10%',
165:             width: '700px', height: '700px', borderRadius: '50%',
166:             background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 65%)',
167:             filter: 'blur(40px)',
168:           }}
169:         />
170:         {/* Orb top-right */}
171:         <motion.div
172:           animate={{ x: [0, -60, 0], y: [0, 50, 0], scale: [1, 0.85, 1] }}
173:           transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
174:           style={{
175:             position: 'absolute', top: '5%', right: '-10%',
176:             width: '500px', height: '500px', borderRadius: '50%',
177:             background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 65%)',
178:             filter: 'blur(60px)',
179:           }}
180:         />
181:         {/* Orb bottom */}
182:         <motion.div
183:           animate={{ x: [0, 40, -30, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
184:           transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
185:           style={{
186:             position: 'absolute', bottom: '0%', left: '25%',
187:             width: '600px', height: '400px', borderRadius: '50%',
188:             background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)',
189:             filter: 'blur(70px)',
190:           }}
191:         />
192:         {/* Grid pattern */}
193:         <div style={{
194:           position: 'absolute', inset: 0,
195:           backgroundImage: `linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)`,
196:           backgroundSize: '64px 64px',
197:         }} />
198:         {/* Top fade */}
199:         <div style={{
200:           position: 'absolute', top: 0, left: 0, right: 0, height: '350px',
201:           background: 'linear-gradient(180deg, rgba(124,58,237,0.07) 0%, transparent 100%)',
202:         }} />
203:       </div>
204: 
205:       {/* ============ HEADING SECTION ============ */}
206:       <div style={{ textAlign: 'center', padding: '80px 24px 20px', position: 'relative', zIndex: 2 }}>
207:         <div style={{
208:           textAlign: 'center',
209:           maxWidth: '880px',
210:           margin: '0 auto',
211:           padding: isMobile ? '0 16px' : '0 24px',
212:         }}>
213: 
214:           {/* Badge */}
215:           <motion.div
216:             initial={{ opacity: 0, y: -12 }}
217:             animate={{ opacity: 1, y: 0 }}
218:             transition={{ duration: 0.5 }}
219:             style={{
220:               display: 'inline-flex',
221:               alignItems: 'center',
222:               gap: '8px',
223:               background: 'rgba(124,58,237,0.12)',
224:               border: '1px solid rgba(124,58,237,0.35)',
225:               borderRadius: '100px',
226:               padding: '8px 22px',
227:               fontSize: '11px',
228:               fontWeight: '700',
229:               letterSpacing: '0.16em',
230:               color: '#a78bfa',
231:               marginBottom: '36px',
232:               textTransform: 'uppercase',
233:             }}
234:           >
235:             <span style={{ fontSize: '14px' }}>✦</span> PLATFORM FEATURES
236:           </motion.div>
237: 
238:           {/* Main heading */}
239:           <motion.h1
240:             initial={{ opacity: 0, y: 24 }}
241:             animate={{ opacity: 1, y: 0 }}
242:             transition={{ duration: 0.65, delay: 0.1 }}
243:             style={{
244:               fontSize: 'clamp(48px, 7vw, 88px)',
245:               fontWeight: '900',
246:               lineHeight: '1.05',
247:               margin: '0 0 28px',
248:               letterSpacing: '-0.03em',
249:             }}
250:           >
251:             <span style={{ color: '#ffffff' }}>One </span>
252:             <span style={{
253:               background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 55%, #6d28d9 100%)',
254:               WebkitBackgroundClip: 'text',
255:               WebkitTextFillColor: 'transparent',
256:               backgroundClip: 'text',
257:             }}>Campus.</span>
258:             <br />
259:             <span style={{ color: '#ffffff' }}>Infinite </span>
260:             <span style={{
261:               background: 'linear-gradient(135deg, #c084fc 0%, #7c3aed 55%, #6d28d9 100%)',
262:               WebkitBackgroundClip: 'text',
263:               WebkitTextFillColor: 'transparent',
264:               backgroundClip: 'text',
265:             }}>Possibilities.</span>
266:           </motion.h1>
267: 
268:           {/* Subtext */}
269:           <motion.p
270:             initial={{ opacity: 0, y: 16 }}
271:             animate={{ opacity: 1, y: 0 }}
272:             transition={{ duration: 0.6, delay: 0.2 }}
273:             style={{
274:               fontSize: 'clamp(16px, 1.8vw, 20px)',
275:               color: '#64748b',
276:               lineHeight: '1.8',
277:               margin: '0 auto 40px',
278:               maxWidth: '580px',
279:             }}
280:           >
281:             Every part of your college life — social, academic, professional and fun — lives in one place.{' '}
282:             <span style={{ color: '#94a3b8' }}>No more juggling 5 apps. Just </span>
283:             <span style={{
284:               background: 'linear-gradient(90deg, #a78bfa, #7c3aed)',
285:               WebkitBackgroundClip: 'text',
286:               WebkitTextFillColor: 'transparent',
287:               backgroundClip: 'text',
288:               fontWeight: '600',
289:             }}>CampusAdda.</span>
290:           </motion.p>
291: 
292:           {/* Decorative divider */}
293:           <motion.div
294:             initial={{ opacity: 0, scaleX: 0 }}
295:             animate={{ opacity: 1, scaleX: 1 }}
296:             transition={{ duration: 0.7, delay: 0.3 }}
297:             style={{
298:               display: 'flex',
299:               alignItems: 'center',
300:               justifyContent: 'center',
301:               gap: '16px',
302:               marginTop: '8px',
303:             }}
304:           >
305:             <div style={{ height: '1px', width: '80px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4))' }} />
306:             <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
307:               {features.map((f, i) => (
308:                 <div key={i} style={{
309:                   width: '6px', height: '6px', borderRadius: '50%',
310:                   background: i === activeIndex ? features[activeIndex].color : 'rgba(124,58,237,0.25)',
311:                   transition: 'background 0.3s ease',
312:                 }} />
313:               ))}
314:             </div>
315:             <div style={{ height: '1px', width: '80px', background: 'linear-gradient(90deg, rgba(124,58,237,0.4), transparent)' }} />
316:           </motion.div>
317: 
318:         </div>
319:       </div>
320: 
321:       {/* ============ STICKY SCROLL SECTION ============
322:           ARCHITECTURE (mirrored from hatch.co.in):
323:           - LEFT: normal flow, 100vh per card (auto on mobile) — SCROLLS NATURALLY
324:           - RIGHT: position sticky, height 100vh — DESKTOP MONITOR — NEVER MOVES
325:           - IntersectionObserver watches each card, updates activeIndex
326:           - NO snap, NO hijack, NO setInterval
327:       ============================================= */}
328:       <div style={{
329:         position: 'relative',
330:         zIndex: 2,
331:         width: '100vw',
332:         maxWidth: '100%',
333:         margin: '0 auto',
334:         paddingTop: '0px',
335:         minHeight: `${features.length * 100}vh`,
336:       }}>
337:         <div style={{ 
338:           display: 'flex', 
339:           width: '100%', 
340:           maxWidth: '1400px', 
341:           margin: '0 auto', 
342:           padding: isMobile ? '0 20px' : '0 48px', 
343:           gap: '80px', 
344:           alignItems: 'flex-start' 
345:         }}>
346: 
347:           {/* ===== LEFT: SCROLLING FEATURE CARDS ===== */}
348:           <div style={{ flex: 1 }}>
349:             {features.map((feature, index) => (
350:               <div
351:                 key={index}
352:                 ref={(el) => { cardRefs.current[index] = el }}
353:                 style={{
354:                   height: isMobile ? 'auto' : '100vh',
355:                   display: 'flex',
356:                   flexDirection: 'column',
357:                   justifyContent: 'center',
358:                   paddingTop: isMobile ? '60px' : '20px',
359:                   paddingBottom: isMobile ? '60px' : '20px',
360:                 }}
361:               >
362:                 <motion.div
363:                   initial={{ opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? 20 : 0 }}
364:                   whileInView={{ opacity: 1, x: 0, y: 0 }}
365:                   viewport={{ once: false, amount: isMobile ? 0.2 : 0.4 }}
366:                   transition={{ duration: 0.5, ease: 'easeOut' }}
367:                 >
368:                   {/* Number + tag */}
369:                   <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
370:                     <div style={{
371:                       width: '46px', height: '46px', borderRadius: '50%',
372:                       background: feature.color,
373:                       display: 'flex', alignItems: 'center', justifyContent: 'center',
374:                       fontSize: '14px', fontWeight: '800', color: 'white', flexShrink: 0,
375:                       boxShadow: `0 0 20px ${feature.color}50`,
376:                     }}>
377:                       {feature.number}
378:                     </div>
379:                     <span style={{
380:                       fontSize: '12px', fontWeight: '700',
381:                       letterSpacing: '0.16em', color: feature.color,
382:                       textTransform: 'uppercase',
383:                     }}>
384:                       {feature.tag}
385:                     </span>
386:                   </div>
387: 
388:                   {/* Headline */}
389:                   <h2 style={{
390:                     fontSize: 'clamp(32px, 3.5vw, 50px)',
391:                     fontWeight: '800', color: '#f1f5f9',
392:                     lineHeight: '1.15', margin: '0 0 14px',
393:                     letterSpacing: '-0.02em',
394:                   }}>
395:                     {feature.headline}
396:                   </h2>
397: 
398:                   {/* Subheadline */}
399:                   <p style={{
400:                     fontSize: '17px', fontWeight: '500',
401:                     color: feature.color, margin: '0 0 16px', lineHeight: '1.6',
402:                   }}>
403:                     {feature.subheadline}
404:                   </p>
405: 
406:                   {/* Divider */}
407:                   <div style={{
408:                     width: '44px', height: '3px',
409:                     background: feature.color, borderRadius: '2px',
410:                     marginBottom: '20px',
411:                   }} />
412: 
413:                   {/* Mobile mockup image */}
414:                   {isMobile && (
415:                     <div style={{
416:                       margin: '24px 0 32px',
417:                       background: 'linear-gradient(180deg, #1e1e30 0%, #16162a 100%)',
418:                       borderRadius: '12px',
419:                       border: '2px solid #2c2c44',
420:                       padding: '12px 12px 8px 12px',
421:                       boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 40px ${feature.color}15`,
422:                     }}>
423:                       <div style={{
424:                         borderRadius: '6px',
425:                         overflow: 'hidden',
426:                         aspectRatio: '16/10',
427:                         position: 'relative',
428:                         background: '#000',
429:                       }}>
430:                         <img
431:                           src={feature.image}
432:                           alt={feature.tag}
433:                           style={{
434:                             width: '100%', height: '100%',
435:                             objectFit: 'cover', objectPosition: 'top',
436:                             display: 'block',
437:                           }}
438:                         />
439:                       </div>
440:                     </div>
441:                   )}
442: 
443:                   {/* Description */}
444:                   <p style={{
445:                     fontSize: '16px', color: '#94a3b8',
446:                     lineHeight: '1.85', margin: '0 0 24px', maxWidth: '480px',
447:                   }}>
448:                     {feature.description}
449:                   </p>
450: 
451:                   {/* Bullets */}
452:                   <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '26px' }}>
453:                     {feature.bullets.map((bullet, i) => (
454:                       <div key={i} style={{
455:                         fontSize: '15px', color: '#cbd5e1',
456:                         display: 'flex', alignItems: 'center', gap: '8px',
457:                       }}>
458:                         {bullet}
459:                       </div>
460:                     ))}
461:                   </div>
462: 
463:                   {/* Tags */}
464:                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
465:                     {feature.tags.map((tag) => (
466:                       <span key={tag} style={{
467:                         padding: '6px 16px', borderRadius: '100px',
468:                         fontSize: '13px', fontWeight: '500',
469:                         background: `${feature.color}15`,
470:                         border: `1px solid ${feature.color}40`,
471:                         color: feature.color,
472:                       }}>
473:                         {tag}
474:                       </span>
475:                     ))}
476:                   </div>
477: 
478:                   {/* CTA button — only on final slide */}
479:                   {feature.isFinal && (
480:                     <Link href="/" passHref legacyBehavior>
481:                       <motion.a
482:                         initial={{ opacity: 0, scale: 0.9 }}
483:                         whileInView={{ opacity: 1, scale: 1 }}
484:                         viewport={{ once: true }}
485:                         transition={{ delay: 0.4, duration: 0.4 }}
486:                         whileHover={{ scale: 1.05 }}
487:                         whileTap={{ scale: 0.98 }}
488:                         style={{
489:                           display: 'inline-block',
490:                           padding: '16px 44px',
491:                           borderRadius: '100px',
492:                           background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
493:                           color: 'white',
494:                           fontSize: '17px', fontWeight: '700',
495:                           textDecoration: 'none',
496:                           boxShadow: '0 0 40px rgba(124,58,237,0.45)',
497:                           cursor: 'pointer',
498:                         }}
499:                       >
500:                         {"Let's Go to CampusAdda 🚀"}
501:                       </motion.a>
502:                     </Link>
503:                   )}
504: 
505:                 </motion.div>
506:               </div>
507:             ))}
508:           </div>
509: 
510:           {/* ===== RIGHT: STICKY DESKTOP MONITOR ===== */}
511:           {!isMobile && (
512:             <div style={{
513:               position: 'sticky',
514:               top: 0,
515:               height: '100vh',
516:               width: '520px',
517:               flexShrink: 0,
518:               display: 'flex',
519:               flexDirection: 'column',
520:               alignItems: 'center',
521:               justifyContent: 'center',
522:               alignSelf: 'flex-start',
523:             }}>
524: 
525:               {/* Glow behind monitor — color tinted per feature */}
526:               <div
527:                 style={{
528:                   position: 'absolute',
529:                   width: '420px',
530:                   height: '280px',
531:                   borderRadius: '50%',
532:                   background: features[activeIndex].color,
533:                   opacity: 0.08,
534:                   filter: 'blur(80px)',
535:                   zIndex: 0,
536:                   transition: 'background 0.6s ease',
537:                 }}
538:               />
539: 
540:               {/* Feature counter */}
541:               <div style={{
542:                 position: 'absolute',
543:                 top: '18%',
544:                 right: '0px',
545:                 fontSize: '12px',
546:                 color: 'rgba(255,255,255,0.2)',
547:                 fontWeight: '600',
548:                 letterSpacing: '0.08em',
549:               }}>
550:                 {String(activeIndex + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
551:               </div>
552: 
553:               {/* ===== iMAC DESKTOP MONITOR ===== */}
554:               <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
555: 
556:                 {/* Monitor bezel */}
557:                 <div style={{
558:                   background: 'linear-gradient(180deg, #1e1e30 0%, #16162a 100%)',
559:                   borderRadius: '14px 14px 6px 6px',
560:                   border: '2px solid #2c2c44',
561:                   padding: '14px 14px 10px 14px',
562:                   boxShadow: `0 0 0 1px #0c0c1a, 0 30px 80px rgba(0,0,0,0.8), 0 0 60px ${features[activeIndex].color}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
563:                   transition: 'box-shadow 0.5s ease',
564:                 }}>
565: 
566:                   {/* Camera dot */}
567:                   <div style={{
568:                     display: 'flex', alignItems: 'center', justifyContent: 'center',
569:                     marginBottom: '10px',
570:                   }}>
571:                     <div style={{
572:                       width: '7px', height: '7px', borderRadius: '50%',
573:                       background: '#2a2a40', border: '1px solid #3a3a58',
574:                     }} />
575:                   </div>
576: 
577:                   {/* Screen */}
578:                   <div style={{
579:                     background: '#000',
580:                     borderRadius: '6px',
581:                     overflow: 'hidden',
582:                     aspectRatio: '16/10',
583:                     position: 'relative',
584:                   }}>
585:                     <AnimatePresence mode="wait">
586:                       <motion.img
587:                         key={activeIndex}
588:                         src={features[activeIndex].image}
589:                         alt={features[activeIndex].tag}
590:                         initial={{ opacity: 0, scale: 1.06 }}
591:                         animate={{ opacity: 1, scale: 1 }}
592:                         exit={{ opacity: 0, scale: 0.95 }}
593:                         transition={{ duration: 0.5, ease: 'easeInOut' }}
594:                         style={{
595:                           width: '100%', height: '100%',
596:                           objectFit: 'cover', objectPosition: 'top',
597:                           display: 'block',
598:                         }}
599:                       />
600:                     </AnimatePresence>
601: 
602:                     {/* Feature label badge on screen */}
603:                     <AnimatePresence mode="wait">
604:                       <motion.div
605:                         key={`badge-${activeIndex}`}
606:                         initial={{ opacity: 0, x: -10 }}
607:                         animate={{ opacity: 1, x: 0 }}
608:                         exit={{ opacity: 0 }}
609:                         transition={{ delay: 0.2, duration: 0.3 }}
610:                         style={{
611:                           position: 'absolute', top: '12px', left: '12px',
612:                           background: 'rgba(0,0,0,0.7)',
613:                           backdropFilter: 'blur(12px)',
614:                           border: `1px solid ${features[activeIndex].color}55`,
615:                           borderRadius: '100px',
616:                           padding: '4px 13px',
617:                           fontSize: '10px', fontWeight: '700',
618:                           color: features[activeIndex].color,
619:                           letterSpacing: '0.12em',
620:                           textTransform: 'uppercase',
621:                         }}
622:                       >
623:                         {features[activeIndex].tag}
624:                       </motion.div>
625:                     </AnimatePresence>
626:                   </div>
627:                 </div>
628: 
629:                 {/* Neck / stem */}
630:                 <div style={{
631:                   width: '12px', height: '44px',
632:                   background: 'linear-gradient(180deg, #1a1a2c, #111120)',
633:                   margin: '0 auto',
634:                   borderLeft: '1px solid #2c2c44',
635:                   borderRight: '1px solid #2c2c44',
636:                 }} />
637: 
638:                 {/* Base */}
639:                 <div style={{
640:                   height: '16px', width: '200px',
641:                   background: 'linear-gradient(180deg, #1a1a2c, #111120)',
642:                   margin: '0 auto',
643:                   borderRadius: '0 0 14px 14px',
644:                   border: '1px solid #2c2c44',
645:                   borderTop: 'none',
646:                   boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
647:                 }} />
648: 
649:               </div>
650: 
651:               {/* Progress dots below monitor */}
652:               <div style={{ display: 'flex', gap: '8px', marginTop: '32px', zIndex: 1 }}>
653:                 {features.map((f, i) => (
654:                   <motion.div
655:                     key={i}
656:                     animate={{
657:                       width: i === activeIndex ? '28px' : '8px',
658:                       background: i === activeIndex ? features[activeIndex].color : 'rgba(255,255,255,0.15)',
659:                     }}
660:                     transition={{ duration: 0.3 }}
661:                     style={{
662:                       height: '8px', borderRadius: '100px',
663:                       cursor: 'pointer',
664:                     }}
665:                     onClick={() => {
666:                       if (cardRefs.current[i]) {
667:                         cardRefs.current[i].scrollIntoView({ behavior: 'smooth', block: 'center' })
668:                       }
669:                     }}
670:                   />
671:                 ))}
672:               </div>
673: 
674:             </div>
675:           )}
676: 
677:         </div>
678:       </div>
679: 
680:       {/* Bottom padding */}
681:       <div style={{ height: '100px' }} />
682: 
683:       </div>
684:     </div>
685:   )
686: }
"""

# Strip out the line numbers and spaces using regex
cleaned_content = re.sub(r'^\d+:\s', '', content, flags=re.MULTILINE)

with open('src/app/welcome-tour/page.js', 'w') as f:
    f.write(cleaned_content)

print("Done restoring")
