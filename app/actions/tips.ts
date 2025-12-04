'use server'

import { TipRecord } from "@/types";
import { getDbPool } from "@/lib/db";

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
        
        // Consulta todos los registros, ordenados por fecha de creación descendente
        const [rows] = await pool.query<TipRecord[]>(
          `SELECT id, tableNumber, waiterName, tipPercentage, userAgent, createdAt 
           FROM tips 
           ORDER BY createdAt DESC`
        );

        // Mapeamos los resultados para asegurar el tipo correcto para el frontend
        return (rows as any[]).map(tip => ({
            ...tip,
            id: tip.id?.toString() || '', // Asegura que el ID es un string
            synced: true, // Siempre true, ya que está en el almacenamiento principal
        })) as TipRecord[];
        
    } catch (error) {
        console.error("Error al cargar propinas desde MySQL:", error);
        return [];
    }
}