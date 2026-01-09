'use server'

import { TipRecord } from "@/types";
import { getDbPool } from "@/lib/db";
// [CORRECCIÓN CLAVE]: Importar RowDataPacket para el tipado correcto de consultas SELECT
import { RowDataPacket } from 'mysql2/promise';

/**
 * Guarda un registro de propina en la base de datos MySQL.
 */
export async function saveTipToDb(data: Omit<TipRecord, 'id' | 'createdAt' | 'synced' | 'userAgent'>, userAgent: string) {
  try {
    // Validación básica de entrada
    if (!data.tableNumber || !data.waiterName || !data.tipPercentage) {
      return { success: false, error: 'Missing required fields' };
    }

    if (![20, 23, 25].includes(data.tipPercentage)) {
      return { success: false, error: 'Invalid tip percentage' };
    }

    if (data.tableNumber.length > 50) {
      return { success: false, error: 'Table number too long' };
    }

    if (data.waiterName.length > 255) {
      return { success: false, error: 'Waiter name too long' };
    }

    const pool = await getDbPool();

    // Ejecuta la inserción en MySQL
    const query = `
      INSERT INTO tips (tableNumber, waiterName, tipPercentage, userAgent, idempotency_key) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(
      query,
      [
        data.tableNumber.trim(),
        data.waiterName.trim(),
        data.tipPercentage,
        userAgent?.substring(0, 255) || '',
        data.idempotencyKey || null
      ]
    );

    // Verifica que la inserción haya sido exitosa
    if ((result as any).affectedRows === 0) {
      throw new Error('MySQL insert failed, no rows affected.');
    }

    return { success: true };
  } catch (error: any) {
    // Si es un error de duplicado por idempotency_key, lo consideramos éxito (ya se guardó antes)
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage?.includes('idempotency_key')) {
      console.warn("Duplicate tip detected (idempotency), treating as success.");
      return { success: true };
    }

    console.error("Error al guardar propina en MySQL:", error);
    // Devuelve un error para activar el modo offline/fallback en el cliente
    return { success: false, error: 'Database save failed' };
  }
}

/**
 * Obtiene todos los registros de propinas de la base de datos MySQL.
 */
export async function fetchAllTips(): Promise<TipRecord[]> {
  try {
    const pool = await getDbPool();

    // [CORRECCIÓN APLICADA]: Se usa RowDataPacket[] para evitar el error de compilación.
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, tableNumber, waiterName, tipPercentage, userAgent, createdAt 
           FROM tips 
           ORDER BY createdAt DESC`
    );

    // Mapeamos los resultados (que ahora son RowDataPacket[]) a TipRecord[]
    return (rows as RowDataPacket[]).map(tip => ({
      // Aseguramos que todos los campos sean del tipo correcto para el frontend
      id: tip.id?.toString() || '',
      tableNumber: tip.tableNumber.toString(),
      waiterName: tip.waiterName,
      tipPercentage: tip.tipPercentage,
      userAgent: tip.userAgent,
      createdAt: tip.createdAt.toString(),
      synced: true,
    })) as TipRecord[];

  } catch (error) {
    console.error("Error al cargar propinas desde MySQL:", error);
    return [];
  }
}