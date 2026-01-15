'use server';

import { TipRecord } from '@/types';
import { getDbPool } from '@/lib/db';
// import { TIP_PERCENTAGES } from "@/lib/config";
// [CORRECCIÓN CLAVE]: Importar TipRow para el tipado correcto de consultas SELECT
import { TipRow } from '@/types/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

import { TipSchema } from '@/lib/schemas';

/**
 * Guarda un registro de propina en la base de datos MySQL.
 */
export async function saveTipToDb(data: Omit<TipRecord, 'id' | 'createdAt' | 'synced'>) {
  try {
    const validation = TipSchema.safeParse(data);

    if (!validation.success) {
      console.error('Validation error:', validation.error.format());
      return { success: false, error: validation.error.errors[0].message };
    }

    const validData = validation.data;

    const pool = await getDbPool();

    // Ejecuta la inserción en MySQL
    const query = `
      INSERT INTO tips (tableNumber, waiterName, tipPercentage, idempotency_key) 
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      validData.tableNumber,
      validData.waiterName,
      validData.tipPercentage,
      validData.idempotencyKey || null,
    ]);

    // Verifica que la inserción haya sido exitosa
    if ((result as ResultSetHeader).affectedRows === 0) {
      throw new Error('MySQL insert failed, no rows affected.');
    }

    return { success: true };
  } catch (error: unknown) {
    // Si es un error de duplicado por idempotency_key, lo consideramos éxito (ya se guardó antes)
    if (
      (error as { code?: string }).code === 'ER_DUP_ENTRY' &&
      (error as { sqlMessage?: string }).sqlMessage?.includes('idempotency_key')
    ) {
      console.warn('Duplicate tip detected (idempotency), treating as success.');
      return { success: true };
    }

    console.error('Error al guardar propina en MySQL:', error);
    // Devuelve un error para activar el modo offline/fallback en el cliente
    // [DEBUG]: Devolvemos el mensaje real del error para depuración
    return {
      success: false,
      error: `Database save failed: ${(error as Error).message || String(error)}`,
    };
  }
}

import { requireAuth, verifySession } from '@/lib/auth-check';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _filters?: TipsFilter
): Promise<PaginatedResponse> {
  try {
    await requireAuth();
    const pool = await getDbPool();
    const offset = (page - 1) * limit;

    // Construcción dinámica de filtros
    const whereClause = '1=1';
    const queryParams: (string | number | Date)[] = [];

    // 1. Obtener total de registros para paginación
    const countQuery = `SELECT COUNT(*) as total FROM tips WHERE ${whereClause}`;
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, queryParams);
    // [FIX]: Convertir BigInt a Number para evitar error de serialización en Server Actions
    const total = Number(countRows[0]?.total || 0);
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

    const [rows] = await pool.query<TipRow[]>(dataQuery, queryParams);

    const data = (rows as TipRow[]).map((tip) => ({
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
      currentPage: page,
    };
  } catch (error) {
    console.error('Error al cargar propinas paginadas:', error);
    // [DEBUG]: Log error detail
    if (error instanceof Error) console.error(error.stack);
    return { data: [], total: 0, pages: 0, currentPage: 1 };
  }
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
  const isAuth = await verifySession();
  if (!isAuth) {
    return { totalTips: 0, avgPercentage: 0, topWaiter: '-' };
  }

  try {
    const pool = await getDbPool();

    // Construcción dinámica de filtros usando el helper
    const { whereClause, queryParams } = buildTipsQuery(filters);

    // Calcular Promedio y Total
    const statsQuery = `
      SELECT 
        COUNT(*) as total, 
        AVG(tipPercentage) as average 
      FROM tips 
      WHERE ${whereClause}
    `;
    const [statsRows] = await pool.query<RowDataPacket[]>(statsQuery, queryParams);
    const total = Number(statsRows[0]?.total || 0);
    const avg = Number(statsRows[0]?.average || 0);

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
    const topWaiter = waiterRows[0]?.waiterName || '-';

    return {
      totalTips: total,
      avgPercentage: parseFloat(avg.toFixed(1)),
      topWaiter,
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return { totalTips: 0, avgPercentage: 0, topWaiter: '-' };
  }
}

/**
 * Obtiene TODAS las propinas que coinciden con los filtros para exportación.
 * Sin paginación (o con un límite muy alto de seguridad).
 */
export async function exportTipsCSV(filters?: TipsFilter): Promise<TipRecord[]> {
  try {
    await requireAuth();
    const pool = await getDbPool();
    const { whereClause, queryParams } = buildTipsQuery(filters);

    const query = `
      SELECT id, tableNumber, waiterName, tipPercentage, createdAt 
      FROM tips 
      WHERE ${whereClause}
      ORDER BY createdAt DESC
      LIMIT 10000 
    `; // Límite de seguridad de 10k registros

    const [rows] = await pool.query<TipRow[]>(query, queryParams);

    return (rows as TipRow[]).map((tip) => ({
      id: tip.id?.toString() || '',
      tableNumber: tip.tableNumber.toString(),
      waiterName: tip.waiterName,
      tipPercentage: tip.tipPercentage,
      createdAt: tip.createdAt.toString(),
      synced: true,
    })) as TipRecord[];
  } catch (error) {
    console.error('Error fetching tips for export:', error);
    throw new Error('Failed to fetch tips for export');
  }
}

/**
 * Helper privado para construir la cláusula WHERE y parámetros.
 * Evita duplicación de lógica de filtrado.
 */
function buildTipsQuery(filters?: TipsFilter) {
  let whereClause = '1=1';
  const queryParams: (string | number | Date)[] = [];

  if (filters?.startDate) {
    whereClause += ' AND createdAt >= ?';
    queryParams.push(filters.startDate);
  }

  if (filters?.endDate) {
    whereClause += ' AND createdAt <= ?';
    queryParams.push(new Date(new Date(filters.endDate).setHours(23, 59, 59, 999)));
  }

  if (filters?.search) {
    whereClause += ' AND (waiterName LIKE ? OR tableNumber LIKE ?)';
    const term = `%${filters.search}%`;
    queryParams.push(term, term);
  }

  return { whereClause, queryParams };
}
