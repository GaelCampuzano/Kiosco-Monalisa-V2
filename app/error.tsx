'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Loguear el error a un servicio de reporte si existiera
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#162B46] flex flex-col items-center justify-center p-6 text-center">
      {/* ... content ... */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-lg shadow-2xl"
      >
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-serif text-white mb-4">Algo salió mal</h2>

        <p className="text-white/60 mb-8 text-sm leading-relaxed">
          Ocurrió un error inesperado en la aplicación. No te preocupes, tus datos locales están
          seguros.
        </p>

        <div className="space-y-4">
          <button
            onClick={
              // Intentar recuperar recuperando el segmento
              () => reset()
            }
            className="w-full bg-monalisa-gold text-[#162B46] font-bold py-3 px-6 rounded hover:bg-white transition-colors duration-300 uppercase tracking-widest text-xs"
          >
            Intentar de nuevo
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-transparent border border-white/20 text-white/60 font-medium py-3 px-6 rounded hover:bg-white/5 hover:text-white transition-colors duration-300 text-xs"
          >
            Volver al inicio
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-black/40 rounded text-left overflow-auto max-h-32 text-[10px] text-red-300 font-mono border border-red-900/30">
            {error.toString()}
          </div>
        )}
      </motion.div>
    </div>
  );
}
