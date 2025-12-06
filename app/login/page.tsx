"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { ArrowLeft, Lock, User, RefreshCw } from "lucide-react"; 
import Link from "next/link";
import Image from "next/image";

const initialState = {
  error: '',
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [logoError, setLogoError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Pre-cargar y cachear logo cuando esté online
  useEffect(() => {
    if (!isOffline && typeof window !== "undefined" && "caches" in window) {
      const cacheLogo = async () => {
        try {
          const cache = await caches.open("monalisa-images-v1");
          const cached = await cache.match("/logo-monalisa.svg");
          if (!cached) {
            const response = await fetch("/logo-monalisa.svg", { cache: "force-cache" });
            if (response.ok) {
              await cache.put("/logo-monalisa.svg", response);
            }
          }
        } catch {
          // Silenciar errores
        }
      };
      cacheLogo();
    }
  }, [isOffline]);

  return (
    <div className="min-h-screen bg-monalisa-navy flex items-center justify-center p-6 relative overflow-hidden selection:bg-monalisa-gold selection:text-monalisa-navy">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1f3a5e] via-monalisa-navy to-[#0a1525] -z-10" />

      <div className="w-full max-w-md">
        {/* Botón Volver al Kiosco */}
        <Link href="/" className="group flex items-center gap-2 text-monalisa-silver/50 hover:text-monalisa-gold transition-colors mb-8 text-xs font-bold tracking-widest uppercase w-fit">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Regresar al Kiosco
        </Link>

        {/* Tarjeta de Login */}
        <div className="bg-monalisa-navy/50 backdrop-blur-xl border border-monalisa-gold/20 p-8 md:p-12 rounded-sm shadow-2xl relative overflow-hidden">
          
          {/* Brillo superior decorativo */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-monalisa-gold/50 to-transparent opacity-50" />

          <div className="text-center mb-10">
            
            {/* LOGO CON SPOTLIGHT EN LOGIN */}
            <div className="relative w-full h-32 mx-auto mb-6 flex items-center justify-center hover:scale-105 transition-transform duration-500">
               {/* Luz de fondo difusa */}
               <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(255,255,255,0.8)_20%,transparent_100%)] blur-xl" />
               
               {/* Logo */}
               <div className="relative w-64 h-28">
                {/* Lógica modificada: solo comprueba logoError */}
                {!logoError ? (
                  <Image
                    src="/logo-monalisa.svg"
                    alt="Sunset Monalisa Logo"
                    fill
                    priority
                    className="object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-monalisa-gold text-2xl font-serif">Sunset Monalisa</span>
                  </div>
                )}
              </div>
            </div>

            <h1 className="font-serif text-3xl text-white mb-2 tracking-wide">Acceso Administrativo</h1>
            <p className="text-monalisa-silver/60 text-sm font-light">Sistema de Gestión Sunset Monalisa</p>
          </div>

          <form action={formAction} className="space-y-6">
            {/* Input Usuario */}
            <div className="space-y-2 group">
              <label className="text-xs font-bold text-monalisa-bronze uppercase tracking-widest ml-1 group-focus-within:text-monalisa-gold transition-colors">Usuario</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-monalisa-silver/30 group-focus-within:text-monalisa-gold transition-colors" />
                <input 
                  name="user"
                  type="text" 
                  required
                  className="w-full bg-[#0f1e33] border border-monalisa-gold/10 rounded-sm py-3 pl-12 pr-4 text-white focus:border-monalisa-gold outline-none transition-all placeholder:text-monalisa-silver/10 font-serif"
                  placeholder="admin"
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-2 group">
              <label className="text-xs font-bold text-monalisa-bronze uppercase tracking-widest ml-1 group-focus-within:text-monalisa-gold transition-colors">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-monalisa-silver/30 group-focus-within:text-monalisa-gold transition-colors" />
                <input 
                  name="password"
                  type="password" 
                  required
                  className="w-full bg-[#0f1e33] border border-monalisa-gold/10 rounded-sm py-3 pl-12 pr-4 text-white focus:border-monalisa-gold outline-none transition-all placeholder:text-monalisa-silver/10 font-serif"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Mensaje de Error */}
            {state?.error && (
              <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-sm text-red-200 text-xs text-center font-medium tracking-wide animate-pulse">
                {state.error}
              </div>
            )}

            {/* Botón Submit con animación de carga */}
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-monalisa-bronze hover:bg-monalisa-gold hover:text-monalisa-navy text-white font-bold py-4 rounded-sm uppercase tracking-[0.2em] text-xs transition-all duration-300 shadow-[0_0_15px_rgba(147,119,55,0.2)] hover:shadow-[0_0_25px_rgba(223,200,148,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
        
        <div className="text-center mt-8 text-monalisa-silver/20 text-xs font-serif italic">
          Solo personal autorizado • v1.0
        </div>
      </div>
    </div>
  );
}