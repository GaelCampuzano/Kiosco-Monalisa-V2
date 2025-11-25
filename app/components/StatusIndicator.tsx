// app/components/StatusIndicator.tsx
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

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
    <div className={`absolute top-8 right-8 z-30 flex items-center gap-3 px-4 py-2 rounded-lg backdrop-blur-md border transition-all duration-500 ${
      isOffline 
        ? 'bg-red-900/60 border-red-500/30 text-red-100 shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
        : 'bg-green-900/30 border-green-500/20 text-green-100/80 hover:bg-green-900/50'
    }`}>
      {isOffline ? <WifiOff className="w-5 h-5 animate-pulse" /> : <Wifi className="w-4 h-4" />}
      
      <div className="flex flex-col">
        <span className={`text-xs font-bold tracking-widest uppercase ${isOffline ? 'text-red-200' : 'text-green-200'}`}>
          {isOffline ? text.offline : text.online}
        </span>
        {isOffline && (
          <span className="text-[10px] font-light opacity-90 leading-tight max-w-[150px] mt-0.5 text-red-100">
            {text.offlineMsg}
          </span>
        )}
      </div>
    </div>
  );
}