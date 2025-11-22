export type TipPercentage = 20 | 23 | 25;

export interface TipRecord {
  id?: string;
  tableNumber: string;
  waiterName: string;
  tipPercentage: TipPercentage;
  amount?: number;
  userAgent?: string;
  createdAt: string;
  synced: boolean;
}

export type KioskStep = 'WAITER_INPUT' | 'CLIENT_SELECTION' | 'THANK_YOU';