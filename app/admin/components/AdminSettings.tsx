'use client';

import { useState, useEffect } from 'react';
import { getTipPercentages, updateTipPercentages } from '@/app/actions/settings';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

export function AdminSettings() {
  // Estado para los 3 porcentajes
  const [percentages, setPercentages] = useState<number[]>([0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTipPercentages()
      .then((data) => {
        setPercentages(data);
      })
      .catch((err) => {
        console.error('Error loading settings:', err);
        toast.error('Error al cargar configuración');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (index: number, value: string) => {
    const val = parseInt(value);
    if (isNaN(val)) return;

    const newPct = [...percentages];
    newPct[index] = val;
    setPercentages(newPct);
  };

  const handleSave = async () => {
    // Validar
    if (percentages.some((p) => p < 0 || p > 100)) {
      toast.error('Los porcentajes deben estar entre 0 y 100');
      return;
    }

    setSaving(true);
    try {
      const res = await updateTipPercentages(percentages);
      if (res.success) {
        toast.success('Configuración guardada correctamente');
      } else {
        toast.error(res.error || 'Error al guardar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white/50 p-8 flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" /> Cargando configuración...
      </div>
    );
  }

  return (
    <div className="bg-monalisa-navy/30 backdrop-blur-md rounded-sm border border-monalisa-gold/10 p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-serif text-white mb-6 border-b border-monalisa-gold/20 pb-4">
        Configuración de Propinas
      </h2>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {percentages.map((pct, index) => (
          <div key={index} className="flex flex-col gap-2">
            <label className="text-xs font-bold text-monalisa-gold/80 uppercase tracking-widest">
              Opción {index + 1}
            </label>
            <div className="relative group">
              <input
                type="number"
                value={pct}
                min="0"
                max="100"
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-full bg-black/20 border border-white/10 focus:border-monalisa-gold rounded-sm text-white text-3xl font-serif py-4 px-4 text-center outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-serif text-xl">
                %
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-monalisa-bronze text-white py-4 rounded-sm font-bold tracking-widest uppercase hover:bg-monalisa-gold hover:text-monalisa-navy transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>

      <p className="mt-4 text-center text-xs text-white/30">
        Los cambios se reflejarán inmediatamente en todos los kioscos.
      </p>
    </div>
  );
}
