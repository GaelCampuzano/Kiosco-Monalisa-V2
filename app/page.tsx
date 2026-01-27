'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { Shield, History as HistoryIcon } from 'lucide-react';

import { useTips } from '@/hooks/useTips';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useImageCache } from '@/hooks/useImageCache';
import { useKioskData } from '@/hooks/useKioskData';
import { useTranslations, Language } from '@/lib/translations';

import { TipPercentage, KioskStep } from '@/types';

import { LanguageToggle } from '@/app/components/LanguageToggle';
import { StatusIndicator } from '@/app/components/StatusIndicator';
import { Background } from '@/app/components/Background';
import { SuccessAnimation } from '@/app/components/SuccessAnimation';
import dynamic from 'next/dynamic';

const WaiterForm = dynamic(
  () => import('@/app/components/WaiterForm').then((mod) => mod.WaiterForm),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-lg aspect-[4/5] bg-white/5 animate-pulse rounded-3xl" />
    ),
  }
);
const TipSelector = dynamic(
  () => import('@/app/components/TipSelector').then((mod) => mod.TipSelector),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-4xl aspect-video bg-white/5 animate-pulse rounded-3xl" />
    ),
  }
);
const ThankYouScreen = dynamic(
  () => import('@/app/components/ThankYouScreen').then((mod) => mod.ThankYouScreen),
  { ssr: false }
);
const TipHistory = dynamic(
  () => import('@/app/components/TipHistory').then((mod) => mod.TipHistory),
  { ssr: false }
);

export default function Kiosk() {
  // Hooks de datos y sincronización
  const { saveTip, isOffline, isSyncing, pendingCount, history } = useTips();
  const { waiters, percentages: tipPercentages, isLoading: isDataLoading } = useKioskData();

  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'es';
    const savedLang = localStorage.getItem('monalisa_lang') as Language;
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) return savedLang;
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'es';
  });

  const [step, setStep] = useState<KioskStep>('WAITER_INPUT');
  const [waiterName, setWaiterName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [lastSelectedTip, setLastSelectedTip] = useState<TipPercentage | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 1. Efecto removido/simplificado ya que la inicialización es síncrona en el cliente
  useEffect(() => {
    // Aquí se podrían añadir otras lógicas de inicialización no relacionadas con el estado inicial
  }, []);

  // 2. Función para cambiar idioma con persistencia
  const toggleLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('monalisa_lang', newLang);
  };

  // Inicialización de hooks de utilidad
  useWakeLock();
  useImageCache(isOffline);

  const text = useTranslations(lang);

  const handleWaiterSubmit = () => {
    setStep('CLIENT_SELECTION');
  };

  // Maneja la selección de propina. El porcentaje viene de la configuración (ver lib/config.ts)
  const handleTipSelection = async (percentage: TipPercentage) => {
    setShowSuccessAnimation(true);
    setLastSelectedTip(percentage);
    setTimeout(() => setShowSuccessAnimation(false), 2000);

    await saveTip({ waiterName, tableNumber, tipPercentage: percentage });
    setStep('THANK_YOU');

    setTimeout(() => {
      setStep('WAITER_INPUT');
      setTableNumber('');
    }, 5000);
  };

  return (
    <main className="min-h-screen min-h-[100dvh] text-monalisa-silver flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-x-hidden font-sans py-8 sm:py-12 landscape:py-4">
      <Background />

      <LanguageToggle lang={lang} setLang={toggleLang} />
      <StatusIndicator
        isOffline={isOffline}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
        text={text}
      />

      <Link
        href="/admin"
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-30 opacity-30 hover:opacity-100 transition-opacity p-2 text-white"
      >
        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
      </Link>

      <button
        onClick={() => setIsHistoryOpen(true)}
        className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 z-30 opacity-30 hover:opacity-100 transition-opacity p-2 text-white flex items-center gap-2"
      >
        <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-[10px] uppercase tracking-widest hidden sm:inline">
          {text.history}
        </span>
      </button>

      <TipHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        text={text}
      />

      <AnimatePresence>{showSuccessAnimation && <SuccessAnimation />}</AnimatePresence>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center min-h-[60vh] px-2 sm:px-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === 'WAITER_INPUT' && (
            <WaiterForm
              key="waiter-form"
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
              waiterName={waiterName}
              setWaiterName={setWaiterName}
              onSubmit={handleWaiterSubmit}
              text={text}
              waiters={waiters}
              isDataLoading={isDataLoading}
            />
          )}

          {step === 'CLIENT_SELECTION' && (
            <TipSelector
              key="tip-selector"
              waiterName={waiterName}
              onTipSelect={handleTipSelection}
              text={text}
              percentages={tipPercentages}
            />
          )}

          {step === 'THANK_YOU' && (
            <ThankYouScreen key="thank-you" text={text} tipPercentage={lastSelectedTip} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
