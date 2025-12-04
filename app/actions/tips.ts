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
    const pool = await getDbPool();
    
    // Ejecuta la inserción en MySQL
    const query = `
      INSERT INTO tips (tableNumber, waiterName, tipPercentage, userAgent) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(
      query,
      [data.tableNumber, data.waiterName, data.tipPercentage, userAgent]
    );

    // Verifica que la inserción haya sido exitosa
    if ((result as any).affectedRows === 0) {
        throw new Error('MySQL insert failed, no rows affected.');
    }

    return { success: true };
  } catch (error) {
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