import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TipRecord } from '@/types';
import { saveTipToDb } from '@/app/actions/tips';
import { generateUUID } from '@/lib/utils';
import { get, set } from 'idb-keyval';

/**
 * Clave de almacenamiento para las propinas pendientes en IndexedDB.
 */
const OFFLINE_STORAGE_KEY = 'offlineTips';
const HISTORY_STORAGE_KEY = 'tipHistory';
const MAX_HISTORY_LENGTH = 30;

/**
 * Hook personalizado para gestionar el registro de propinas con soporte offline activo.
 * Utiliza IndexedDB para persistencia local y sincronización automática.
 */
export function useTips() {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [history, setHistory] = useState<TipRecord[]>([]);

  /**
   * Actualiza el contador de propinas pendientes de sincronizar desde IndexedDB.
   */
  const updatePendingCount = useCallback(async () => {
    try {
      const localTips = (await get<TipRecord[]>(OFFLINE_STORAGE_KEY)) || [];
      setPendingCount(localTips.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  /**
   * Sincroniza las propinas guardadas localmente hacia el servidor MySQL.
   * Se ejecuta al recuperar la conexión o al iniciar la app.
   */
  const syncOfflineTips = useCallback(async () => {
    try {
      const tipsToSync = (await get<TipRecord[]>(OFFLINE_STORAGE_KEY)) || [];

      if (tipsToSync.length === 0) {
        setPendingCount(0);
        return;
      }

      setIsSyncing(true);
      console.log(`Sincronizando ${tipsToSync.length} propinas pendientes (Offline Storage)...`);

      let syncedCount = 0;
      let failedCount = 0;

      for (const tip of tipsToSync) {
        try {
          const result = await saveTipToDb({
            waiterName: tip.waiterName,
            tableNumber: tip.tableNumber,
            tipPercentage: tip.tipPercentage,
            idempotencyKey: tip.idempotencyKey,
          });

          if (result.success) {
            syncedCount++;

            // Eliminación atómica: Re-obtenemos el estado actual para evitar condiciones de carrera
            const currentStore = (await get<TipRecord[]>(OFFLINE_STORAGE_KEY)) || [];
            const newStore = currentStore.filter((t) => t.idempotencyKey !== tip.idempotencyKey);
            await set(OFFLINE_STORAGE_KEY, newStore);
            setPendingCount(newStore.length);
          } else {
            failedCount++;
            console.error('Fallo al sincronizar registro:', tip);
          }
        } catch (error) {
          failedCount++;
          console.error('Error de red al sincronizar registro:', error);
        }
      }

      if (syncedCount > 0) {
        toast.success(`Se sincronizaron ${syncedCount} propinas guardadas anteriormente.`);
      }

      if (failedCount > 0) {
        console.warn(`${failedCount} registros permanecen offline tras fallo de sincronización.`);
      }
    } catch (error) {
      console.error('Error crítico en syncOfflineTips:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      // 1. Lógica de Migración: LocalStorage -> IndexedDB (Compatibilidad con versiones anteriores)
      try {
        const legacyTips = localStorage.getItem(OFFLINE_STORAGE_KEY);
        if (legacyTips) {
          const parsed = JSON.parse(legacyTips);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const currentIdb = (await get<TipRecord[]>(OFFLINE_STORAGE_KEY)) || [];
            const combined = [...currentIdb];
            parsed.forEach((legacyTip) => {
              if (!combined.find((t) => t.idempotencyKey === legacyTip.idempotencyKey)) {
                combined.push(legacyTip);
              }
            });
            await set(OFFLINE_STORAGE_KEY, combined);
            console.log('Migración de LocalStorage a IndexedDB completada.');
          }
          localStorage.removeItem(OFFLINE_STORAGE_KEY);
        }
      } catch (e) {
        console.error('La verificación de migración falló:', e);
      }

      // 2. Configuración del estado inicial
      await updatePendingCount();
      const localHistory = (await get<TipRecord[]>(HISTORY_STORAGE_KEY)) || [];
      setHistory(localHistory);

      const isOnline = navigator.onLine;
      setIsOffline(!isOnline);

      if (isOnline) {
        await syncOfflineTips();
      }
    };

    init();

    const handleOnline = async () => {
      setIsOffline(false);
      toast.info('Conexión restaurada. Sincronizando datos...');
      await syncOfflineTips();
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('Modo sin conexión activado. Los datos se guardarán localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineTips, updatePendingCount]);

  /**
   * Registra una nueva propina. Intenta primero vía Server Action (Online),
   * y cae a IndexedDB si falla la red.
   */
  const saveTip = async (data: Omit<TipRecord, 'id' | 'createdAt' | 'synced'>) => {
    const { waiterName, tableNumber, tipPercentage } = data;
    const idempotencyKey = generateUUID();

    const tipToSave: Omit<TipRecord, 'id' | 'synced'> = {
      tableNumber,
      waiterName,
      tipPercentage,
      createdAt: new Date().toISOString(),
      idempotencyKey,
    };

    try {
      if (!navigator.onLine) throw new Error('Offline');

      const result = await saveTipToDb({
        ...data,
        idempotencyKey,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('Registro exitoso en servidor.');
      toast.success('Propina registrada correctamente');

      // Actualizar historial local
      const entry: TipRecord = { ...tipToSave, synced: true };
      const currentHistory = (await get<TipRecord[]>(HISTORY_STORAGE_KEY)) || [];
      const newHistory = [entry, ...currentHistory].slice(0, MAX_HISTORY_LENGTH);
      await set(HISTORY_STORAGE_KEY, newHistory);
      setHistory(newHistory);
    } catch (error) {
      console.warn('Fallo de red o servidor. Guardando en almacenamiento local seguro...', error);

      const tipToSaveLocally: TipRecord = {
        ...tipToSave,
        synced: false,
      };

      const localTips = (await get<TipRecord[]>(OFFLINE_STORAGE_KEY)) || [];
      const newLocalTips = [...localTips, tipToSaveLocally];

      await set(OFFLINE_STORAGE_KEY, newLocalTips);
      setPendingCount(newLocalTips.length);
      setIsOffline(true);

      const entry: TipRecord = { ...tipToSaveLocally };
      const currentHistory = (await get<TipRecord[]>(HISTORY_STORAGE_KEY)) || [];
      const newHistory = [entry, ...currentHistory].slice(0, MAX_HISTORY_LENGTH);
      await set(HISTORY_STORAGE_KEY, newHistory);
      setHistory(newHistory);

      toast.warning('Sin conexión. Los datos están seguros en este dispositivo.');
    }
  };

  return { saveTip, isOffline, isSyncing, pendingCount, syncOfflineTips, history };
}
