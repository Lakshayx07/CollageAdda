import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ChevronRight, ChevronLeft, ChevronDown, Gamepad2, Dumbbell, Check } from 'lucide-react';
import clsx from 'clsx';
import BGMIProfileCard from './BGMIProfileCard';
import ValorantProfileCard from './ValorantProfileCard';
import FreeFireProfileCard from './FreeFireProfileCard';
import ChessProfileCard from './ChessProfileCard';

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
    accent: '#C8922A',
    accentMuted: 'rgba(200, 146, 42, 0.15)',
    accentBorder: 'rgba(200, 146, 42, 0.35)',
    gradient: 'linear-gradient(135deg, #C8922A, #D4A843)',
    glow: '0 4px 24px rgba(200, 146, 42, 0.25)',
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
function StepBar({ step, accent, totalSteps = 4 }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
        <React.Fragment key={s}>
          <div
            className="h-1.5 flex-1 rounded-full transition-all duration-400"
            style={{ background: step >= s ? accent : '#F3F2EE' }}
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
          className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 flex items-center justify-center bg-[#000000]/40"
          style={{ borderColor: accentBorder }}
        >
          {photo
            ? <img src={photo} alt="you" className="w-full h-full object-cover" />
            : <span className="text-2xl font-black text-[#6B6B6B]">?</span>
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-[#1A1A1A] truncate">{displayName}</p>
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
export default function PlayerCardForm({ onClose, initialCategory = 'esports', onSubmit, viewOnlyData }) {
  const [category, setCategory] = useState(initialCategory);
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(!!viewOnlyData);

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

  // Helper to flatten data from Supabase for formData state
  const getInitialFormData = () => {
    if (viewOnlyData) {
      if (viewOnlyData.card_data) {
        return {
          username: viewOnlyData.username,
          game_or_sport: viewOnlyData.game_or_sport,
          photo_url: viewOnlyData.photo_url,
          ...viewOnlyData.card_data
        };
      }
      return viewOnlyData; // Legacy support for old localStorage items
    }
    return {
      username: '',
      game_or_sport: '',
      role_or_position: '',
      rank: '',
      experience_level: '',
      availability: 'Both',
      bio: '',
      photo_url: '',
      skills: { s1: null, s2: null, s3: null, s4: null, s5: null },
      display_name: '',
      highest_rank: '',
      current_rp: '',
      kd_ratio: '',
      matches_played: '',
      top_10_rate: '',
      preferred_roles: [],
      playstyles: [],
      looking_for: '',
      // Valorant specific
      tagline: '',
      current_rr: '',
      win_rate: '',
      acs: '',
      agents: ['', '', ''],
      val_playstyle: [],
      val_looking_for: [],
      // Free Fire specific
      ff_rank_score: '',
      booyah_rate: '',
      ff_preferred_roles: [],
      ff_playstyles: [],
      ff_looking_for: [],
      // Chess specific
      chess_play_format: 'Rapid',
      chess_current_rating: '',
      chess_highest_rating: '',
      chess_games_played: '',
      chess_win_rate: '',
      chess_good_game: '',
      chess_playstyles: [],
      chess_looking_for: [],
    };
  };

  // Form state — keep all fields so submit payload doesn't change
  const [formData, setFormData] = useState(getInitialFormData());

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
    
    // Create an image element to resize the image via canvas
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setFormData(prev => ({ ...prev, photo_url: compressedDataUrl }));
      };
      img.src = e.target.result;
    };
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
    // Separate core fields from game-specific fields for Supabase schema
    const { username, game_or_sport, photo_url, ...rest } = formData;
    const payload = {
      username: username || autoName,
      game_or_sport,
      category,
      photo_url,
      card_data: rest
    };
    console.log('PlayerCard submit:', payload);
    
    if (onSubmit) onSubmit(payload);
    
    if (isBGMI || isValorant || isFreeFire || isChess) {
      setIsSubmitted(true);
    } else {
      alert('Card Created Successfully! 🎉');
      onClose();
    }
  };

  const isBGMI = formData.game_or_sport === 'BGMI';
  const isValorant = formData.game_or_sport === 'Valorant';
  const isFreeFire = formData.game_or_sport === 'Free Fire';
  const isChess = formData.game_or_sport === 'Chess';
  const totalSteps = (isBGMI || isValorant || isFreeFire) ? 7 : (isChess ? 6 : 4);

  // ── Step validation ──────────────────────────────────────────────────────
  const canGoNext = () => {
    if (step === 1) return !!formData.game_or_sport;
    if (isBGMI) {
      if (step === 2) return !!formData.username && !!formData.display_name;
      if (step === 3) return !!formData.current_rank && !!formData.highest_rank;
      if (step === 4) return true;
      if (step === 5) return formData.preferred_roles.length > 0;
      if (step === 6) return formData.playstyles.length > 0;
      if (step === 7) return formData.looking_for !== '';
    } else if (isValorant) {
      if (step === 2) return !!formData.username;
      if (step === 3) return !!formData.current_rank && !!formData.highest_rank; // current_rank and peak rank
      if (step === 4) return !!formData.kd_ratio && !!formData.win_rate && !!formData.acs;
      if (step === 5) return true; // optional agent pool
      if (step === 6) return formData.val_playstyle.length > 0;
      if (step === 7) return formData.val_looking_for.length > 0;
    } else if (isFreeFire) {
      if (step === 2) return !!formData.username;
      if (step === 3) return !!formData.current_rank;
      if (step === 4) return !!formData.kd_ratio && !!formData.matches_played && !!formData.booyah_rate;
      if (step === 5) return formData.ff_preferred_roles.length > 0;
      if (step === 6) return formData.ff_playstyles.length > 0;
      if (step === 7) return formData.ff_looking_for.length > 0;
    } else if (isChess) {
      if (step === 2) return !!formData.username;
      if (step === 3) return !!formData.chess_current_rating && !!formData.chess_highest_rating;
      if (step === 4) return !!formData.chess_games_played && !!formData.chess_win_rate;
      if (step === 5) return formData.chess_playstyles.length > 0;
      if (step === 6) return formData.chess_looking_for.length > 0;
    } else {
      if (step === 2) return true;
      if (step === 3) return true;
      if (step === 4) return skillKeys.every((_, i) => formData.skills[skillKeys[i]] !== null);
    }
    return true;
  };

  // ── Games / Sports lists ─────────────────────────────────────────────────
  const gameList = isEsports
    ? ['BGMI', 'Valorant', 'Free Fire', 'Chess', 'FIFA']
    : ['Cricket', 'Football', 'Badminton', 'Basketball', 'Tennis'];

  if (isSubmitted && isBGMI) {
    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 bg-[#000000]/85 backdrop-blur-xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-[#FFFFFF]/10 rounded-full text-[#FFFFFF] hover:bg-[#FFFFFF]/20 transition-colors z-50"
        >
          <X size={24} />
        </button>
        <BGMIProfileCard formData={formData} />
      </div>
    );
  }

  if (isSubmitted && isValorant) {
    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 bg-[#0F1923]/92 backdrop-blur-xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-[#FFFFFF]/10 rounded-full text-[#FFFFFF] hover:bg-[#FF4655] transition-colors z-50"
        >
          <X size={24} />
        </button>
        <ValorantProfileCard formData={formData} />
      </div>
    );
  }

  if (isSubmitted && isFreeFire) {
    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 bg-[#0E1015]/92 backdrop-blur-xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-[#FFFFFF]/10 rounded-full text-[#FFFFFF] hover:bg-[#FBBF24] transition-colors z-50"
        >
          <X size={24} />
        </button>
        <FreeFireProfileCard formData={formData} />
      </div>
    );
  }

  if (isSubmitted && isChess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0D14]/90 backdrop-blur-xl overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-[#FFFFFF]/10 rounded-full text-[#FFFFFF] hover:bg-[#CD8C38] transition-colors z-50"
        >
          <X size={24} />
        </button>
        <ChessProfileCard formData={formData} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#000000]/40 backdrop-blur-xl">
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
              <h2 className="text-lg font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                {isEsports ? <Gamepad2 size={18} style={{ color: accent }} /> : <Dumbbell size={18} style={{ color: accent }} />}
                Create Player Card
              </h2>
              <p className="text-[10px] text-[#6B6B6B] font-bold mt-0.5">
                Step {step} of {totalSteps} · {
                  isBGMI
                  ? ['Game', 'Basic Info', 'Current Rank', 'Core Stats', 'Preferred Role', 'Playstyle', 'Looking For'][step - 1]
                  : isValorant
                  ? ['Game', 'Basic Info', 'Current Rank', 'Core Stats', 'Agent Pool', 'Playstyle', 'Looking For'][step - 1]
                  : isFreeFire
                  ? ['Game', 'Basic Info', 'Current Rank', 'Core Stats', 'Preferred Role', 'Playstyle', 'Looking For'][step - 1]
                  : isChess
                  ? ['Game', 'Basic Info', 'Current Rating', 'Core Stats', 'Play Style', 'Looking For'][step - 1]
                  : ['Game', 'Identity', 'Details', 'Skills'][step - 1]
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-[#F9F8F5] border border-[#E8E6E0] rounded-xl text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress bar */}
          <StepBar step={step} accent={accent} totalSteps={totalSteps} />

          {/* Auto-name display */}
          <p className="text-[10px] text-[#888888] font-bold mt-3 flex items-center gap-1">
            <span className="text-[#888888]">Creating card for:</span>
            <span style={{ color: accent }}>{autoName || '—'}</span>
          </p>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-4">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Game Selection ─────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                {/* Select Game / Sport */}
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">
                    {isEsports ? 'Are you interested in which Game?' : 'Are you interested in which Sport?'}
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
                              : { background: '#F3F2EE', color: '#6B6B6B', border: '1.5px solid #E8E6E0' }
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

            {/* ── BGMI STEP 2: Basic Info ─────────────────────────────────────── */}
            {isBGMI && step === 2 && (
              <motion.div
                key="bgmi_step2"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">In-Game Name (IGN) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter your in-game name"
                    value={formData.username}
                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Display Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Name to show on your card"
                    value={formData.display_name}
                    onChange={e => setFormData(p => ({ ...p, display_name: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Profile Picture</label>
                  <label
                    className="relative w-full h-24 rounded-2xl overflow-hidden cursor-pointer flex flex-col items-center justify-center border border-dashed border-[#E8E6E0] bg-[#F3F2EE] transition hover:opacity-80"
                  >
                    {formData.photo_url
                      ? <img src={formData.photo_url} alt="photo" className="absolute inset-0 w-full h-full object-cover" />
                      : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload size={22} style={{ color: '#0B4D3C' }} />
                          <span className="text-[12px] text-[#1A1A1A] font-bold">Upload Image</span>
                          <span className="text-[10px] text-[#888888]">JPG, PNG (Max 5MB)</span>
                        </div>
                      )
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </motion.div>
            )}

            {/* ── BGMI STEP 3: Current Rank ─────────────────────────────────────── */}
            {isBGMI && step === 3 && (
              <motion.div
                key="bgmi_step3"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Current Rank <span className="text-red-500">*</span></label>
                  <div className="relative">
<select
                    value={formData.current_rank}
                    onChange={e => setFormData(p => ({ ...p, current_rank: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition appearance-none"
                  >
                    <option value="" disabled>Select Current Rank</option>
                    {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Ace Master', 'Ace Dominator', 'Conqueror'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
<ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" size={16} />
</div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Highest Rank Achieved <span className="text-red-500">*</span></label>
                  <div className="relative">
<select
                    value={formData.highest_rank}
                    onChange={e => setFormData(p => ({ ...p, highest_rank: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition appearance-none"
                  >
                    <option value="" disabled>Select Highest Rank</option>
                    {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown', 'Ace', 'Ace Master', 'Ace Dominator', 'Conqueror'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
<ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" size={16} />
</div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Current RP / Points</label>
                  <input
                    type="number"
                    placeholder="Enter your current RP"
                    value={formData.current_rp}
                    onChange={e => setFormData(p => ({ ...p, current_rp: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                  />
                </div>
              </motion.div>
            )}

            {/* ── BGMI STEP 4: Core Stats ─────────────────────────────────────── */}
            {isBGMI && step === 4 && (
              <motion.div
                key="bgmi_step4"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">K/D Ratio</label>
                    <input
                      type="number"
                      placeholder="e.g. 4.82"
                      value={formData.kd_ratio}
                      onChange={e => setFormData(p => ({ ...p, kd_ratio: e.target.value }))}
                      className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Matches Played</label>
                    <input
                      type="number"
                      placeholder="e.g. 1240"
                      value={formData.matches_played}
                      onChange={e => setFormData(p => ({ ...p, matches_played: e.target.value }))}
                      className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Top 10 Rate (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 71"
                    value={formData.top_10_rate}
                    onChange={e => setFormData(p => ({ ...p, top_10_rate: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                  />
                </div>
              </motion.div>
            )}

            {/* ── BGMI STEP 5: Preferred Role ─────────────────────────────────────── */}
            {isBGMI && step === 5 && (
              <motion.div
                key="bgmi_step5"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Select your main role (up to 2)</label>
                <div className="grid grid-cols-2 gap-2">
                  {['IGL', 'Assaulter', 'Sniper', 'Support', 'Entry Fragger', 'Scout'].map(role => {
                    const active = formData.preferred_roles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData(p => {
                          if (active) return { ...p, preferred_roles: p.preferred_roles.filter(r => r !== role) };
                          if (p.preferred_roles.length < 2) return { ...p, preferred_roles: [...p.preferred_roles, role] };
                          return p;
                        })}
                        className="py-3 px-3 rounded-xl text-sm font-black text-center transition-all flex items-center justify-center gap-2"
                        style={
                          active
                            ? { background: accentMuted, color: accent, border: `1.5px solid ${accentBorder}` }
                            : { background: '#F3F2EE', color: '#6B6B6B', border: '1.5px solid #E8E6E0' }
                        }
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── BGMI STEP 6: Playstyle ─────────────────────────────────────── */}
            {isBGMI && step === 6 && (
              <motion.div
                key="bgmi_step6"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Select all that apply</label>
                <div className="flex flex-wrap gap-2">
                  {['Aggressive', 'Competitive', 'Team Player', 'Tournament Ready', 'Mic ON'].map(style => {
                    const active = formData.playstyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFormData(p => {
                          if (active) return { ...p, playstyles: p.playstyles.filter(s => s !== style) };
                          return { ...p, playstyles: [...p.playstyles, style] };
                        })}
                        className="py-2.5 px-4 rounded-xl text-xs font-black text-center transition-all flex items-center justify-center gap-2"
                        style={
                          active
                            ? { background: accentMuted, color: accent, border: `1.5px solid ${accentBorder}` }
                            : { background: '#F3F2EE', color: '#6B6B6B', border: '1.5px solid #E8E6E0' }
                        }
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── BGMI STEP 7: Looking For ─────────────────────────────────────── */}
            {isBGMI && step === 7 && (
              <motion.div
                key="bgmi_step7"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Select what you are looking for</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Rank Push', 'Tournament Team', 'Scrims', 'Classic', 'Esports Org', 'Casual'].map(option => {
                    const active = formData.looking_for === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, looking_for: option }))}
                        className="py-3 px-3 rounded-xl text-sm font-black text-center transition-all flex items-center justify-center gap-2"
                        style={
                          active
                            ? { background: accentMuted, color: accent, border: `1.5px solid ${accentBorder}` }
                            : { background: '#F3F2EE', color: '#6B6B6B', border: '1.5px solid #E8E6E0' }
                        }
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── VALORANT STEP 2: Basic Info ─────────────────────────────────────── */}
            {isValorant && step === 2 && (
              <motion.div
                key="val_step2"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">In-Game Name (IGN) <span className="text-[#FF4655]">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter your IGN"
                    value={formData.username}
                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Tagline (Optional)</label>
                  <input
                    type="text"
                    placeholder="E.g. Comeback is my habit."
                    value={formData.tagline}
                    onChange={e => setFormData(p => ({ ...p, tagline: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Profile Picture</label>
                  <label
                    className="relative w-full h-24 rounded-2xl overflow-hidden cursor-pointer flex flex-col items-center justify-center border border-dashed border-[#E8E6E0] bg-[#F3F2EE] transition hover:opacity-80"
                  >
                    {formData.photo_url
                      ? <img src={formData.photo_url} alt="photo" className="absolute inset-0 w-full h-full object-cover" />
                      : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload size={22} style={{ color: '#FF4655' }} />
                          <span className="text-[12px] text-[#1A1A1A] font-bold">Upload Image</span>
                          <span className="text-[10px] text-[#888888]">JPG, PNG (Max 5MB)</span>
                        </div>
                      )
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </motion.div>
            )}

            {/* ── VALORANT STEP 3: Current Rank ─────────────────────────────────────── */}
            {isValorant && step === 3 && (
              <motion.div
                key="val_step3"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Current Rank <span className="text-[#FF4655]">*</span></label>
                  <div className="relative">
<select
                    value={formData.current_rank}
                    onChange={e => setFormData(p => ({ ...p, current_rank: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition appearance-none"
                  >
                    <option value="" disabled>Select Current Rank</option>
                    {['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
<ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" size={16} />
</div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Peak Rank <span className="text-[#FF4655]">*</span></label>
                  <div className="relative">
<select
                    value={formData.highest_rank}
                    onChange={e => setFormData(p => ({ ...p, highest_rank: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition appearance-none"
                  >
                    <option value="" disabled>Select Peak Rank</option>
                    {['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
<ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" size={16} />
</div>
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Current RR (Optional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="e.g. 68"
                      value={formData.current_rr}
                      onChange={e => setFormData(p => ({ ...p, current_rr: e.target.value }))}
                      className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                    />
                    <span className="text-xs font-black text-[#6B6B6B]">/100</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── VALORANT STEP 4: Core Stats ─────────────────────────────────────── */}
            {isValorant && step === 4 && (
              <motion.div
                key="val_step4"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">K/D Ratio <span className="text-[#FF4655]">*</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 1.68"
                      value={formData.kd_ratio}
                      onChange={e => setFormData(p => ({ ...p, kd_ratio: e.target.value }))}
                      className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Win Rate (%) <span className="text-[#FF4655]">*</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 52"
                      value={formData.win_rate}
                      onChange={e => setFormData(p => ({ ...p, win_rate: e.target.value }))}
                      className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">ACS <span className="text-[#FF4655]">*</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 238"
                      value={formData.acs}
                      onChange={e => setFormData(p => ({ ...p, acs: e.target.value }))}
                      className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── VALORANT STEP 5: Agent Pool ─────────────────────────────────────── */}
            {isValorant && step === 5 && (
              <motion.div
                key="val_step5"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Select Top 3 Agents</label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map(idx => (
                    <div className="relative flex-1" key={idx}>
                      <select
                        value={formData.agents[idx]}
                        onChange={e => {
                          const newAgents = [...formData.agents];
                          newAgents[idx] = e.target.value;
                          setFormData(p => ({ ...p, agents: newAgents }));
                        }}
                        className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-2 py-3 text-[#1A1A1A] text-xs font-bold focus:outline-none transition appearance-none pr-8"
                      >

                      <option value="">Agent {idx + 1}</option>
                      {['Jett', 'Reyna', 'Raze', 'Phoenix', 'Yoru', 'Neon', 'Iso', 'Sova', 'Breach', 'Skye', 'KAY/O', 'Fade', 'Gekko', 'Omen', 'Brimstone', 'Astra', 'Viper', 'Harbor', 'Clove', 'Killjoy', 'Cypher', 'Sage', 'Chamber', 'Deadlock'].map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
<ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" size={16} />
</div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── VALORANT STEP 6: Playstyle ─────────────────────────────────────── */}
            {isValorant && step === 6 && (
              <motion.div
                key="val_step6"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Select up to 3</label>
                  <span className="text-[10px] font-bold text-[#FF4655]">{formData.val_playstyle.length}/3</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Aggressive', 'Entry Fragger', 'Clutch Player', 'Team Player', 'Comms On', 'Supportive'].map(style => {
                    const active = formData.val_playstyle.includes(style);
                    const disabled = !active && formData.val_playstyle.length >= 3;
                    return (
                      <button
                        key={style}
                        type="button"
                        disabled={disabled}
                        onClick={() => setFormData(p => {
                          if (active) return { ...p, val_playstyle: p.val_playstyle.filter(s => s !== style) };
                          if (p.val_playstyle.length >= 3) return p;
                          return { ...p, val_playstyle: [...p.val_playstyle, style] };
                        })}
                        className={clsx("py-2.5 px-4 rounded-xl text-xs font-black text-center transition-all flex items-center justify-center gap-2", disabled && "opacity-50 cursor-not-allowed")}
                        style={
                          active
                            ? { background: 'rgba(255, 70, 85, 0.1)', color: '#FF4655', border: `1.5px solid rgba(255, 70, 85, 0.4)` }
                            : { background: '#F3F2EE', color: '#6B6B6B', border: '1.5px solid #E8E6E0' }
                        }
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── VALORANT STEP 7: Looking For ─────────────────────────────────────── */}
            {isValorant && step === 7 && (
              <motion.div
                key="val_step7"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Select up to 3</label>
                  <span className="text-[10px] font-bold text-[#FF4655]">{formData.val_looking_for.length}/3</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Competitive', 'Ranked Duo/Trio', 'Scrims', 'Tournament Team', 'Esports Org', 'Casual'].map(option => {
                    const active = formData.val_looking_for.includes(option);
                    const disabled = !active && formData.val_looking_for.length >= 3;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={disabled}
                        onClick={() => setFormData(p => {
                          if (active) return { ...p, val_looking_for: p.val_looking_for.filter(s => s !== option) };
                          if (p.val_looking_for.length >= 3) return p;
                          return { ...p, val_looking_for: [...p.val_looking_for, option] };
                        })}
                        className={clsx("py-3 px-3 rounded-xl text-[11px] font-black text-center transition-all flex items-center justify-center gap-2", disabled && "opacity-50 cursor-not-allowed")}
                        style={
                          active
                            ? { background: 'rgba(255, 70, 85, 0.1)', color: '#FF4655', border: `1.5px solid rgba(255, 70, 85, 0.4)` }
                            : { background: '#F3F2EE', color: '#6B6B6B', border: '1.5px solid #E8E6E0' }
                        }
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── FREE FIRE STEP 2: Basic Info ─────────────────────────────────────── */}
            {isFreeFire && step === 2 && (
              <motion.div
                key="ff_step2"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">In-Game Name (IGN) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter your IGN"
                    value={formData.username}
                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm font-bold focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Tagline (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. I don't chase, I eliminate."
                    value={formData.tagline}
                    onChange={e => setFormData(p => ({ ...p, tagline: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm font-bold focus:outline-none transition"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Profile Picture</label>
                  <label
                    className="relative w-full h-24 rounded-2xl overflow-hidden cursor-pointer flex flex-col items-center justify-center border border-dashed border-[#E8E6E0] bg-[#F3F2EE] transition hover:opacity-80"
                  >
                    {formData.photo_url
                      ? <img src={formData.photo_url} alt="photo" className="absolute inset-0 w-full h-full object-cover" />
                      : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload size={22} style={{ color: '#D97706' }} />
                          <span className="text-[12px] text-[#1A1A1A] font-bold">Upload Image</span>
                          <span className="text-[10px] text-[#888888]">JPG, PNG (Max 5MB)</span>
                        </div>
                      )
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </motion.div>
            )}

            {/* ── FREE FIRE STEP 3: Current Rank ─────────────────────────────────────── */}
            {isFreeFire && step === 3 && (
              <motion.div
                key="ff_step3"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div>
                  <label className="block text-xs font-bold text-[#D1D5DB] mb-2">Current Rank <span className="text-red-500">*</span></label>
                  <div className="relative">
<select
                    value={formData.current_rank}
                    onChange={e => setFormData(p => ({ ...p, current_rank: e.target.value }))}
                    className="w-full bg-[#111318] border border-[#2B3240] rounded-xl px-4 py-3 text-[#FFFFFF] text-sm focus:outline-none focus:border-[#FBBF24] transition appearance-none"
                  >
                    <option value="" disabled>Select Current Rank</option>
                    {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Heroic', 'Master', 'Grandmaster'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
<ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" size={16} />
</div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#D1D5DB] mb-2">Rank Score (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 9856"
                    value={formData.ff_rank_score}
                    onChange={e => setFormData(p => ({ ...p, ff_rank_score: e.target.value }))}
                    className="w-full bg-[#111318] border border-[#2B3240] rounded-xl px-4 py-3 text-[#FFFFFF] text-sm focus:outline-none focus:border-[#FBBF24] transition"
                  />
                </div>
              </motion.div>
            )}

            {/* ── FREE FIRE STEP 4: Core Stats ─────────────────────────────────────── */}
            {isFreeFire && step === 4 && (
              <motion.div
                key="ff_step4"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#D1D5DB] mb-2">K/D Ratio <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 3.45"
                      value={formData.kd_ratio}
                      onChange={e => setFormData(p => ({ ...p, kd_ratio: e.target.value }))}
                      className="w-full bg-[#111318] border border-[#2B3240] rounded-xl px-4 py-3 text-[#FFFFFF] text-sm focus:outline-none focus:border-[#FBBF24] transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#D1D5DB] mb-2">Matches Played <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 1250"
                      value={formData.matches_played}
                      onChange={e => setFormData(p => ({ ...p, matches_played: e.target.value }))}
                      className="w-full bg-[#111318] border border-[#2B3240] rounded-xl px-4 py-3 text-[#FFFFFF] text-sm focus:outline-none focus:border-[#FBBF24] transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#D1D5DB] mb-2">Booyah Rate (%) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. 28.6"
                      value={formData.booyah_rate}
                      onChange={e => setFormData(p => ({ ...p, booyah_rate: e.target.value }))}
                      className="w-full bg-[#111318] border border-[#2B3240] rounded-xl px-4 py-3 text-[#FFFFFF] text-sm focus:outline-none focus:border-[#FBBF24] transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── FREE FIRE STEP 5: Preferred Role ─────────────────────────────────────── */}
            {isFreeFire && step === 5 && (
              <motion.div
                key="ff_step5"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Select main roles (up to 2)</label>
                  <span className="text-xs font-black" style={{ color: '#D97706' }}>{formData.ff_preferred_roles.length}/2</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Rusher', 'Sniper', 'Support', 'Bomber', 'Igl', 'Flanker'].map(role => {
                    const active = formData.ff_preferred_roles.includes(role);
                    const disabled = !active && formData.ff_preferred_roles.length >= 2;
                    return (
                      <button
                        key={role}
                        type="button"
                        disabled={disabled}
                        onClick={() => setFormData(p => {
                          if (active) return { ...p, ff_preferred_roles: p.ff_preferred_roles.filter(r => r !== role) };
                          if (p.ff_preferred_roles.length >= 2) return p;
                          return { ...p, ff_preferred_roles: [...p.ff_preferred_roles, role] };
                        })}
                        className="py-3 px-3 rounded-xl text-sm font-black text-center transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        style={
                          active
                            ? { background: 'rgba(217, 119, 6, 0.15)', color: '#D97706', border: '1.5px solid #D97706' }
                            : { background: '#F3F2EE', color: '#1A1A1A', border: '1.5px solid #E8E6E0' }
                        }
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── FREE FIRE STEP 6: Playstyle ─────────────────────────────────────── */}
            {isFreeFire && step === 6 && (
              <motion.div
                key="ff_step6"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Select Playstyles</label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Aggressive', 'Competitive', 'Team Player', 'Tournament Ready', 'Mic On'].map(style => {
                    const active = formData.ff_playstyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFormData(p => {
                          if (active) return { ...p, ff_playstyles: p.ff_playstyles.filter(s => s !== style) };
                          return { ...p, ff_playstyles: [...p.ff_playstyles, style] };
                        })}
                        className="py-2.5 px-3 rounded-xl text-xs font-black text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
                        style={
                          active
                            ? { background: 'rgba(217, 119, 6, 0.15)', color: '#D97706', border: '1.5px solid #D97706' }
                            : { background: '#F3F2EE', color: '#1A1A1A', border: '1.5px solid #E8E6E0' }
                        }
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── FREE FIRE STEP 7: Looking For ─────────────────────────────────────── */}
            {isFreeFire && step === 7 && (
              <motion.div
                key="ff_step7"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Looking For</label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Rank Push', 'Clash Squad', 'Tournament', 'Guild', 'Casual'].map(option => {
                    const active = formData.ff_looking_for.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData(p => {
                          if (active) return { ...p, ff_looking_for: p.ff_looking_for.filter(s => s !== option) };
                          return { ...p, ff_looking_for: [...p.ff_looking_for, option] };
                        })}
                        className="py-3 px-3 rounded-xl text-xs font-black text-center transition-all flex items-center justify-center gap-2 cursor-pointer"
                        style={
                          active
                            ? { background: 'rgba(217, 119, 6, 0.15)', color: '#D97706', border: '1.5px solid #D97706' }
                            : { background: '#F3F2EE', color: '#1A1A1A', border: '1.5px solid #E8E6E0' }
                        }
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── CHESS STEP 2: Basic Info ─────────────────────────────────────── */}
            {isChess && step === 2 && (
              <motion.div
                key="chess_step2"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-2">In-Game Name (IGN) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter your in-game name"
                    value={formData.username}
                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#000000] text-sm focus:outline-none focus:border-[#CD8C38] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-2">Tagline (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Every move has a purpose."
                    value={formData.tagline}
                    onChange={e => setFormData(p => ({ ...p, tagline: e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#000000] text-sm focus:outline-none focus:border-[#CD8C38] transition"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="block text-xs font-bold text-[#1F2937] mb-2">Profile Picture</label>
                  <label
                    className="relative w-full h-20 rounded-2xl overflow-hidden cursor-pointer flex flex-col items-center justify-center border border-dashed border-[#D1D5DB] bg-[#FAFAFA] transition hover:border-[#CD8C38]"
                  >
                    {formData.photo_url
                      ? <img src={formData.photo_url} alt="photo" className="absolute inset-0 w-full h-full object-cover" />
                      : (
                        <div className="flex items-center gap-2 text-[#4B5563]">
                          <Upload size={18} />
                          <span className="text-sm font-bold">Upload Image</span>
                        </div>
                      )
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </motion.div>
            )}

            {/* ── CHESS STEP 3: Current Rating ─────────────────────────────────────── */}
            {isChess && step === 3 && (
              <motion.div
                key="chess_step3"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-2">Play Format <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 bg-[#FAFAFA] p-1 border border-[#E5E7EB] rounded-xl">
                    {['Rapid', 'Blitz', 'Bullet', 'Classic'].map(format => {
                      const active = formData.chess_play_format === format;
                      return (
                        <button
                          key={format}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, chess_play_format: format }))}
                          className={clsx(
                            "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                            active ? "bg-[#FFFFFF] text-[#CD8C38] shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-[#CD8C38]" : "text-[#4B5563] hover:text-[#000000] border border-transparent"
                          )}
                        >
                          {format}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-2">Current Rating <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    placeholder="e.g. 1824"
                    value={formData.chess_current_rating}
                    onChange={e => setFormData(p => ({ ...p, chess_current_rating: e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#000000] text-sm focus:outline-none focus:border-[#CD8C38] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-2">Highest Rating Achieved <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    placeholder="e.g. 1943"
                    value={formData.chess_highest_rating}
                    onChange={e => setFormData(p => ({ ...p, chess_highest_rating: e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#000000] text-sm focus:outline-none focus:border-[#CD8C38] transition"
                  />
                </div>
              </motion.div>
            )}

            {/* ── CHESS STEP 4: Core Stats ─────────────────────────────────────── */}
            {isChess && step === 4 && (
              <motion.div
                key="chess_step4"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#1F2937] mb-2">Games Played <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 842"
                      value={formData.chess_games_played}
                      onChange={e => setFormData(p => ({ ...p, chess_games_played: e.target.value }))}
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#000000] text-sm focus:outline-none focus:border-[#CD8C38] transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#1F2937] mb-2">Win Rate (%) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 58"
                      value={formData.chess_win_rate}
                      onChange={e => setFormData(p => ({ ...p, chess_win_rate: e.target.value }))}
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#000000] text-sm focus:outline-none focus:border-[#CD8C38] transition"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#1F2937] mb-2">Good Game %</label>
                    <input
                      type="text"
                      placeholder="e.g. 92"
                      value={formData.chess_good_game}
                      onChange={e => setFormData(p => ({ ...p, chess_good_game: e.target.value }))}
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#000000] text-sm focus:outline-none focus:border-[#CD8C38] transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── CHESS STEP 5: Play Style ─────────────────────────────────────── */}
            {isChess && step === 5 && (
              <motion.div
                key="chess_step5"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#1F2937]">Select up to 3</label>
                  <span className="text-xs font-bold text-[#CD8C38]">{formData.chess_playstyles.length}/3</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Aggressive', 'Tactical', 'Positional', 'Calculative', 'Endgame Focused', 'Balanced'].map(style => {
                    const active = formData.chess_playstyles.includes(style);
                    const disabled = !active && formData.chess_playstyles.length >= 3;
                    return (
                      <button
                        key={style}
                        type="button"
                        disabled={disabled}
                        onClick={() => setFormData(p => {
                          if (active) return { ...p, chess_playstyles: p.chess_playstyles.filter(s => s !== style) };
                          if (p.chess_playstyles.length >= 3) return p;
                          return { ...p, chess_playstyles: [...p.chess_playstyles, style] };
                        })}
                        className={clsx(
                          "py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border text-left",
                          disabled ? "opacity-50 cursor-not-allowed border-[#E5E7EB] text-[#9CA3AF] bg-[#FFFFFF]" 
                          : active ? "border-[#CD8C38] text-[#CD8C38] shadow-[0_2px_8px_rgba(205,140,56,0.15)] bg-[#FFFFFF]" : "border-[#E5E7EB] text-gray-700 bg-[#FFFFFF] hover:border-[#D1D5DB]"
                        )}
                      >
                        <span className="truncate">{style}</span>
                        <div className={clsx("w-4 h-4 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-colors", active ? "bg-[#CD8C38] border-[#CD8C38]" : "border-[#D1D5DB]")}>
                          {active && <Check size={12} className="text-[#FFFFFF]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── CHESS STEP 6: Looking For ─────────────────────────────────────── */}
            {isChess && step === 6 && (
              <motion.div
                key="chess_step6"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-4 pt-2"
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#1F2937]">Select all that apply</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Practice', 'Improve', 'Tournaments', 'Casual', 'Serious Matches', 'Clubs / Teams'].map(option => {
                    const active = formData.chess_looking_for.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData(p => {
                          if (active) return { ...p, chess_looking_for: p.chess_looking_for.filter(s => s !== option) };
                          return { ...p, chess_looking_for: [...p.chess_looking_for, option] };
                        })}
                        className={clsx(
                          "py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border text-left",
                          active ? "border-[#CD8C38] text-[#CD8C38] shadow-[0_2px_8px_rgba(205,140,56,0.15)] bg-[#FFFFFF]" : "border-[#E5E7EB] text-gray-700 bg-[#FFFFFF] hover:border-[#D1D5DB]"
                        )}
                      >
                        <span className="truncate">{option}</span>
                        <div className={clsx("w-4 h-4 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-colors", active ? "bg-[#CD8C38] border-[#CD8C38]" : "border-[#D1D5DB]")}>
                          {active && <Check size={12} className="text-[#FFFFFF]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── GENERIC STEP 2: Identity ─────────────────────────────────────── */}
            {!isBGMI && !isValorant && !isFreeFire && !isChess && step === 2 && (
              <motion.div
                key="step2"
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
                          <span className="text-[9px] text-[#6B6B6B] font-black uppercase tracking-wider text-center">Photo</span>
                        </div>
                      )
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  <p className="text-[9px] text-[#888888] mt-2 font-bold">Optional — tap to upload</p>
                </div>

                {/* Game Username / Jersey Name */}
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">
                    {isEsports ? 'Game Username / ID' : 'Jersey Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEsports ? 'Viper_X#1234' : 'Arjun'}
                    value={formData.username}
                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                    style={{ focusBorderColor: accent }}
                  />
                </div>
              </motion.div>
            )}

            {/* ── GENERIC STEP 3: Details ──────────────────────────────────────── */}
            {!isBGMI && !isValorant && !isFreeFire && !isChess && step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="space-y-5 pt-2"
              >
                {/* Rank / Experience */}
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">
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
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                  />
                </div>

                {/* Role / Position */}
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">
                    {isEsports ? 'Favourite Role' : 'Playing Position'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEsports ? 'IGL / Assaulter' : 'Forward / Bowler'}
                    value={formData.role_or_position}
                    onChange={e => setFormData(p => ({ ...p, role_or_position: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition"
                  />
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Availability</label>
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
                              : { background: '#F3F2EE', color: '#6B6B6B', border: '1.5px solid #E8E6E0' }
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
                  <label className="block text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Short Bio (optional)</label>
                  <textarea
                    maxLength={100}
                    rows={2}
                    placeholder={isEsports ? 'IGL main, 3000+ matches...' : 'Playing since age 10...'}
                    value={formData.bio}
                    onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                    className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl px-4 py-3 text-[#1A1A1A] text-sm focus:outline-none transition resize-none custom-scrollbar"
                  />
                  <p className="text-[9px] text-[#888888] mt-1 font-bold text-right">{formData.bio.length}/100</p>
                </div>
              </motion.div>
            )}

            {/* ── GENERIC STEP 4: Skills ───────────────────────────────────────── */}
            {!isBGMI && !isValorant && !isFreeFire && !isChess && step === 4 && (
              <motion.div
                key="step4"
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

                <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">
                  Rate Your Skills
                </p>

                {/* Tap-to-select skill levels — 3 game-specific skills */}
                {activeSkillLabels.map((skillLabel, idx) => {
                  const currentVal = formData.skills[skillKeys[idx]];
                  return (
                    <div key={skillLabel} className="space-y-2">
                      <p className="text-xs font-black text-[#4A4A4A]">{skillLabel}</p>
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
                                      background: '#F3F2EE',
                                      color: '#6B6B6B',
                                      border: '1.5px solid #E8E6E0',
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
        <div className="px-6 py-4 border-t border-[#FFFFFF]/8 flex gap-3 shrink-0">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 py-3 px-5 rounded-xl bg-[#F3F2EE] border border-[#E8E6E0] text-[#4A4A4A] text-xs font-black uppercase tracking-widest hover:bg-[#F3F2EE] transition"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canGoNext()}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
              style={
                canGoNext()
                  ? { background: accent, color: '#000', boxShadow: `0 4px 20px ${accentMuted}` }
                  : { background: '#F3F2EE', color: '#A0A0A0', cursor: 'not-allowed' }
              }
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canGoNext()}
              className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
              style={
                canGoNext()
                  ? { background: accent, color: '#000', boxShadow: `0 4px 20px ${accentMuted}` }
                  : { background: '#F3F2EE', color: '#A0A0A0', cursor: 'not-allowed' }
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
