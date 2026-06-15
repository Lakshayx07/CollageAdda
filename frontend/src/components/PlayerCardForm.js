import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ChevronRight, ChevronLeft, Gamepad2, Dumbbell, Check } from 'lucide-react';
import clsx from 'clsx';

// ─── Game → 3 relevant skills mapping ────────────────────────────────────────
const SKILL_MAP = {
  // Esports
  'BGMI':       ['Accuracy 🎯', 'Game Sense 🧠', 'Clutch 💪'],
  'Valorant':   ['Accuracy 🎯', 'Game Sense 🧠', 'Clutch 💪'],
  'Free Fire':  ['Accuracy 🎯', 'Game Sense 🧠', 'Clutch 💪'],
  'FIFA':       ['Game Sense 🧠', 'Teamwork 🤝', 'Clutch 💪'],
  'Rocket League': ['Game Sense 🧠', 'Teamwork 🤝', 'Clutch 💪'],
  'Chess':      ['Game Sense 🧠', 'Accuracy 🎯', 'Clutch 💪'],
  // Sports
  'Cricket':    ['Batting 🏏', 'Bowling 🎯', 'Fielding 🏃'],
  'Football':   ['Dribbling ⚽', 'Teamwork 🤝', 'Finishing 🥅'],
  'Basketball': ['Shooting 🏀', 'Dribbling ⚽', 'Defense 🛡️'],
  'Badminton':  ['Accuracy 🎯', 'Speed 🏃', 'Stamina ⚡'],
  'Tennis':     ['Accuracy 🎯', 'Speed 🏃', 'Clutch 💪'],
};
const DEFAULT_SKILLS = ['Game Sense 🧠', 'Teamwork 🤝', 'Accuracy 🎯'];

// ─── Skill level buttons: Beginner=1, Good=4, Pro=7, Elite=10 ─────────────────
const SKILL_LEVELS = [
  { label: 'Beginner', value: 1 },
  { label: 'Good',     value: 4 },
  { label: 'Pro',      value: 7 },
  { label: 'Elite',    value: 10 },
];

// ─── Tab accent colors ────────────────────────────────────────────────────────
const THEME = {
  esports: {
    accent: '#39FF82',
    accentMuted: 'rgba(57,255,130,0.15)',
    accentBorder: 'rgba(57,255,130,0.35)',
    gradient: 'linear-gradient(135deg, #6C3AFF, #1A0A2E)',
    glow: '0 4px 24px rgba(108,58,255,0.4)',
    tabLabel: '🎮 Esports',
  },
  sports: {
    accent: '#FF6B35',
    accentMuted: 'rgba(255,107,53,0.15)',
    accentBorder: 'rgba(255,107,53,0.35)',
    gradient: 'linear-gradient(135deg, #FF6B35, #2A1000)',
    glow: '0 4px 24px rgba(255,107,53,0.4)',
    tabLabel: '🏆 Sports',
  },
};

// ─── Step progress bar ────────────────────────────────────────────────────────
function StepBar({ step, accent }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      {[1, 2, 3].map(s => (
        <React.Fragment key={s}>
          <div
            className="h-1.5 flex-1 rounded-full transition-all duration-400"
            style={{ background: step >= s ? accent : 'rgba(255,255,255,0.08)' }}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Mini Live Preview Card ───────────────────────────────────────────────────
function PreviewCard({ name, game, photo, skills, skillRatings, accent, accentMuted, accentBorder }) {
  const displayName = name || '—';
  const displayGame = game || '—';

  return (
    <div
      className="rounded-2xl p-4 mb-5 relative overflow-hidden border"
      style={{ background: 'rgba(0,0,0,0.6)', borderColor: accentBorder }}
    >
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${accentMuted}, transparent 70%)` }} />

      <div className="flex items-center gap-3 relative z-10">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 flex items-center justify-center bg-black/40"
          style={{ borderColor: accentBorder }}
        >
          {photo
            ? <img src={photo} alt="you" className="w-full h-full object-cover" />
            : <span className="text-2xl font-black text-white/30">?</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate">{displayName}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 truncate" style={{ color: accent }}>{displayGame}</p>

          {/* Skill pills — live */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {skills.map(sk => {
              const key = sk;
              const val = skillRatings[key];
              const lvl = SKILL_LEVELS.find(l => l.value === val);
              return (
                <span
                  key={sk}
                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={
                    val
                      ? { background: accentMuted, color: accent, border: `1px solid ${accentBorder}` }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {sk.split(' ')[0]} {lvl ? lvl.label : '—'}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PlayerCardForm({ onClose, initialCategory = 'esports' }) {
  const [category, setCategory] = useState(initialCategory);
  const [step, setStep] = useState(1);

  // Auto-fill name from localStorage
  const [autoName, setAutoName] = useState('');
  useEffect(() => {
    try {
      const stored = localStorage.getItem('collegeadda_user');
      if (stored) {
        const u = JSON.parse(stored);
        setAutoName(u.name || u.fullName || '');
      }
    } catch (_) {}
  }, []);

  // Form state — keep all fields so submit payload doesn't change
  const [formData, setFormData] = useState({
    username: '',
    game_or_sport: '',
    role_or_position: '',
    rank: '',
    experience_level: '',
    availability: 'Both',
    bio: '',
    photo_url: '',
    skills: { s1: null, s2: null, s3: null, s4: null, s5: null }
  });

  const isEsports = category === 'esports';
  const theme = THEME[category];
  const { accent, accentMuted, accentBorder, gradient, glow } = theme;

  // Derived: 3 relevant skills for selected game/sport
  const activeSkillLabels = SKILL_MAP[formData.game_or_sport] || DEFAULT_SKILLS;

  // Map skill labels → s1/s2/s3 keys
  const skillKeys = ['s1', 's2', 's3'];
  const skillRatingsByLabel = {};
  activeSkillLabels.forEach((lbl, i) => {
    skillRatingsByLabel[lbl] = formData.skills[skillKeys[i]];
  });

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleCategorySwitch = (cat) => {
    setCategory(cat);
    // Reset game selection and skills on tab switch
    setFormData(prev => ({
      ...prev,
      game_or_sport: '',
      skills: { s1: null, s2: null, s3: null, s4: null, s5: null }
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, photo_url: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSkillTap = (keyIndex, value) => {
    const key = skillKeys[keyIndex];
    setFormData(prev => ({
      ...prev,
      skills: { ...prev.skills, [key]: value }
    }));
  };

  const handleSubmit = () => {
    // Emit full payload matching existing backend shape
    // name is auto-filled from user profile
    const payload = {
      name: autoName,
      ...formData,
      category,
    };
    console.log('PlayerCard submit:', payload);
    alert('Card Created Successfully! 🎉');
    onClose();
  };

  // ── Step validation ──────────────────────────────────────────────────────
  const canGoStep2 = !!formData.game_or_sport;  // game/sport must be selected
  const canSubmit = skillKeys.every((_, i) => formData.skills[skillKeys[i]] !== null); // all 3 skills rated

  // ── Games / Sports lists ─────────────────────────────────────────────────
  const gameList = isEsports
    ? ['BGMI', 'Valorant', 'Free Fire', 'Chess', 'FIFA']
    : ['Cricket', 'Football', 'Badminton', 'Basketball', 'Tennis'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full sm:max-w-md app-panel rounded-t-[2rem] sm:rounded-[2rem] relative overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Accent top bar */}
        <div className="h-1 w-full" style={{ background: gradient }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                {isEsports ? <Gamepad2 size={18} style={{ color: accent }} /> : <Dumbbell size={18} style={{ color: accent }} />}
                Create Player Card
              </h2>
              <p className="text-[10px] text-white/40 font-bold mt-0.5">
                Step {step} of 3 · {['Identity', 'Details', 'Skills'][step - 1]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 glass rounded-xl text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress bar */}
          <StepBar step={step} accent={accent} />

          {/* Tab switcher */}
          <div className="flex gap-1.5 mt-4 bg-black/50 p-1 rounded-xl border border-white/5">
            {(['esports', 'sports'] ).map(cat => {
              const t = THEME[cat];
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { handleCategorySwitch(cat); setStep(1); }}
                  className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                  style={
                    active
                      ? { background: t.gradient, color: '#fff', boxShadow: t.glow }
                      : { color: 'rgba(255,255,255,0.35)' }
                  }
                >
                  {t.tabLabel}
                </button>
              );
            })}
          </div>

          {/* Auto-name display */}
          <p className="text-[10px] text-white/35 font-bold mt-3 flex items-center gap-1">
            <span className="text-white/20">Creating card for:</span>
            <span style={{ color: accent }}>{autoName || '—'}</span>
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-4">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Identity ─────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                {/* Photo upload */}
                <div className="flex flex-col items-center">
                  <label
                    className="relative w-24 h-24 rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center border-2 border-dashed transition hover:opacity-80"
                    style={{ borderColor: accentBorder, background: accentMuted }}
                  >
                    {formData.photo_url
                      ? <img src={formData.photo_url} alt="photo" className="absolute inset-0 w-full h-full object-cover" />
                      : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload size={22} style={{ color: accent }} />
                          <span className="text-[9px] text-white/40 font-black uppercase tracking-wider text-center">Photo</span>
                        </div>
                      )
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  <p className="text-[9px] text-white/25 mt-2 font-bold">Optional — tap to upload</p>
                </div>

                {/* Game Username / Jersey Name */}
                <div>
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                    {isEsports ? 'Game Username / ID' : 'Jersey Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEsports ? 'Viper_X#1234' : 'Arjun'}
                    value={formData.username}
                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition"
                    style={{ focusBorderColor: accent }}
                  />
                </div>

                {/* Select Game / Sport */}
                <div>
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                    {isEsports ? 'Select Game' : 'Select Sport'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {gameList.map(g => {
                      const active = formData.game_or_sport === g;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormData(p => ({
                            ...p,
                            game_or_sport: g,
                            // reset skills when game changes
                            skills: { s1: null, s2: null, s3: null, s4: null, s5: null }
                          }))}
                          className="py-3 px-3 rounded-xl text-sm font-black text-left transition-all"
                          style={
                            active
                              ? { background: accentMuted, color: accent, border: `1.5px solid ${accentBorder}` }
                              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1.5px solid rgba(255,255,255,0.08)' }
                          }
                        >
                          {active && <Check size={12} className="inline mr-1.5 mb-0.5" />}
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Details ──────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                {/* Rank / Experience */}
                <div>
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                    {isEsports ? 'Current Rank' : 'Experience Level'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEsports ? 'Diamond 3' : 'Inter-College'}
                    value={isEsports ? formData.rank : formData.experience_level}
                    onChange={e =>
                      isEsports
                        ? setFormData(p => ({ ...p, rank: e.target.value }))
                        : setFormData(p => ({ ...p, experience_level: e.target.value }))
                    }
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition"
                  />
                </div>

                {/* Role / Position */}
                <div>
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                    {isEsports ? 'Favourite Role' : 'Playing Position'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEsports ? 'IGL / Assaulter' : 'Forward / Bowler'}
                    value={formData.role_or_position}
                    onChange={e => setFormData(p => ({ ...p, role_or_position: e.target.value }))}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Availability</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Both', 'Tournaments', 'Casual'].map(opt => {
                      const active = formData.availability === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, availability: opt }))}
                          className="py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                          style={
                            active
                              ? { background: accentMuted, color: accent, border: `1.5px solid ${accentBorder}` }
                              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1.5px solid rgba(255,255,255,0.08)' }
                          }
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Short Bio */}
                <div>
                  <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">Short Bio (optional)</label>
                  <textarea
                    maxLength={100}
                    rows={2}
                    placeholder={isEsports ? 'IGL main, 3000+ matches...' : 'Playing since age 10...'}
                    value={formData.bio}
                    onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition resize-none custom-scrollbar"
                  />
                  <p className="text-[9px] text-white/25 mt-1 font-bold text-right">{formData.bio.length}/100</p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Skills ───────────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                {/* Live preview card */}
                <PreviewCard
                  name={autoName}
                  game={formData.game_or_sport}
                  photo={formData.photo_url}
                  skills={activeSkillLabels}
                  skillRatings={skillRatingsByLabel}
                  accent={accent}
                  accentMuted={accentMuted}
                  accentBorder={accentBorder}
                />

                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  Rate Your Skills
                </p>

                {/* Tap-to-select skill levels — 3 game-specific skills */}
                {activeSkillLabels.map((skillLabel, idx) => {
                  const currentVal = formData.skills[skillKeys[idx]];
                  return (
                    <div key={skillLabel} className="space-y-2">
                      <p className="text-xs font-black text-white/70">{skillLabel}</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {SKILL_LEVELS.map(({ label, value }) => {
                          const active = currentVal === value;
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => handleSkillTap(idx, value)}
                              className="py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                              style={
                                active
                                  ? {
                                      background: accentMuted,
                                      color: accent,
                                      border: `1.5px solid ${accentBorder}`,
                                      boxShadow: `0 0 12px ${accentMuted}`,
                                    }
                                  : {
                                      background: 'rgba(255,255,255,0.04)',
                                      color: 'rgba(255,255,255,0.4)',
                                      border: '1.5px solid rgba(255,255,255,0.08)',
                                    }
                              }
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Navigation Buttons ─────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-white/8 flex gap-3 shrink-0">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 py-3 px-5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && !canGoStep2}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
              style={
                !(step === 1 && !canGoStep2)
                  ? { background: accent, color: '#000', boxShadow: `0 4px 20px ${accentMuted}` }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed' }
              }
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
              style={
                canSubmit
                  ? { background: accent, color: '#000', boxShadow: `0 4px 20px ${accentMuted}` }
                  : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed' }
              }
            >
              Generate Card ✨
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
