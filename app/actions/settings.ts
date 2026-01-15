'use server';

import { getDbPool } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { SettingsRow } from '@/types/db';
import { TIP_PERCENTAGES } from '@/lib/config';
// import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth-check';

/**
 * Obtiene los porcentajes de propina configurados.
 * Si no existen en DB, retorna los valores por defecto de config.ts
 */
export async function getTipPercentages(): Promise<number[]> {
  try {
    const pool = await getDbPool();
    const [rows] = await pool.query<SettingsRow[]>(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'tip_percentages'"
    );

    if (rows.length > 0) {
      const value = rows[0].setting_value;
      // MySQL JSON column returns object/array directly in newer drivers/config,
      // but sometimes string depending on driver setup. Safer to parse if string.
      return Array.isArray(value) ? value : JSON.parse(value as unknown as string);
    }

    return [...TIP_PERCENTAGES]; // Return default copy
  } catch (error) {
    console.error('Error fetching tip percentages:', error);
    return [...TIP_PERCENTAGES]; // Fallback to safe defaults
  }
}

/**
 * Actualiza los porcentajes de propina.
 * Requiere autenticación de admin.
 */
export async function updateTipPercentages(percentages: number[]) {
  const isAuth = await verifySession();
  if (!isAuth) {
    return { success: false, error: 'No autorizado' };
  }

  // Validación básica: array de 3 números, entre 0 y 100
  if (
    !Array.isArray(percentages) ||
    percentages.length !== 3 ||
    percentages.some((p) => p < 0 || p > 100)
  ) {
    return { success: false, error: 'Datos inválidos. Deben ser 3 porcentajes entre 0 y 100.' };
  }

  try {
    const pool = await getDbPool();

    // Upsert logic
    await pool.query(
      `
      INSERT INTO app_settings (setting_key, setting_value)
      VALUES ('tip_percentages', ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `,
      [JSON.stringify(percentages)]
    );

    revalidatePath('/'); // Revalidate home
    revalidatePath('/admin'); // Revalidate admin

    return { success: true };
  } catch (error) {
    console.error('Error updating tip percentages:', error);
    return { success: false, error: 'Error de base de datos' };
  }
}
