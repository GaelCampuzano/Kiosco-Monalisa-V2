// app/components/StatusIndicator.tsx
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusIndicatorProps {
  isOffline: boolean;
  text: {
    online: string;
    offline: string;
    offlineMsg: string;
  }
}

export function StatusIndicator({ isOffline, text }: StatusIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute top-8 right-8 z-30 flex items-center gap-3 px-4 py-2.5 rounded-lg backdrop-blur-md border transition-all duration-500 ${
        isOffline 
          ? 'bg-amber-900/40 border-amber-500/30 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
          : 'bg-emerald-900/30 border-emerald-500/20 text-emerald-100/90 hover:bg-emerald-900/40'
      }`}
    >
      <AnimatePresence mode="wait">
        {isOffline ? (
          <motion.div
            key="offline"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <WifiOff className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="online"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Wifi className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex flex-col">
        <span className={`text-xs font-bold tracking-widest uppercase ${isOffline ? 'text-amber-200' : 'text-emerald-200'}`}>
          {isOffline ? text.offline : text.online}
        </span>
        <AnimatePresence>
          {isOffline && (
            <motion.span
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[10px] font-light opacity-90 leading-tight max-w-[160px] mt-1 text-amber-100/90"
            >
              {text.offlineMsg}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}