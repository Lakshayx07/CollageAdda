import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Gamepad2, Activity, Save } from 'lucide-react';
import clsx from 'clsx';

export default function PlayerCardForm({ onClose, initialCategory = 'esports' }) {
  const [category, setCategory] = useState(initialCategory); // 'esports' or 'sports'
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    game_or_sport: '',
    role_or_position: '',
    rank: '',
    experience_level: '',
    availability: '',
    bio: '',
    photo_url: '',
    skills: {
      s1: 5, s2: 5, s3: 5, s4: 5, s5: 5
    }
  });

  const isEsports = category === 'esports';

  const handleSkillChange = (key, val) => {
    setFormData(prev => ({ ...prev, skills: { ...prev.skills, [key]: val } }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Card Created Successfully! (Mock)');
    onClose();
  };

  const themeColors = isEsports ? "from-cyan-500 to-purple-600" : "from-orange-500 to-red-600";
  const bgTheme = isEsports ? "bg-cyan-500/10 border-cyan-500/30" : "bg-orange-500/10 border-orange-500/30";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="app-panel w-full max-w-2xl rounded-[1.75rem] relative overflow-hidden my-auto"
      >
        {/* Header */}
        <div className={clsx("p-6 border-b border-white/10 relative overflow-hidden")}>
          <div className={clsx("absolute inset-0 bg-gradient-to-r opacity-20", themeColors)} />
          <button type="button" onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white z-50 bg-black/50 p-2 rounded-full backdrop-blur-md cursor-pointer pointer-events-auto">
            <X size={20} />
          </button>
          
          <h2 className="text-2xl font-black text-white uppercase tracking-widest relative z-10 flex items-center">
            {isEsports ? <Gamepad2 className="mr-3 text-cyan-400" /> : <Activity className="mr-3 text-orange-400" />}
            Create Player Card
          </h2>
          <p className="text-white/60 text-sm mt-2 relative z-10 font-medium">Design your unique collectible player profile.</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Category Toggle */}
          <div className="flex space-x-2 bg-black/50 p-1 rounded-xl border border-white/5">
            <button type="button" onClick={() => setCategory('esports')} className={clsx("flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition", isEsports ? "bg-white/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]" : "text-white/40 hover:text-white")}>🎮 Esports</button>
            <button type="button" onClick={() => setCategory('sports')} className={clsx("flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition", !isEsports ? "bg-white/10 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]" : "text-white/40 hover:text-white")}>⚽ Sports</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Photo Upload */}
              <label className={clsx("w-32 h-32 rounded-full mx-auto border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition relative overflow-hidden", bgTheme)}>
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload size={24} className={isEsports ? "text-cyan-400 mb-2" : "text-orange-400 mb-2"} />
                    <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest text-center px-2">Upload<br/>Photo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Full Name</label>
                <input required type="text" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{isEsports ? 'Game Username / ID' : 'Jersey Name'}</label>
                <input required type="text" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition" placeholder={isEsports ? "Viper_X#123" : "Arjun"} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{isEsports ? 'Select Game' : 'Select Sport'}</label>
                <select required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition appearance-none" value={formData.game_or_sport} onChange={e => setFormData({...formData, game_or_sport: e.target.value})}>
                  <option value="">Select...</option>
                  {isEsports 
                    ? ['BGMI', 'Valorant', 'Free Fire', 'Chess', 'FIFA'].map(g => <option key={g} value={g}>{g}</option>)
                    : ['Cricket', 'Football', 'Badminton', 'Basketball', 'Tennis'].map(s => <option key={s} value={s}>{s}</option>)
                  }
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{isEsports ? 'Current Rank' : 'Experience Level'}</label>
                <input required type="text" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition" placeholder={isEsports ? "Diamond 3" : "Inter-College"} value={isEsports ? formData.rank : formData.experience_level} onChange={e => isEsports ? setFormData({...formData, rank: e.target.value}) : setFormData({...formData, experience_level: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{isEsports ? 'Favourite Role' : 'Playing Position'}</label>
                <input required type="text" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition" placeholder={isEsports ? "IGL / Assaulter" : "Forward / Bowler"} value={formData.role_or_position} onChange={e => setFormData({...formData, role_or_position: e.target.value})} />
              </div>
            </div>

            {/* Right Column (Skills) */}
            <div className="space-y-4">
              <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4 border-b border-white/10 pb-2">Rate Your Skills (1-10)</h3>
              
              {[
                { key: 's1', label: isEsports ? 'Accuracy 🎯' : 'Speed 🏃' },
                { key: 's2', label: isEsports ? 'Game Sense 🧠' : 'Stamina ⚡' },
                { key: 's3', label: isEsports ? 'Clutch 💪' : 'Technique 🎯' },
                { key: 's4', label: 'Teamwork 🤝' },
                { key: 's5', label: isEsports ? 'Comms 📢' : 'Leadership 👑' }
              ].map((skill) => (
                <div key={skill.key} className="bg-black/50 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{skill.label}</span>
                    <span className={clsx("text-xs font-black", isEsports ? "text-cyan-400" : "text-orange-400")}>{formData.skills[skill.key]}</span>
                  </div>
                  <input type="range" min="1" max="10" value={formData.skills[skill.key]} onChange={(e) => handleSkillChange(skill.key, parseInt(e.target.value))} className="w-full accent-white" />
                </div>
              ))}

              <div className="pt-2">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Availability</label>
                <select className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition appearance-none" value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})}>
                  <option value="Both">Flexible / Both</option>
                  <option value="Tournaments">Tournaments Only</option>
                  <option value="Casual">Casual / Weekends</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Short Bio</label>
                <textarea maxLength="100" rows="2" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition resize-none custom-scrollbar" placeholder="IGL main, 3000+ matches..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex space-x-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl border border-white/10 text-white/70 font-black uppercase tracking-widest text-xs hover:bg-white/5 transition">Cancel</button>
            <button type="submit" className={clsx("flex-1 py-4 rounded-xl text-black font-black uppercase tracking-widest text-xs shadow-lg transition flex items-center justify-center bg-gradient-to-r", themeColors)}>
              <Save size={16} className="mr-2" /> Generate Card
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
