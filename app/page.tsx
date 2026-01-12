"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";

import { useTips } from "@/hooks/useTips";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useImageCache } from "@/hooks/useImageCache";
import { useTranslations, Language } from "@/lib/translations";

import { TipPercentage, KioskStep } from "@/types";

import { LanguageToggle } from "@/app/components/LanguageToggle";
import { StatusIndicator } from "@/app/components/StatusIndicator";
import { WaiterForm } from "@/app/components/WaiterForm";
import { TipSelector } from "@/app/components/TipSelector";
import { ThankYouScreen } from "@/app/components/ThankYouScreen";
import { Background } from "@/app/components/Background";
import { SuccessAnimation } from "@/app/components/SuccessAnimation";

export default function Kiosk() {
  // Hooks personalizados y estado para la gestión del kiosco
  const { saveTip, isOffline, isSyncing, pendingCount } = useTips();
  const [lang, setLang] = useState<Language>("es");
  const [step, setStep] = useState<KioskStep>("WAITER_INPUT");
  const [waiterName, setWaiterName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Inicialización de hooks de utilidad
  useWakeLock();
  useImageCache(isOffline);

  const text = useTranslations(lang);

  const handleWaiterSubmit = () => {
    setStep("CLIENT_SELECTION");
  };

  // Maneja la selección de propina. El porcentaje viene de la configuración (ver lib/config.ts)
  const handleTipSelection = async (percentage: TipPercentage) => {
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 2000);

    await saveTip({ waiterName, tableNumber, tipPercentage: percentage });
    setStep("THANK_YOU");

    setTimeout(() => {
      setStep("WAITER_INPUT");
      setTableNumber("");
    }, 5000);
  };

  return (
    <main className="min-h-screen text-monalisa-silver flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">

      <Background />

      <LanguageToggle lang={lang} setLang={setLang} />
      <StatusIndicator isOffline={isOffline} isSyncing={isSyncing} pendingCount={pendingCount} text={text} />

      <Link href="/admin" className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-30 opacity-30 hover:opacity-100 transition-opacity p-2 text-white">
        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
      </Link>

      <AnimatePresence>
        {showSuccessAnimation && <SuccessAnimation />}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center min-h-[60vh] px-2 sm:px-4">
        <AnimatePresence mode="wait">

          {step === "WAITER_INPUT" && (
            <WaiterForm
              key="waiter-form"
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
              waiterName={waiterName}
              setWaiterName={setWaiterName}
              onSubmit={handleWaiterSubmit}
              text={text}
            />
          )}

          {step === "CLIENT_SELECTION" && (
            <TipSelector
              key="tip-selector"
              waiterName={waiterName}
              onTipSelect={handleTipSelection}
              onBack={() => setStep("WAITER_INPUT")}
              text={text}
            />
          )}

          {step === "THANK_YOU" && (
            <ThankYouScreen
              key="thank-you"
              text={text}
            />
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}