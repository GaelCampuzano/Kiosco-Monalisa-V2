import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de CSS condicionalmente usando clsx y tailwind-merge.
 * @param inputs - Lista de clases o condiciones.
 * @returns String con las clases combinadas y optimizadas.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
