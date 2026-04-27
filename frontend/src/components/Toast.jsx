import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, X } from 'lucide-react';

/**
 * Minimal toast system.
 * Usage: import { useToast, ToastContainer } from './Toast'
 * const { showToast } = useToast();
 * showToast('Saved!', 'success');  // or 'info' | 'error'
 */
let _setToasts = null;

export function useToast() {
  const showToast = (message, type = 'info', duration = 2500) => {
    if (!_setToasts) return;
    const id = Date.now();
    _setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      _setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };
  return { showToast };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { _setToasts = setToasts; return () => { _setToasts = null; }; }, []);

  const icons = { success: <CheckCircle size={16} className="text-green-400" />, info: <Info size={16} className="text-indigo-400" />, error: <X size={16} className="text-red-400" /> };
  const borders = { success: 'border-green-500/30', info: 'border-indigo-500/30', error: 'border-red-500/30' };

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-[9999] flex flex-col space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className={`glass border ${borders[t.type] || borders.info} rounded-xl px-4 py-3 flex items-center space-x-2 shadow-xl text-sm text-white min-w-[200px] max-w-xs pointer-events-auto`}
          >
            {icons[t.type] || icons.info}
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
