import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UNIVERSITIES = [
  'Rishihood University',
  'OP Jindal Global University',
  'Delhi University',
  'IIT Delhi',
  'Jamia Millia Islamia',
  'Other',
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', university: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.email || !form.password) { setError('Please fill in all required fields.'); return; }
    if (!isLogin && !form.name.trim()) { setError('Please enter your name.'); return; }
    if (!isLogin && !form.university) { setError('Please select your university.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    // Simulate network delay for UX polish
    await new Promise(r => setTimeout(r, 800));

    // Build user object — in a real app this comes from the backend JWT response
    const userData = {
      name: isLogin ? (form.email.split('@')[0].replace('.', ' ')) : form.name.trim(),
      email: form.email,
      university: isLogin ? 'Rishihood University' : form.university,
      bio: '',
      profilePic: '',
      instagram: '',
      snapchat: '',
      token: 'demo_token_' + Date.now(),
    };

    login(userData);   // saves to localStorage + sets context state
    setLoading(false);
    navigate('/feed');
  };

  const inputClass = 'w-full bg-dark/60 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#070710' }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-700/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md glass border border-gray-800/60 p-8 rounded-3xl z-10 shadow-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 mb-1">
            CollageAdda
          </h1>
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white mt-4">
                {isLogin ? 'Welcome back 👋' : 'Join your campus 🎓'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {isLogin ? 'Sign in to access your university feed.' : 'Create an account to connect with your peers.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4 text-center"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleAuth} className="space-y-4">

          {/* Name — signup only */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <label className="text-xs font-medium text-gray-400 flex items-center space-x-1.5">
                  <User size={12} />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Lakshay Yadav"
                  value={form.name}
                  onChange={update('name')}
                  className={inputClass}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* University — signup only */}
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <label className="text-xs font-medium text-gray-400 flex items-center space-x-1.5">
                  <GraduationCap size={12} />
                  <span>University</span>
                </label>
                <select
                  value={form.university}
                  onChange={update('university')}
                  className={inputClass + ' appearance-none cursor-pointer'}
                >
                  <option value="">Select your university...</option>
                  {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 flex items-center space-x-1.5">
              <Mail size={12} />
              <span>Email address</span>
            </label>
            <input
              type="email"
              placeholder="name@university.edu"
              value={form.email}
              onChange={update('email')}
              required
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 flex items-center space-x-1.5">
              <Lock size={12} />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={update('password')}
                required
                className={inputClass + ' pr-11'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Forgot password — login only */}
          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => alert('Password reset coming soon!')}
                className="text-xs text-gray-500 hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/25 transition-all mt-2 disabled:opacity-60"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(v => !v); setError(''); }}
              className="text-primary hover:text-indigo-400 font-semibold transition-colors"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
