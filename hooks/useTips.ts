// gaelcampuzano/kiosco-monalisa-v2/Kiosco-Monalisa-V2-8fe9ff121b13b2ecf67347664cfbdd5ba4f06866/hooks/useTips.ts
import { useState, useEffect } from 'react';
// REMOVIDO: import { collection, addDoc } from 'firebase/firestore';
// REMOVIDO: import { db } from '@/lib/firebase';
import { TipRecord } from '@/types';
// NUEVO: Importar la acción del servidor
import { saveTipToDb } from '@/app/actions/tips';

export function useTips() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Detectar estado de red inicial
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      // La sincronización debe ser implementada manualmente si se desea
      // syncOfflineTips(); 
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // [CAMBIO] Se elimina la lógica de syncOfflineTips de Firebase/Firestore
  // Si deseas mantener la sincronización, deberías implementar la lógica 
  // para leer de localStorage y llamar a saveTipToDb().
  const syncOfflineTips = async () => {
    console.warn("Offline synchronization logic needs to be implemented using saveTipToDb Server Action.");
  };


  return { saveTip, isOffline, syncOfflineTips };
}