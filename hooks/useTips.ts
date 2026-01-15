import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TipRecord } from '@/types';
import { saveTipToDb } from '@/app/actions/tips';
import { generateUUID } from '@/lib/utils';
import { get, set } from 'idb-keyval';

const OFFLINE_STORAGE_KEY = 'offlineTips';

export function useTips() {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Helper to update pending count from IndexedDB
  const updatePendingCount = useCallback(async () => {
    try {
      const localTips = (await get<TipRecord[]>(OFFLINE_STORAGE_KEY)) || [];
      setPendingCount(localTips.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  // Syncs offline tips when connection is restored
  const syncOfflineTips = useCallback(async () => {
    try {
      const tipsToSync = (await get<TipRecord[]>(OFFLINE_STORAGE_KEY)) || [];

      if (tipsToSync.length === 0) {
        setPendingCount(0);
        return;
      }

      setIsSyncing(true);
      console.log(`Sincronizando ${tipsToSync.length} tips offline (IndexedDB)...`);

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

            // Atomic deletion: Re-fetch current state to avoid race conditions
            const currentStore = (await get<TipRecord[]>(OFFLINE_STORAGE_KEY)) || [];
            const newStore = currentStore.filter((t) => t.idempotencyKey !== tip.idempotencyKey);
            await set(OFFLINE_STORAGE_KEY, newStore);
            setPendingCount(newStore.length);
          } else {
            failedCount++;
            console.error('Fallo al sincronizar tip:', tip);
          }
        } catch (error) {
          failedCount++;
          console.error('Error de red al sincronizar tip:', error);
        }
      }

      if (syncedCount > 0) {
        toast.success(`Se sincronizaron ${syncedCount} propinas guardadas offline`);
      }

      if (failedCount > 0) {
        console.warn(`${failedCount} tips no pudieron ser sincronizados y permanecen offline.`);
      }
    } catch (error) {
      console.error('Error en syncOfflineTips:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      // 1. Migration Logic: LocalStorage -> IndexedDB
      try {
        const legacyTips = localStorage.getItem(OFFLINE_STORAGE_KEY);
        if (legacyTips) {
          const parsed = JSON.parse(legacyTips);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const currentIdb = (await get<TipRecord[]>(OFFLINE_STORAGE_KEY)) || [];
            // Avoid duplicates if migration ran partially
            const combined = [...currentIdb];
            parsed.forEach((legacyTip) => {
              if (!combined.find((t) => t.idempotencyKey === legacyTip.idempotencyKey)) {
                combined.push(legacyTip);
              }
            });
            await set(OFFLINE_STORAGE_KEY, combined);
            console.log('Migrated tips from LocalStorage to IndexedDB');
          }
          localStorage.removeItem(OFFLINE_STORAGE_KEY);
        }
      } catch (e) {
        console.error('Migration check failed', e);
      }

      // 2. Initial state setup
      await updatePendingCount();

      const isOnline = navigator.onLine;
      setIsOffline(!isOnline);

      if (isOnline) {
        await syncOfflineTips();
      }
    };

    init();

    const handleOnline = async () => {
      setIsOffline(false);
      toast.info('Conexión restaurada. Sincronizando...');
      await syncOfflineTips();
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('Modo sin conexión activado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineTips, updatePendingCount]);

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

      console.log('Tip guardado vía Server Action');
      toast.success('Propina registrada correctamente');
    } catch (error) {
      console.warn('Guardando localmente (IndexedDB) debido a error:', error);

      const tipToSaveLocally: TipRecord = {
        ...tipToSave,
        synced: false,
      };

      const localTips = (await get<TipRecord[]>(OFFLINE_STORAGE_KEY)) || [];
      const newLocalTips = [...localTips, tipToSaveLocally];

      await set(OFFLINE_STORAGE_KEY, newLocalTips);
      setPendingCount(newLocalTips.length);
      setIsOffline(true);

      toast.warning('Sin conexión. Guardado de forma segura en el dispositivo.');
    }
  };

  return { saveTip, isOffline, isSyncing, pendingCount, syncOfflineTips };
}
