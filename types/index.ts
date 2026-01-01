/**
 * Definición de tipos para porcentajes de propina permitidos.
 */
export type TipPercentage = 20 | 23 | 25;

/**
 * Interfaz principal para el registro de propinas.
 */
export interface TipRecord {
  id?: string;
  tableNumber: string;
  waiterName: string;
  tipPercentage: TipPercentage;
  amount?: number;
  userAgent?: string;
  createdAt: string;
  synced: boolean;
  idempotencyKey?: string;
}

export type KioskStep = 'WAITER_INPUT' | 'CLIENT_SELECTION' | 'THANK_YOU';