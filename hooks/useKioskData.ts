'use client';

import { useState, useEffect, useCallback } from 'react';
import { get, set } from 'idb-keyval';
import { getActiveWaiters, Waiter } from '@/app/actions/waiters';
import { getTipPercentages } from '@/app/actions/settings';

const WAITERS_CACHE_KEY = 'cached_waiters';
const SETTINGS_CACHE_KEY = 'cached_settings';

/**
 * Hook para gestionar datos críticos del Kiosco (meseros y porcentajes)
 * con fallback automático a la caché local si falla la red.
 */
export function useKioskData() {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [percentages, setPercentages] = useState<number[]>([20, 23, 25]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);

    try {
      // 1. Intentar cargar de la caché primero para una UI instantánea
      const cachedWaiters = await get<Waiter[]>(WAITERS_CACHE_KEY);
      const cachedPercentages = await get<number[]>(SETTINGS_CACHE_KEY);

      if (cachedWaiters) setWaiters(cachedWaiters);
      if (cachedPercentages) setPercentages(cachedPercentages);

      // 2. Intentar actualizar desde el servidor si estamos online
      if (navigator.onLine) {
        try {
          const [freshWaiters, freshPercentages] = await Promise.all([
            getActiveWaiters(),
            getTipPercentages(),
          ]);

          if (freshWaiters && freshWaiters.length > 0) {
            setWaiters(freshWaiters);
            await set(WAITERS_CACHE_KEY, freshWaiters);
          }

          if (freshPercentages && freshPercentages.length > 0) {
            setPercentages(freshPercentages);
            await set(SETTINGS_CACHE_KEY, freshPercentages);
          }
        } catch (serverError) {
          console.warn('Fallo fetch de servidor, usando caché:', serverError);
        }
      }
    } catch (error) {
      console.error('Error general en useKioskData:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();

    // Actualizar cuando vuelva la conexión
    window.addEventListener('online', fetchAllData);
    return () => window.removeEventListener('online', fetchAllData);
  }, [fetchAllData]);

  return {
    waiters,
    percentages,
    isLoading,
    refresh: fetchAllData,
  };
}
