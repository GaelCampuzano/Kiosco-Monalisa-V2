import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TipRecord } from '@/types';
import { saveTipToDb } from '@/app/actions/tips';

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
      const localTips = JSON.parse(localStorage.getItem('offlineTips') || '[]');

      if (localTips.length === 0) {
        setPendingCount(0);
        return;
      }

      setIsSyncing(true);
      console.log(`Sincronizando ${localTips.length} tips offline...`);

      const syncedTips: TipRecord[] = [];
      const failedTips: TipRecord[] = [];

      for (const tip of localTips) {
        try {
          const result = await saveTipToDb(
            {
              waiterName: tip.waiterName,
              tableNumber: tip.tableNumber,
              tipPercentage: tip.tipPercentage,
              idempotencyKey: tip.idempotencyKey
            },
            tip.userAgent || navigator.userAgent
          );

          if (result.success) {
            syncedTips.push(tip);
          } else {
            failedTips.push(tip);
          }
        } catch (error) {
          console.error('Error sincronizando tip:', error);
          failedTips.push(tip);
        }
      }

      // Actualizar localStorage
      if (failedTips.length > 0) {
        localStorage.setItem('offlineTips', JSON.stringify(failedTips));
        setPendingCount(failedTips.length);
        console.warn(`${failedTips.length} tips no pudieron ser sincronizados`);
        // Opcional: Notificar si algun tip falló permanentemente, pero mejor no spammear si sigue offline
      } else {
        localStorage.removeItem('offlineTips');
        setPendingCount(0);
        toast.success(`Se sincronizaron ${syncedTips.length} propinas guardadas offline`);
        console.log(`✓ Todos los tips se sincronizaron correctamente (${syncedTips.length})`);
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
    setIsOffline(!navigator.onLine);

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
    const idempotencyKey = crypto.randomUUID();

    const tipToSave: Omit<TipRecord, 'id' | 'synced'> = {
      tableNumber,
      waiterName,
      tipPercentage,
      createdAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      idempotencyKey,
    };

    try {
      if (!navigator.onLine) throw new Error('Offline');

      const result = await saveTipToDb({
        ...data,
        idempotencyKey
      }, navigator.userAgent);

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