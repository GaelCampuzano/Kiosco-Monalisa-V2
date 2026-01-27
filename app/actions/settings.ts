/**
 * Acciones de Servidor para la Configuración Global (Settings)
 * Gestiona la persistencia de los porcentajes de propina en la base de datos MySQL.
 */

'use server';

import { unstable_cache, revalidatePath } from 'next/cache';
import { getDbPool } from '@/lib/db';

import { SettingsRow } from '@/types/db';
import { TIP_PERCENTAGES } from '@/lib/config';
import { verifySession } from '@/lib/auth-check';

/**
 * Obtiene los porcentajes de propina configurados actualmente en el sistema.
 */
export const getTipPercentages = unstable_cache(
  async (): Promise<number[]> => {
    try {
      const pool = await getDbPool();
      const [rows] = await pool.query<SettingsRow[]>(
        "SELECT setting_value FROM app_settings WHERE setting_key = 'tip_percentages'"
      );

      if (rows.length > 0) {
        const value = rows[0].setting_value;
        return Array.isArray(value) ? value : JSON.parse(value as unknown as string);
      }

      return [...TIP_PERCENTAGES];
    } catch (error) {
      console.error('Error al obtener porcentajes desde MySQL:', error);
      return [...TIP_PERCENTAGES];
    }
  },
  ['tip-percentages'],
  { revalidate: 3600, tags: ['settings'] }
);

/**
 * Actualiza los porcentajes de propina en la base de datos.
 * Requiere una sesión de administrador válida.
 *
 * @param percentages Array con los nuevos porcentajes (deben ser exactamente 3).
 * @returns Objeto con el estatus de la operación y mensajes de error si aplica.
 */
export async function updateTipPercentages(percentages: number[]) {
  const isAuth = await verifySession();
  if (!isAuth) {
    return { success: false, error: 'No autorizado - Debes ser administrador' };
  }

  // Validación de Integridad de Datos: Array de 3 números enteros positivos (0-100)
  if (
    !Array.isArray(percentages) ||
    percentages.length !== 3 ||
    percentages.some((p) => p < 0 || p > 100)
  ) {
    return { success: false, error: 'Datos inválidos. Se requieren 3 porcentajes entre 0 y 100.' };
  }

  try {
    const pool = await getDbPool();

    // Lógica de UPSERT (Insertar o Actualizar si la clave ya existe)
    await pool.query(
      `
      INSERT INTO app_settings (setting_key, setting_value)
      VALUES ('tip_percentages', ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updatedAt = CURRENT_TIMESTAMP
    `,
      [JSON.stringify(percentages)]
    );

    // Obligar a Next.js a refrescar el caché de los componentes de servidor que usan estos datos
    revalidatePath('/', 'layout');
    revalidatePath('/admin', 'page');

    return { success: true };
  } catch (error) {
    console.error('Error al persistir configuración en MySQL:', error);
    return { success: false, error: 'Fallo crítico de base de datos' };
  }
}
