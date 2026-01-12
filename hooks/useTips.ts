import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TipRecord } from '@/types';
import { saveTipToDb } from '@/app/actions/tips';
import { generateUUID } from '@/lib/utils';

export function useTips() {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Ayudante para actualizar el conteo pendiente desde localStorage
  const updatePendingCount = useCallback(() => {
    try {
      const localTips = JSON.parse(localStorage.getItem('offlineTips') || '[]');
      setPendingCount(localTips.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  // Sincroniza automáticamente los tips guardados offline cuando vuelve la conexión
  const syncOfflineTips = useCallback(async () => {
    try {
      // 1. Leer instantánea inicial para iterar
      const tipsToSync: TipRecord[] = JSON.parse(localStorage.getItem('offlineTips') || '[]');

      if (tipsToSync.length === 0) {
        setPendingCount(0);
        return;
      }

      setIsSyncing(true);
      console.log(`Sincronizando ${tipsToSync.length} tips offline...`);

      let syncedCount = 0;
      let failedCount = 0;

      // 2. Procesar uno por uno
      for (const tip of tipsToSync) {
        try {
          const result = await saveTipToDb(
            {
              waiterName: tip.waiterName,
              tableNumber: tip.tableNumber,
              tipPercentage: tip.tipPercentage,
              idempotencyKey: tip.idempotencyKey
            }
          );

          if (result.success) {
            syncedCount++;

            // 3. CRÍTICO: Eliminación Atómica
            // Volvemos a leer localStorage para asegurar que no borramos tips nuevos agregados mientras esperábamos
            const currentStore: TipRecord[] = JSON.parse(localStorage.getItem('offlineTips') || '[]');

            // Filtramos específicamente el tip que acabamos de guardar (por idempotencyKey)
            const newStore = currentStore.filter(t => t.idempotencyKey !== tip.idempotencyKey);

            localStorage.setItem('offlineTips', JSON.stringify(newStore));
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
    // Inicializar count
    updatePendingCount();

    // Detectar estado de red inicial
    const isOnline = navigator.onLine;
    setIsOffline(!isOnline);

    // Si estamos online al cargar, intentar sincronizar pendientes de sesiones previas
    if (isOnline) {
      syncOfflineTips();
    }

    const handleOnline = async () => {
      setIsOffline(false);
      toast.info("Conexión restaurada. Sincronizando...");
      await syncOfflineTips();
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning("Modo sin conexión activado");
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
        idempotencyKey
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log("Tip guardado vía Server Action");
      toast.success("Propina registrada correctamente");

    } catch (error) {
      console.warn("Guardando localmente debido a error:", error);

      const tipToSaveLocally: TipRecord = {
        ...tipToSave,
        synced: false,
      };

      const localTips = JSON.parse(localStorage.getItem('offlineTips') || '[]');
      const newLocalTips = [...localTips, tipToSaveLocally];

      localStorage.setItem('offlineTips', JSON.stringify(newLocalTips));
      setPendingCount(newLocalTips.length);
      setIsOffline(true);

      toast.warning("Sin conexión. Guardado localmente.");
    }
  };

  return { saveTip, isOffline, isSyncing, pendingCount, syncOfflineTips };
}
