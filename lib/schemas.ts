import { z } from 'zod';

/**
 * Esquemas de validación de datos (Zod) para toda la aplicación.
 * Garantizan la integridad de los datos antes de persistir en MySQL.
 */

// --- Esquemas de Meseros ---

/**
 * Esquema base para la entidad Mesero.
 */
export const WaiterSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre demasiado largo'),
  active: z.boolean().default(true),
});

/**
 * Esquema para la creación de un nuevo mesero.
 */
export const CreateWaiterSchema = WaiterSchema.pick({ name: true });

// --- Esquemas de Propinas ---

/**
 * Validador para el porcentaje de propina.
 * Debe ser un número entero entre 0 y 100.
 */
const AllowedTipPercentages = z
  .number()
  .int('Debe ser un número entero')
  .min(0, 'Mínimo 0%')
  .max(100, 'Máximo 100%');

/**
 * Esquema para el registro de una propina.
 * Incluye campos para idempotencia y validación de mesa.
 */
export const TipSchema = z.object({
  tableNumber: z.string().trim().min(1, 'Mesa requerida').max(50, 'Número de mesa muy largo'),
  waiterName: z.string().trim().min(1, 'Mesero requerido'),
  tipPercentage: AllowedTipPercentages,
  idempotencyKey: z.string().optional(),
});

/**
 * Esquema de filtros para las consultas en el panel administrativo.
 */
export const FilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});
