'use client';

import { useState, useEffect, useCallback } from 'react';
import { get, set } from 'idb-keyval';
import { getActiveWaiters, Waiter } from '@/app/actions/waiters';
import { getTipPercentages } from '@/app/actions/settings';

// Claves para el almacenamiento local persistente (IndexedDB)
const WAITERS_CACHE_KEY = 'cached_waiters';
const SETTINGS_CACHE_KEY = 'cached_settings';

/**
 * Hook personalizado para gestionar los datos críticos del Kiosco (meseros y porcentajes).
 * Implementa una estrategia de "Stale-While-Revalidate":
 * 1. Muestra datos cacheados inmediatamente para una respuesta visual instantánea.
 * 2. Actualiza desde el servidor en segundo plano si hay conexión.
 */
export function useKioskData() {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [percentages, setPercentages] = useState<number[]>([20, 23, 25]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Carga todos los datos necesarios desde la caché y el servidor.
   */
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);

    try {
      // 1. Intentar cargar de la caché local primero (IndexedDB)
      const cachedWaiters = await get<Waiter[]>(WAITERS_CACHE_KEY);
      const cachedPercentages = await get<number[]>(SETTINGS_CACHE_KEY);

      if (cachedWaiters) setWaiters(cachedWaiters);
      if (cachedPercentages) setPercentages(cachedPercentages);

      // 2. Intentar actualizar desde el servidor si hay conectividad
      if (navigator.onLine) {
        try {
          const [freshWaiters, freshPercentages] = await Promise.all([
            getActiveWaiters(),
            getTipPercentages(),
          ]);

          // Actualizar meseros (permitir lista vacía para limpiar cachés)
          if (freshWaiters) {
            setWaiters(freshWaiters);
            await set(WAITERS_CACHE_KEY, freshWaiters);
          }

          // Actualizar porcentajes de propina configurados
          if (freshPercentages) {
            setPercentages(freshPercentages);
            await set(SETTINGS_CACHE_KEY, freshPercentages);
          }
        } catch (serverError) {
          console.warn(
            'Fallo al obtener datos del servidor, se mantienen los cacheados.',
            serverError
          );
        }
      }
    } catch (error) {
      console.error('Error crítico en el flujo de datos del Kiosco:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();

    /**
     * Re-intenta la carga cuando el dispositivo recupera la conexión a internet.
     */
    const handleOnline = () => fetchAllData();
    window.addEventListener('online', handleOnline);

    return () => window.removeEventListener('online', handleOnline);
  }, [fetchAllData]);

  return {
    waiters,
    percentages,
    isLoading,
    refresh: fetchAllData,
  };
}
