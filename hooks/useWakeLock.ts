import { useEffect, useRef } from 'react';

export function useWakeLock() {
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      // Solo solicitar WakeLock si la API está disponible
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
        return;
      }

      // Verificar si la página es visible
      if (document.visibilityState !== 'visible') {
        return;
      }

      try {
        // Liberar bloqueo existente si lo hay
        if (wakeLock.current) {
          await wakeLock.current.release();
          wakeLock.current = null;
        }

        wakeLock.current = await navigator.wakeLock.request('screen');
      } catch (err: any) {
        // Ignorar errores comunes (no permitido, no soportado, etc.)
        if (err.name !== 'NotAllowedError' && err.name !== 'NotSupportedError') {
          console.warn('Error Wake Lock:', err);
        }
      }
    };

    // Solicitar al montar si es visible
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      requestWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      } else {
        // Liberar cuando se oculta
        if (wakeLock.current) {
          wakeLock.current.release().catch(() => { });
          wakeLock.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLock.current) {
        wakeLock.current.release().catch(() => { });
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
