'use client';

import { useState } from 'react';
import { Sparkles, Brain, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAIAnalysis } from '@/app/actions/ai-analyst';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/app/components/ui/card';

export function AIAnalyst() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateAIAnalysis();
      setAnalysis(result);
    } catch (error) {
      setAnalysis('Error al generar el análisis. Asegúrate de tener conexión a internet.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-monalisa-gold/20 bg-monalisa-navy/40 backdrop-blur-sm overflow-hidden border-2">
        <CardHeader className="border-b border-monalisa-gold/10 bg-monalisa-gold/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-monalisa-gold flex items-center gap-2 text-xl font-bold">
                <Sparkles className="h-6 w-6" />
                IA Analista Monalisa
              </CardTitle>
              <CardDescription className="text-monalisa-silver/60 mt-1">
                Análisis inteligente de propinas y rendimiento de meseros (Powered by Gemini)
              </CardDescription>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-monalisa-gold text-monalisa-navy px-6 py-2.5 rounded-full font-bold hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-monalisa-gold/20 group"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Brain className="h-5 w-5 group-hover:scale-110 transition-transform" />
              )}
              {analysis ? 'Actualizar Análisis' : 'Iniciar Analista'}
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {!analysis && !loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center space-y-4"
              >
                <div className="bg-monalisa-gold/10 p-6 rounded-full border border-monalisa-gold/20">
                  <Brain className="h-16 w-16 text-monalisa-gold/60" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-monalisa-gold font-semibold text-lg">
                    ¿Listo para ver los insights?
                  </h3>
                  <p className="text-monalisa-silver/70">
                    Haz clic en el botón superior para que la IA procese los datos de este mes y te
                    brinde recomendaciones estratégicas.
                  </p>
                </div>
              </motion.div>
            ) : loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-monalisa-gold/20 blur-xl rounded-full animate-pulse" />
                  <RefreshCw className="h-20 w-20 text-monalisa-gold animate-spin relative" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-monalisa-gold font-bold text-lg animate-pulse">
                    Gemini está analizando tus registros...
                  </p>
                  <p className="text-monalisa-silver/40 text-sm">
                    Esto puede tardar unos segundos.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 font-sans text-monalisa-silver leading-relaxed shadow-inner">
                  <div
                    className="whitespace-pre-wrap text-base md:text-lg selection:bg-monalisa-gold selection:text-monalisa-navy"
                    dangerouslySetInnerHTML={{
                      __html:
                        analysis?.replace(
                          /\*\*(.*?)\*\*/g,
                          '<b class="text-monalisa-gold">$1</b>'
                        ) || '',
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <p className="text-xs text-monalisa-silver/30 italic">
                    * Los datos analizados corresponden a las últimas de registros de propinas.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
