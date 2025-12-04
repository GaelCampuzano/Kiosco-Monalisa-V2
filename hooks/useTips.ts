// gaelcampuzano/kiosco-monalisa-v2/Kiosco-Monalisa-V2-8fe9ff121b13b2ecf67347664cfbdd5ba4f06866/hooks/useTips.ts
import { useState, useEffect, useCallback } from 'react';
// REMOVIDO: import { collection, addDoc } from 'firebase/firestore';
// REMOVIDO: import { db } from '@/lib/firebase';
import { TipRecord } from '@/types';
// NUEVO: Importar la acción del servidor
import { saveTipToDb } from '@/app/actions/tips';

export function useTips() {
  const [isOffline, setIsOffline] = useState(false);

  // Sincroniza automáticamente los tips guardados offline cuando vuelve la conexión
  const syncOfflineTips = useCallback(async () => {
    try {
      const localTips = JSON.parse(localStorage.getItem('offlineTips') || '[]');
      
      if (localTips.length === 0) {
        return; // No hay tips para sincronizar
      }

      console.log(`Sincronizando ${localTips.length} tips offline...`);

      // Intentar sincronizar cada tip guardado offline
      const syncedTips: TipRecord[] = [];
      const failedTips: TipRecord[] = [];

      for (const tip of localTips) {
        try {
          // Intentar guardar en la base de datos
          const result = await saveTipToDb(
            {
              waiterName: tip.waiterName,
              tableNumber: tip.tableNumber,
              tipPercentage: tip.tipPercentage
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

      // Actualizar localStorage: mantener solo los que fallaron
      if (failedTips.length > 0) {
        localStorage.setItem('offlineTips', JSON.stringify(failedTips));
        console.warn(`${failedTips.length} tips no pudieron ser sincronizados`);
      } else {
        // Todos se sincronizaron correctamente
        localStorage.removeItem('offlineTips');
        console.log(`✓ Todos los tips se sincronizaron correctamente (${syncedTips.length})`);
      }
    } catch (error) {
      console.error('Error en syncOfflineTips:', error);
    }
  }, []);

  useEffect(() => {
    // Detectar estado de red inicial
    setIsOffline(!navigator.onLine);

    const handleOnline = async () => {
      setIsOffline(false);
      // Sincronizar automáticamente cuando vuelve la conexión
      await syncOfflineTips();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineTips]);

  // [CAMBIO] Ahora llama a la Server Action para guardar en MySQL
  const saveTip = async (data: Omit<TipRecord, 'id' | 'createdAt' | 'synced'>) => {
    const { waiterName, tableNumber, tipPercentage } = data;
    const tipToSave: Omit<TipRecord, 'id' | 'synced'> = {
      tableNumber,
      waiterName,
      tipPercentage,
      createdAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    try {
      // 1. Intentar guardar en la base de datos (MySQL via Server Action)
      if (!navigator.onLine) throw new Error('Offline');
      
      const result = await saveTipToDb(data, navigator.userAgent);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log("Tip saved to MySQL via Server Action");
      
    } catch (error) {
      // 2. Si falla (OFFLINE o error del servidor), guardar localmente
      console.warn("Network error or Server Save Failed, saving locally", error);
      
      const tipToSaveLocally: TipRecord = {
        ...tipToSave,
        synced: false,
      };

      const localTips = JSON.parse(localStorage.getItem('offlineTips') || '[]');
      localStorage.setItem('offlineTips', JSON.stringify([...localTips, tipToSaveLocally]));
      
      // 3. Actualizar el estado visual del UI
      setIsOffline(true);
    }
  };



  return { saveTip, isOffline, syncOfflineTips };
}