'use server'

import { TipRecord } from "@/types";
import { getDbPool } from "@/lib/db";

/**
 * Saves a tip record to the Neon (Postgres) database.
 */
export async function saveTipToDb(data: Omit<TipRecord, 'id' | 'createdAt' | 'synced' | 'userAgent'>, userAgent: string) {
  try {
    // Basic input validation
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

    // Postgres uses $1, $2, etc. for placeholders
    // We quote identifiers like "tableNumber" to be safe with mixed casing in Postgres definition
    const query = `
      INSERT INTO tips ("tableNumber", "waiterName", "tipPercentage", "userAgent") 
      VALUES ($1, $2, $3, $4)
    `;

    // Note: Neon/pg driver 'query' returns a result object.
    await pool.query(
      query,
      [
        data.tableNumber.trim(),
        data.waiterName.trim(),
        data.tipPercentage,
        userAgent?.substring(0, 255) || ''
      ]
    );

    // If we reach here without error, it succeeded.
    return { success: true };
  } catch (error: any) {
    console.error("Error saving tip to Neon:", error);
    // Generic error fallback
    return { success: false, error: 'Database save failed' };
  }
}

/**
 * Fetches all tip records from the Neon (Postgres) database.
 */
export async function fetchAllTips(): Promise<TipRecord[]> {
  try {
    const pool = await getDbPool();

    const result = await pool.query(
      `SELECT id, "tableNumber", "waiterName", "tipPercentage", "userAgent", "createdAt" 
           FROM tips 
           ORDER BY "createdAt" DESC`
    );

    // Neon/pg returns rows in result.rows
    return result.rows.map((tip: any) => ({
      id: tip.id?.toString() || '',
      tableNumber: tip.tableNumber,
      waiterName: tip.waiterName,
      tipPercentage: tip.tipPercentage,
      userAgent: tip.userAgent,
      createdAt: tip.createdAt.toISOString(), // Postgres date to string
      synced: true,
    })) as TipRecord[];

  } catch (error) {
    console.error("Error loading tips from Neon:", error);
    return [];
  }
}