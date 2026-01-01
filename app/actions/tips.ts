'use server'

import { TipRecord } from "@/types";
import { getDbPool } from "@/lib/db";

/**
 * Guarda un registro de propina en la base de datos Neon (Postgres).
 */
export async function saveTipToDb(data: Omit<TipRecord, 'id' | 'createdAt' | 'synced' | 'userAgent'>, userAgent: string) {
  try {
    // Validación básica de entrada
    if (!data.tableNumber || !data.waiterName || !data.tipPercentage) {
      return { success: false, error: 'Faltan campos requeridos' };
    }

    if (![20, 23, 25].includes(data.tipPercentage)) {
      return { success: false, error: 'Porcentaje de propina inválido' };
    }

    if (data.tableNumber.length > 50) {
      return { success: false, error: 'Número de mesa demasiado largo' };
    }

    if (data.waiterName.length > 255) {
      return { success: false, error: 'Nombre de mesero demasiado largo' };
    }

    const pool = await getDbPool();

    // Postgres usa $1, $2, etc. para marcadores de posición
    // Usamos comillas para identificadores como "tableNumber" para seguridad con mayúsculas/minúsculas en Postgres
    const query = `
      INSERT INTO tips ("tableNumber", "waiterName", "tipPercentage", "userAgent") 
      VALUES ($1, $2, $3, $4)
    `;

    // Nota: El driver Neon/pg devuelve un objeto de resultado
    await pool.query(
      query,
      [
        data.tableNumber.trim(),
        data.waiterName.trim(),
        data.tipPercentage,
        userAgent?.substring(0, 255) || ''
      ]
    );

    // Si llegamos hasta aquí sin errores, todo salió bien
    return { success: true };
  } catch (error: any) {
    console.error("Error saving tip to Neon:", error);
    // Generic error fallback
    return { success: false, error: 'Database save failed' };
  }
}

/**
 * Recupera todos los registros de propinas de la base de datos Neon (Postgres).
 */
export async function fetchAllTips(): Promise<TipRecord[]> {
  try {
    const pool = await getDbPool();

    const result = await pool.query(
      `SELECT id, "tableNumber", "waiterName", "tipPercentage", "userAgent", "createdAt" 
           FROM tips 
           ORDER BY "createdAt" DESC`
    );

    // Neon/pg devuelve filas en result.rows
    return result.rows.map((tip: any) => ({
      id: tip.id?.toString() || '',
      tableNumber: tip.tableNumber,
      waiterName: tip.waiterName,
      tipPercentage: tip.tipPercentage,
      userAgent: tip.userAgent,
      createdAt: tip.createdAt.toISOString(), // Postgres date a string
      synced: true,
    })) as TipRecord[];

  } catch (error) {
    console.error("Error loading tips from Neon:", error);
    return [];
  }
}