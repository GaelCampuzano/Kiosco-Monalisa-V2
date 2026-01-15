import { z } from 'zod';
// import { TIP_PERCENTAGES } from './config';

// --- Waiters Schemas ---

export const WaiterSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre demasiado largo'),
  active: z.boolean().default(true),
});

export const CreateWaiterSchema = WaiterSchema.pick({ name: true });

// --- Tips Schemas ---

// Helper to validate against allowed percentages
const AllowedTipPercentages = z
  .number()
  .int('Debe ser un número entero')
  .min(0, 'Mínimo 0%')
  .max(100, 'Máximo 100%');

export const TipSchema = z.object({
  tableNumber: z.string().trim().min(1, 'Mesa requerida').max(50, 'Número de mesa muy largo'),
  waiterName: z.string().trim().min(1, 'Mesero requerido'),
  tipPercentage: AllowedTipPercentages,
  idempotencyKey: z.string().optional(),
});

export const FilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});
