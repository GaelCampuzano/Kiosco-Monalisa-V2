import { useEffect, useRef } from 'react';

export function useWakeLock() {
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      // Only request WakeLock if the API is available
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
        return;
      }
      
      // Check if page is visible
      if (document.visibilityState !== 'visible') {
        return;
      }
      
      try {
        // Release existing lock if any
        if (wakeLock.current) {
          await wakeLock.current.release();
          wakeLock.current = null;
        }
        
        wakeLock.current = await navigator.wakeLock.request('screen');
      } catch (err: any) {
        // Ignore common errors (not allowed, not supported, etc.)
        if (err.name !== 'NotAllowedError' && err.name !== 'NotSupportedError') {
          console.warn('Wake Lock error:', err);
        }
      }
    };
    
    // Request on mount if visible
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      requestWakeLock();
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      } else {
        // Release when hidden
        if (wakeLock.current) {
          wakeLock.current.release().catch(() => {});
          wakeLock.current = null;
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (wakeLock.current) {
        wakeLock.current.release().catch(() => {});
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
