import { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TipRecord } from '@/types';

export function useTips() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Detectar estado de red inicial
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineTips(); // Intentar subir datos pendientes al volver online
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveTip = async (data: Omit<TipRecord, 'id' | 'createdAt' | 'synced'>) => {
    const newTip: TipRecord = {
      ...data,
      createdAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      synced: true,
    };

    try {
      if (!navigator.onLine) throw new Error('Offline');
      
      await addDoc(collection(db, "tips"), newTip);
      console.log("Tip saved to Firebase");
      
    } catch (error) {
      console.warn("Network error or Offline, saving locally", error);
      newTip.synced = false;
      // Guardar en LocalStorage
      const localTips = JSON.parse(localStorage.getItem('offlineTips') || '[]');
      localStorage.setItem('offlineTips', JSON.stringify([...localTips, newTip]));
    }
  };

  const syncOfflineTips = async () => {
    const localTipsString = localStorage.getItem('offlineTips');
    if (!localTipsString) return;

    const localTips: TipRecord[] = JSON.parse(localTipsString);
    if (localTips.length === 0) return;

    console.log(`Syncing ${localTips.length} tips...`);
    const remainingTips: TipRecord[] = [];

    for (const tip of localTips) {
      try {
        const tipToSave = { ...tip, synced: true };
        await addDoc(collection(db, "tips"), tipToSave);
      } catch (e) {
        remainingTips.push(tip); // Si falla de nuevo, lo mantenemos en cola
      }
    }

    localStorage.setItem('offlineTips', JSON.stringify(remainingTips));
  };

  return { saveTip, isOffline };
}