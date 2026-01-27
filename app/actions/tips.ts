'use server';

import { TipRecord } from '@/types';
import { getDbPool } from '@/lib/db';
// [CORRECCIÓN CLAVE]: Importar TipRow para el tipado correcto de consultas SELECT
import { TipRow } from '@/types/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

import { TipSchema } from '@/lib/schemas';
import { headers } from 'next/headers';

/**
 * Guarda un registro de propina en la base de datos MySQL.
 *
 * @param data - Objeto con los datos de la propina (mesa, mesero, porcentaje y clave de idempotencia).
 * @returns Un objeto indicando éxito o un mensaje de error si falla la validación o la inserción.
 *
 * FUNCIONALIDAD:
 * 1. Valida los datos de entrada usando Zod (TipSchema).
 * 2. Conecta a la base de datos.
 * 3. Ejecuta una consulta INSERT protegida contra inyección SQL.
 * 4. Maneja duplicados usando `idempotency_key` para evitar cobros dobles en red inestable.
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

    // Capturar metadatos del dispositivo para auditoría/prevención de fraude
    const headerList = await headers();
    const ip =
      headerList.get('x-forwarded-for')?.split(',')[0] || headerList.get('x-real-ip') || 'unknown';
    const userAgent = headerList.get('user-agent') || 'unknown';

    // Ejecuta la inserción en MySQL
    const query = `
      INSERT INTO tips (tableNumber, waiterName, tipPercentage, idempotency_key, ip_address, user_agent) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      validData.tableNumber,
      validData.waiterName,
      validData.tipPercentage,
      validData.idempotencyKey || null,
      ip,
      userAgent.substring(0, 500),
    ]);

    // Verifica que la inserción haya sido exitosa
    if ((result as ResultSetHeader).affectedRows === 0) {
      throw new Error('La inserción en MySQL falló, no se afectaron filas.');
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
 * PROTEGIDO: Solo accesible para administradores autenticados.
 *
 * @param page - Número de página actual (por defecto 1).
 * @param limit - Cantidad de registros por página (por defecto 20).
 * @param _filters - Filtros opcionales (fecha, búsqueda).
 * @returns Objeto con los datos paginados y metadatos de paginación.
 */
export async function getTips(
  page: number = 1,
  limit: number = 10,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _filters?: TipsFilter
): Promise<PaginatedResponse> {
  try {
    // Verificación de seguridad
    await requireAuth();
    const pool = await getDbPool();
    const offset = (page - 1) * limit;

    // Construcción dinámica de filtros (WHERE clause)
    const whereClause = '1=1';
    const queryParams: (string | number | Date)[] = [];

    // 1. Obtener total de registros para calcular el número de páginas
    const countQuery = `SELECT COUNT(*) as total FROM tips WHERE ${whereClause}`;
    const [countRows] = await pool.query<RowDataPacket[]>(countQuery, queryParams);
    // [FIX]: Convertir BigInt a Number para evitar error de serialización en Server Actions
    const total = Number(countRows[0]?.total || 0);
    const pages = Math.ceil(total / limit);

    // 2. Obtener los datos reales paginados
    const dataQuery = `
      SELECT id, tableNumber, waiterName, tipPercentage, createdAt, ip_address, user_agent
      FROM tips 
      WHERE ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;

    // Añadir limit y offset al final de los parámetros de la consulta
    queryParams.push(limit, offset);

    const [rows] = await pool.query<TipRow[]>(dataQuery, queryParams);

    // Mapeo de datos de la DB al formato de la aplicación
    const data = (rows as TipRow[]).map((tip) => ({
      id: tip.id?.toString() || '',
      tableNumber: tip.tableNumber.toString(),
      waiterName: tip.waiterName,
      tipPercentage: tip.tipPercentage,
      createdAt: tip.createdAt.toString(),
      ipAddress: tip.ip_address,
      userAgent: tip.user_agent,
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
    return { data: [], total: 0, pages: 0, currentPage: 1 };
  }
}

export type TipsStats = {
  totalTips: number;
  avgPercentage: number;
  topWaiter: string;
};

/**
 * Calcula estadísticas agregadas (KPIs) basadas en los filtros actuales.
 * Utilizado para mostrar las tarjetas de resumen en el panel de administración.
 *
 * @param filters - Filtros a aplicar al cálculo (ej. rango de fechas).
 * @returns Estadísticas clave: Total de propinas, Promedio de porcentaje y Mesero estrella.
 */
export async function getTipsStats(filters?: TipsFilter): Promise<TipsStats> {
  const isAuth = await verifySession();
  if (!isAuth) {
    return { totalTips: 0, avgPercentage: 0, topWaiter: '-' };
  }

  try {
    const pool = await getDbPool();

    // Construcción dinámica de filtros usando el helper privado
    const { whereClause, queryParams } = buildTipsQuery(filters);

    // Calcular Promedio y Total General
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

    // Calcular Mesero con más propinas (Top Waiter)
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
 * Obtiene TODAS las propinas que coinciden con los filtros para generar un archivo CSV.
 * A diferencia de `getTips`, esta función no pagina, pero tiene un límite de seguridad.
 *
 * @param filters - Filtros para seleccionar qué datos exportar.
 * @returns Array de registros de propinas listos para exportar.
 */
export async function exportTipsCSV(filters?: TipsFilter): Promise<TipRecord[]> {
  try {
    await requireAuth();
    const pool = await getDbPool();
    const { whereClause, queryParams } = buildTipsQuery(filters);

    const query = `
      SELECT id, tableNumber, waiterName, tipPercentage, createdAt, ip_address, user_agent
      FROM tips 
      WHERE ${whereClause}
      ORDER BY createdAt DESC
      LIMIT 10000 
    `; // Límite de seguridad de 10k registros para proteger la memoria del servidor

    const [rows] = await pool.query<TipRow[]>(query, queryParams);

    return (rows as TipRow[]).map((tip) => ({
      id: tip.id?.toString() || '',
      tableNumber: tip.tableNumber.toString(),
      waiterName: tip.waiterName,
      tipPercentage: tip.tipPercentage,
      createdAt: tip.createdAt.toString(),
      ipAddress: tip.ip_address,
      userAgent: tip.user_agent,
      synced: true,
    })) as TipRecord[];
  } catch (error) {
    console.error('Error al exportar propinas:', error);
    throw new Error('Error al obtener propinas para exportación');
  }
}

/**
 * Función auxiliar privada para construir la cláusula WHERE SQL y sus parámetros.
 * Permite reutilizar la lógica de filtrado entre `getTips`, `getTipsStats` y `exportTipsCSV`.
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
