/**
 * Página de Inicio de Sesión (LoginPage)
 * Punto de entrada seguro para administradores.
 * Utiliza Server Actions para validación y Framer Motion para una experiencia visual fluida.
 */

'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { ArrowLeft, Lock, User, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Background } from '@/app/components/Background';

const initialState = {
  error: '',
  code: '',
};

export default function LoginPage() {
  /**
   * Manejador de estado del formulario de inicio de sesión.
   * Proporciona feedback sobre errores y estado de carga (isPending).
   */
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [logoError, setLogoError] = useState(false);

  /**
   * Suscripción al estado de red del navegador.
   * Permite desactivar o alertar sobre funciones que requieren conectividad durante el login.
   */
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function subscribe(callback: () => void) {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    return () => {
      window.removeEventListener('online', callback);
      window.removeEventListener('offline', callback);
    };
  }

  function getSnapshot() {
    return !navigator.onLine;
  }

  function getServerSnapshot() {
    return false;
  }

  /**
   * Pre-carga y cacheo del logo institucional.
   * Garantiza que el logo sea visible incluso tras recargas sin conexión (Cache Storage API).
   */
  useEffect(() => {
    if (!isOffline && typeof window !== 'undefined' && 'caches' in window) {
      const cacheLogo = async () => {
        try {
          const cache = await caches.open('monalisa-images-v1');
          const cached = await cache.match('/logo-monalisa.svg');
          if (!cached) {
            const response = await fetch('/logo-monalisa.svg', { cache: 'force-cache' });
            if (response.ok) {
              await cache.put('/logo-monalisa.svg', response);
            }
          }
        } catch {
          // Fallo silencioso de caché
        }
      };
      cacheLogo();
    }
  }, [isOffline]);

  return (
    <div className="h-screen h-[100dvh] bg-monalisa-navy flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-monalisa-gold selection:text-monalisa-navy">
      {/* Fondo dinámico de partículas/gradientes */}
      <Background />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Enlace de retorno al flujo operativo del Kiosco */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-monalisa-silver/50 hover:text-monalisa-gold transition-colors mb-6 sm:mb-8 text-[10px] sm:text-xs font-bold tracking-widest uppercase w-fit"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />{' '}
          Regresar al Kiosco
        </Link>

        {/* CONTENEDOR PRINCIPAL: Tarjeta con efecto Glassmorphism */}
        <motion.div
          className="glass-card p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          {/* Detalles estéticos de iluminación superior */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-monalisa-gold/50 to-transparent opacity-50" />

          <div className="text-center mb-10">
            {/* COMPONENTE DE LOGO CON EFECTO SPOTLIGHT */}
            <motion.div
              className="relative w-full h-24 sm:h-32 mx-auto mb-4 sm:mb-6 flex items-center justify-center hover:scale-105 transition-transform duration-500"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(255,255,255,0.8)_20%,transparent_100%)] blur-xl" />

              <div className="relative w-48 h-20 sm:w-64 sm:h-28">
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
                    <span className="text-monalisa-gold text-xl sm:text-2xl font-serif">
                      Sunset Monalisa
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="font-serif text-2xl sm:text-3xl text-white mb-2 tracking-wide uppercase">
                Acceso Administrativo
              </h1>
              <p className="text-monalisa-silver/60 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
                Sistema de Control Monalisa
              </p>
            </motion.div>
          </div>

          <form action={formAction} className="space-y-4 sm:space-y-6">
            {/* Campo: Identificador de Usuario */}
            <motion.div
              className="space-y-2 group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-[10px] font-bold text-monalisa-bronze uppercase tracking-widest ml-1 group-focus-within:text-monalisa-gold transition-colors">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-monalisa-silver/30 group-focus-within:text-monalisa-gold transition-colors" />
                <input
                  name="user"
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:border-monalisa-gold outline-none transition-all placeholder:text-monalisa-silver/10 font-serif"
                  placeholder="Usuario admin"
                />
              </div>
            </motion.div>

            {/* Campo: Clave de Acceso */}
            <motion.div
              className="space-y-2 group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="text-[10px] font-bold text-monalisa-bronze uppercase tracking-widest ml-1 group-focus-within:text-monalisa-gold transition-colors">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-monalisa-silver/30 group-focus-within:text-monalisa-gold transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:border-monalisa-gold outline-none transition-all placeholder:text-monalisa-silver/10 font-serif"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            {/* Feedback de error capturado desde el servidor */}
            {state?.error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-900/20 border border-red-500/20 rounded-sm text-red-200 text-xs text-center font-medium tracking-wide"
              >
                {state.error}
              </motion.div>
            )}

            {/* Botón de envío con estado de carga integrado */}
            <motion.button
              type="submit"
              disabled={isPending}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full bg-monalisa-bronze hover:bg-monalisa-gold hover:text-monalisa-navy text-white font-bold py-4 rounded-full uppercase tracking-[0.2em] text-[10px] transition-all duration-300 shadow-[0_0_15px_rgba(147,119,55,0.2)] hover:shadow-[0_0_25px_rgba(223,200,148,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center"
            >
              {isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer legal/versión */}
        <motion.div
          className="text-center mt-8 text-monalisa-silver/20 text-[10px] font-serif italic tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Solo personal autorizado • 2026 Sunset Monalisa
        </motion.div>
      </motion.div>
    </div>
  );
}
