import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de CSS condicionalmente usando clsx y tailwind-merge.
 * @param inputs - Lista de clases o condiciones.
 * @returns String con las clases combinadas y optimizadas.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera un UUID v4 seguro.
 * Utiliza crypto.randomUUID si está disponible (contextos seguros),
 * o un fallback basado en Math.random para contextos inseguros (como IP local).
 */
export function generateUUID(): string {
  // Verifica si crypto.randomUUID está disponible y es una función
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback para entornos donde crypto.randomUUID no está disponible
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
