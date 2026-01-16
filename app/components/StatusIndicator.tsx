// app/components/StatusIndicator.tsx
import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { TranslationType } from '@/lib/translations';

interface StatusIndicatorProps {
  isOffline: boolean;
  isSyncing?: boolean;
  pendingCount?: number;
  text: TranslationType;
}

export function StatusIndicator({
  isOffline,
  isSyncing,
  pendingCount = 0,
  text,
}: StatusIndicatorProps) {
  // Determinar estado: Sincronizando > Offline > Online
  const state = isSyncing ? 'syncing' : isOffline ? 'offline' : 'online';

  const styles = {
    syncing:
      'bg-blue-900/40 border-blue-500/30 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.2)]',
    offline:
      'bg-amber-900/40 border-amber-500/30 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    online: 'bg-emerald-900/30 border-emerald-500/20 text-emerald-100/90 hover:bg-emerald-900/40',
  };

  const textColors = {
    syncing: 'text-blue-200',
    offline: 'text-amber-200',
    online: 'text-emerald-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute top-4 right-4 sm:top-8 sm:right-8 z-30 flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg backdrop-blur-md border transition-all duration-500 ${styles[state]}`}
    >
      <AnimatePresence mode="wait">
        {state === 'syncing' ? (
          <motion.div
            key="syncing"
            initial={{ scale: 0.8, rotate: 0 }}
            animate={{ scale: 1, rotate: 180 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
        ) : state === 'offline' ? (
          <motion.div
            key="offline"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <WifiOff className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="online"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col">
        <span
          className={`text-[10px] sm:text-xs font-bold tracking-widest uppercase ${textColors[state]}`}
        >
          {state === 'syncing' ? 'Syncing...' : state === 'offline' ? text.offline : text.online}
        </span>

        <AnimatePresence>
          {(isOffline || pendingCount > 0) && (
            <motion.span
              key="status-msg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[9px] sm:text-[10px] font-light opacity-90 leading-tight max-w-[120px] sm:max-w-[160px] mt-0.5 sm:mt-1 opacity-90"
            >
              {isSyncing
                ? `${pendingCount} items remaining`
                : isOffline
                  ? pendingCount > 0
                    ? `${text.offlineMsg} (${pendingCount})`
                    : text.offlineMsg
                  : text.online}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
