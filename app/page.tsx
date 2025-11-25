"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useTips } from "@/hooks/useTips";
import { TipPercentage, KioskStep } from "@/types";
import { Shield, Star } from "lucide-react"; 

// CORRECCIÓN FINAL DE RUTA: Apuntando a la carpeta app/components con el alias @/
// (Esto depende de que tu tsconfig.json tenga configurado el alias "@/": ["./*"] o similar)
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { StatusIndicator } from "@/app/components/StatusIndicator";

export default function Kiosk() {
  const { saveTip, isOffline } = useTips();
  
  const [lang, setLang] = useState<"es" | "en">("es");
  const [step, setStep] = useState<KioskStep>("WAITER_INPUT");
  const [waiterName, setWaiterName] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  // Lógica de Wake Lock
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error('Error Wake Lock:', err);
      }
    };
    
    requestWakeLock();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => {
      if (wakeLock) wakeLock.release();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const t = {
    es: {
      waiterTitle: "Configuración de Mesa",
      table: "Mesa",
      waiter: "Mesero",
      waiterPlaceholder: "Tu nombre",
      btnDeliver: "Presentar al Cliente",
      clientTitle: "Su experiencia en Sunset Monalisa",
      selectTip: "Agradecimiento para",
      tipLabel: "Servicio",
      thanks: "¡Gracias por su visita!",
      bye: "Esperamos verle pronto.",
      online: "En línea",
      offline: "Sin conexión",
      offlineMsg: "Datos guardados localmente. Se enviarán al reconectar.",
    },
    en: {
      waiterTitle: "Table Setup",
      table: "Table",
      waiter: "Waiter",
      waiterPlaceholder: "Your name",
      btnDeliver: "Present to Guest",
      clientTitle: "Your Sunset Monalisa Experience",
      selectTip: "Gratuity for",
      tipLabel: "Service",
      thanks: "Thank you for visiting!",
      bye: "We hope to see you soon.",
      online: "Online",
      offline: "Offline",
      offlineMsg: "Data saved locally. Will sync when back online.",
    }
  };

  const text = t[lang];

  const handleWaiterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waiterName && tableNumber) setStep("CLIENT_SELECTION");
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#DFC894', '#FFFFFF', '#937737']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#DFC894', '#FFFFFF', '#937737']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleTipSelection = async (percentage: TipPercentage) => {
    triggerConfetti();
    await saveTip({ waiterName, tableNumber, tipPercentage: percentage });
    setStep("THANK_YOU");
    
    setTimeout(() => {
      setStep("WAITER_INPUT");
      setTableNumber("");
    }, 5000);
  };

  return (
    <main className="min-h-screen text-monalisa-silver flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* --- FONDO --- */}
      <div className="absolute inset-0 w-full h-full -z-20">
        <Image
          src="/bkg.jpg"
          alt="Fondo Sunset Monalisa"
          fill
          priority
          className="object-cover"
          quality={100}
        />
        <div className="absolute inset-0 bg-[#162B46]/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#162B46] via-transparent to-[#162B46]/30" />
      </div>

      {/* --- UI FLOTANTE REFACTORIZADA --- */}
      
      {/* 1. Selector de Idioma */}
      <LanguageToggle lang={lang} setLang={setLang} />

      {/* 2. Indicador de Estado de Red */}
      <StatusIndicator isOffline={isOffline} text={text} />

      {/* Botón de Admin */}
      <Link href="/admin" className="fixed bottom-8 right-8 z-30 opacity-30 hover:opacity-100 transition-opacity p-2 text-white">
        <Shield className="w-5 h-5" />
      </Link>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center min-h-[60vh]">
        <AnimatePresence mode="wait">
          
          {/* PASO 1: MESERO */}
          {step === "WAITER_INPUT" && (
            <motion.div
              key="waiter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md bg-[#162B46]/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-sm shadow-2xl"
            >
              <div className="text-center mb-8">
                
                {/* LOGO CON EFECTO SPOTLIGHT (LUZ RADIAL) */}
                <div className="relative w-full h-32 mx-auto mb-6 flex items-center justify-center">
                  {/* Capa de luz de fondo difusa */}
                  <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(255,255,255,0.8)_20%,transparent_100%)] blur-xl" />
                  
                  {/* Logo encima */}
                  <div className="relative w-64 h-28">
                    <Image 
                      src="/logo-monalisa.svg" 
                      alt="Logo Sunset Monalisa" 
                      fill 
                      className="object-contain" 
                      priority
                    />
                  </div>
                </div>

                <h1 className="font-serif text-3xl text-white tracking-wide drop-shadow-sm border-t border-white/10 pt-6">
                  {text.waiterTitle}
                </h1>
              </div>
              
              <form onSubmit={handleWaiterSubmit} className="space-y-8">
                <div className="group">
                  <label className="block text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest mb-2 ml-1">{text.table}</label>
                  <input
                    // CORRECCIÓN: Cambiado a type="text" para evitar la notación científica.
                    type="text" 
                    required
                    value={tableNumber}
                    // FILTRO: Mantiene solo dígitos (0-9).
                    onChange={(e) => setTableNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-black/20 border border-white/10 focus:border-monalisa-gold rounded-sm text-white text-2xl py-3 px-4 outline-none transition-all font-serif placeholder:text-white/10 text-center"
                    placeholder="#"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest mb-2 ml-1">{text.waiter}</label>
                  <input
                    type="text"
                    required
                    value={waiterName}
                    onChange={(e) => {
                      if (!/[0-9]/.test(e.target.value)) setWaiterName(e.target.value);
                    }}
                    className="w-full bg-black/20 border border-white/10 focus:border-monalisa-gold rounded-sm text-white text-xl py-3 px-4 outline-none transition-all font-serif placeholder:text-white/10 text-center"
                    placeholder={text.waiterPlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-monalisa-bronze text-white py-4 px-6 rounded-sm font-bold tracking-[0.15em] uppercase text-xs hover:bg-monalisa-gold hover:text-monalisa-navy transition-all duration-300 shadow-lg hover:shadow-monalisa-gold/20"
                >
                  {text.btnDeliver}
                </button>
              </form>
            </motion.div>
          )}

          {/* PASO 2: CLIENTE */}
          {step === "CLIENT_SELECTION" && (
            <motion.div
              key="client"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full text-center"
            >
              <div className="inline-block bg-[#162B46]/30 backdrop-blur-sm px-8 py-4 rounded-full mb-10 border border-white/5">
                <h2 className="font-serif text-4xl md:text-6xl text-white drop-shadow-md mb-2">
                  {text.clientTitle}
                </h2>
                <p className="text-monalisa-gold text-lg font-light tracking-wide">
                  {text.selectTip} <span className="font-serif italic font-medium text-white border-b border-monalisa-gold/50 px-1">{waiterName}</span>
                </p>
              </div>

              {/* MEJORA RESPONSIVA: grid-cols-1 en móvil, grid-cols-3 en md (horizontal) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-10 px-4 max-w-5xl mx-auto">
                {[20, 23, 25].map((pct) => (
                  <motion.button
                    key={pct}
                    onClick={() => handleTipSelection(pct as TipPercentage)}
                    whileTap={{ scale: 0.95 }} 
                    whileHover={{ scale: 1.05 }}
                    className="group relative flex flex-col items-center justify-center py-16 md:py-24 rounded-sm border border-white/10 hover:border-monalisa-gold bg-[#162B46]/60 backdrop-blur-md transition-all duration-500 hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-monalisa-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <span className="font-serif text-6xl md:text-8xl text-white group-hover:text-monalisa-gold transition-colors duration-300 drop-shadow-lg">
                      {pct}<span className="text-4xl align-top opacity-60">%</span>
                    </span>
                    
                    <div className="flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-[0.25em] text-monalisa-bronze group-hover:text-monalisa-gold transition-colors drop-shadow-md">
                      <div className="h-[1px] w-6 bg-current opacity-60" />
                      {text.tipLabel}
                      <div className="h-[1px] w-6 bg-current opacity-60" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* PASO 3: GRACIAS */}
          {step === "THANK_YOU" && (
            <motion.div
              key="thanks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center bg-[#162B46]/40 backdrop-blur-md p-12 rounded-sm border border-white/5 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-8 relative"
              >
                <Star className="w-24 h-24 mx-auto text-monalisa-gold fill-monalisa-gold/20 animate-pulse drop-shadow-[0_0_30px_rgba(223,200,148,0.6)]" />
              </motion.div>
              
              <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 drop-shadow-xl">
                {text.thanks}
              </h1>
              <p className="text-monalisa-silver text-xl font-light tracking-wide">
                {text.bye}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}