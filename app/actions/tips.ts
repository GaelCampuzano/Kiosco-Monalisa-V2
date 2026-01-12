'use server'

import { TipRecord } from "@/types";
import { getDbPool } from "@/lib/db";
import { TIP_PERCENTAGES } from "@/lib/config";
// [CORRECCIÓN CLAVE]: Importar RowDataPacket para el tipado correcto de consultas SELECT
import { RowDataPacket } from 'mysql2/promise';

/**
 * Guarda un registro de propina en la base de datos MySQL.
 */
export async function saveTipToDb(data: Omit<TipRecord, 'id' | 'createdAt' | 'synced'>) {
  try {
    // Validación básica de entrada
    if (!data.tableNumber || !data.waiterName || !data.tipPercentage) {
      return { success: false, error: 'Missing required fields' };
    }

    // @ts-ignore - Validamos que el porcentaje esté en la lista permitida en lib/config.ts
    if (!TIP_PERCENTAGES.includes(data.tipPercentage as any)) {
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
      INSERT INTO tips (tableNumber, waiterName, tipPercentage, idempotency_key) 
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.execute(
      query,
      [
        data.tableNumber.trim(),
        data.waiterName.trim(),
        data.tipPercentage,
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
    // [DEBUG]: Devolvemos el mensaje real del error para depuración
    return { success: false, error: `Database save failed: ${error.message || String(error)}` };
  }
}

import { cookies } from 'next/headers';

export type TipsFilter = {
  startDate?: string;
  endDate?: string;
  search?: string;
};

export type PaginatedResponse = {
  data: TipRecord[];
  total: number;
  pages: number;
  currentPage: number;
};

/**
 * Obtiene registros de propinas con paginación y filtros.
 * PROTEGIDO: Solo accesible para administradores.
 */
export async function getTips(
  page: number = 1,
  limit: number = 20,
  filters?: TipsFilter
): Promise<PaginatedResponse> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('monalisa_admin_session');

  if (!authCookie || authCookie.value !== 'authenticated') {
    throw new Error("Unauthorized");
  }

  try {
    const pool = await getDbPool();
    const offset = (page - 1) * limit;

    // Construcción dinámica de filtros
    let whereClause = "1=1";
    const queryParams: any[] = [];

    if (filters?.startDate) {
      whereClause += " AND createdAt >= ?";
      queryParams.push(filters.startDate);
    }

    if (filters?.endDate) {
      whereClause += " AND createdAt <= ?";
      queryParams.push(new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)));
    }

    if (filters?.search) {
      whereClause += " AND (waiterName LIKE ? OR tableNumber LIKE ?)";
      const term = `%${filters.search}%`;
      queryParams.push(term, term);
    }

    // 1. Obtener total de registros para paginación
    const countQuery = `SELECT COUNT(*) as total FROM tips WHERE ${whereClause}`;
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, queryParams);
    const total = (countRows[0] as any).total;
    const pages = Math.ceil(total / limit);

    // 2. Obtener datos paginados
    const dataQuery = `
      SELECT id, tableNumber, waiterName, tipPercentage, createdAt 
      FROM tips 
      WHERE ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;

    // Añadir limit y offset al final de los params
    queryParams.push(limit, offset);

    const [rows] = await pool.query<RowDataPacket[]>(dataQuery, queryParams);

    const data = (rows as RowDataPacket[]).map(tip => ({
      id: tip.id?.toString() || '',
      tableNumber: tip.tableNumber.toString(),
      waiterName: tip.waiterName,
      tipPercentage: tip.tipPercentage,
      createdAt: tip.createdAt.toString(),
      synced: true,
    })) as TipRecord[];

    return {
      data,
      total,
      pages,
      currentPage: page
    };

  } catch (error) {
    console.error("Error al cargar propinas paginadas:", error);
    // Retornar estructura vacía en caso de error para no romper la UI
    return { data: [], total: 0, pages: 0, currentPage: 1 };
  }
}

/**
 * Mantenemos fetchAllTips para retrocompatibilidad temporal si es necesario, 
 * pero idealmente debería eliminarse o redirigir a getTips.
 */
export async function fetchAllTips(): Promise<TipRecord[]> {
  // Wrapper simple para no romper usages existentes inmediatamente
  const result = await getTips(1, 1000);
  return result.data;
}

export type TipsStats = {
  totalTips: number;
  avgPercentage: number;
  topWaiter: string;
};

/**
 * Calcula estadísticas agregadas basadas en los filtros actuales.
 */
export async function getTipsStats(filters?: TipsFilter): Promise<TipsStats> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('monalisa_admin_session');

  if (!authCookie || authCookie.value !== 'authenticated') {
    return { totalTips: 0, avgPercentage: 0, topWaiter: '-' };
  }

  try {
    const pool = await getDbPool();

    let whereClause = "1=1";
    const queryParams: any[] = [];

    if (filters?.startDate) {
      whereClause += " AND createdAt >= ?";
      queryParams.push(filters.startDate);
    }

    if (filters?.endDate) {
      whereClause += " AND createdAt <= ?";
      queryParams.push(new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)));
    }

    if (filters?.search) {
      whereClause += " AND (waiterName LIKE ? OR tableNumber LIKE ?)";
      const term = `%${filters.search}%`;
      queryParams.push(term, term);
    }

    // Calcular Promedio y Total
    const statsQuery = `
      SELECT 
        COUNT(*) as total, 
        AVG(tipPercentage) as average 
      FROM tips 
      WHERE ${whereClause}
    `;
    const [statsRows] = await pool.query<RowDataPacket[]>(statsQuery, queryParams);
    const total = (statsRows[0] as any).total || 0;
    const avg = Number((statsRows[0] as any).average || 0);

    // Calcular Top Waiter (requiere subconsulta o group by separado)
    const waiterQuery = `
      SELECT waiterName, COUNT(*) as count 
      FROM tips 
      WHERE ${whereClause}
      GROUP BY waiterName 
      ORDER BY count DESC 
      LIMIT 1
    `;
    const [waiterRows] = await pool.query<RowDataPacket[]>(waiterQuery, queryParams);
    const topWaiter = (waiterRows[0] as any)?.waiterName || "-";

    return {
      totalTips: total,
      avgPercentage: parseFloat(avg.toFixed(1)),
      topWaiter
    };

  } catch (error) {
    console.error("Error calculating stats:", error);
    return { totalTips: 0, avgPercentage: 0, topWaiter: '-' };
  }
}