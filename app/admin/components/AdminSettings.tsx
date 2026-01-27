/**
 * Componente AdminSettings
 * Interfaz para gestionar los porcentajes de propina predefinidos que se muestran en el Kiosco.
 * Permite actualizar hasta 3 opciones de agradecimiento sugerido.
 */

'use client';

import { useState } from 'react';
import { updateTipPercentages } from '@/app/actions/settings';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

interface AdminSettingsProps {
  /** Array con los 3 porcentajes actuales cargados desde la DB. */
  percentages: number[];
  /** Indica si los datos de configuración están en proceso de carga inicial. */
  loading: boolean;
  /** Función para refrescar los datos tras un guardado exitoso. */
  onRefresh: () => void;
  /** Función para actualizar el estado local de los porcentajes mientras se editan. */
  onUpdate: (percentages: number[]) => void;
}

export function AdminSettings({ percentages, loading, onRefresh, onUpdate }: AdminSettingsProps) {
  const [saving, setSaving] = useState(false);

  /**
   * Maneja el cambio individual de cada porcentaje.
   * Valida que sea un número entero.
   */
  const handleChange = (index: number, value: string) => {
    const val = parseInt(value);
    if (isNaN(val)) return;

    const newPct = [...percentages];
    newPct[index] = val;
    onUpdate(newPct);
  };

  /**
   * Envía la nueva configuración al servidor mediante un Server Action.
   */
  const handleSave = async () => {
    // Validación de seguridad: Rangos permitidos entre 0 y 100
    if (percentages.some((p) => p < 0 || p > 100)) {
      toast.error('Los porcentajes deben estar entre 0 y 100');
      return;
    }

    setSaving(true);
    try {
      const res = await updateTipPercentages(percentages);
      if (res.success) {
        toast.success('Configuración guardada correctamente');
        onRefresh();
      } else {
        toast.error(res.error || 'Error al guardar configuración');
      }
    } catch {
      toast.error('Error de red al intentar guardar');
    } finally {
      setSaving(false);
    }
  };

  // Estado de carga inicial (Skeleton simple)
  if (loading) {
    return (
      <div className="text-white/50 p-12 flex flex-col items-center justify-center gap-4 animate-pulse">
        <Loader2 className="animate-spin w-8 h-8 text-monalisa-gold" />
        <span className="text-xs uppercase tracking-widest font-bold">Cargando ajustes...</span>
      </div>
    );
  }

  return (
    <div className="bg-monalisa-navy/30 backdrop-blur-md rounded-sm border border-monalisa-gold/10 p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-serif text-white mb-6 border-b border-monalisa-gold/20 pb-4 uppercase tracking-wide">
        Parámetros de Propinas
      </h2>

      {/* Grid de Inputs para cada opción de porcentaje */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8">
        {percentages.map((pct, index) => (
          <div key={index} className="flex flex-col gap-2">
            <label className="text-[10px] sm:text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest">
              Opción {index + 1}
            </label>
            <div className="relative group">
              <input
                type="number"
                value={pct}
                min="0"
                max="100"
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-full bg-black/20 border border-white/10 focus:border-monalisa-gold rounded-sm text-white text-2xl sm:text-3xl font-serif py-3 sm:py-4 px-2 sm:px-4 text-center outline-none transition-all focus:bg-white/5"
              />
              <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/30 font-serif text-lg sm:text-xl">
                %
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Botón de Guardado con feedback visual de carga */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-monalisa-bronze text-white py-4 rounded-sm font-bold tracking-[0.2em] uppercase text-xs hover:bg-monalisa-gold hover:text-monalisa-navy transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
      >
        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
        <span>{saving ? 'Aplicando cambios...' : 'Guardar y Sincronizar'}</span>
      </button>

      <p className="mt-6 text-center text-[10px] text-monalisa-silver/30 font-light leading-relaxed">
        * Estos cambios se sincronizan en tiempo real con todos los dispositivos Kiosco activos.
      </p>
    </div>
  );
}
