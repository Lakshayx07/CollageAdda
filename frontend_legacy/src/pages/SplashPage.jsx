import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] sm:top-[-20%] left-[-10%] sm:left-[-20%] w-72 sm:w-96 h-72 sm:h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse"></div>
      <div className="absolute bottom-[-10%] sm:bottom-[-20%] right-[-10%] sm:right-[-20%] w-72 sm:w-96 h-72 sm:h-96 bg-indigo-900/40 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse delay-700"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center px-4"
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-600 mb-6 drop-shadow-sm"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          CollageAdda
        </motion.h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto mb-10 font-medium">
          Your Campus in Your Pocket.<br/> Connect, Collaborate, and Vibe with your university peers.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/auth')}
          className="bg-primary hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-300"
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
}
