import { RowDataPacket } from 'mysql2';

export interface TipRow extends RowDataPacket {
  id: number;
  tableNumber: string;
  waiterName: string;
  tipPercentage: number;
  amount: number | null;
  idempotency_key: string | null;
  createdAt: Date;
}

export interface WaiterRow extends RowDataPacket {
  id: number;
  name: string;
  active: number; // MySQL BOOLEAN is TINYINT(1) -> number
  createdAt: Date;
}

export interface SettingsRow extends RowDataPacket {
  setting_key: string;
  setting_value: unknown; // JSON column
  updatedAt: Date;
}

export interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  created_at: Date;
}
