'use server';

import { unstable_cache, revalidatePath } from 'next/cache';
import { getDbPool } from '@/lib/db';
import { ResultSetHeader } from 'mysql2/promise';
import { verifySession } from '@/lib/auth-check';
import { WaiterRow } from '@/types/db';

export interface Waiter {
  id: number;
  name: string;
  active: boolean;
}

/**
 * Obtiene la lista de meseros activos ordenada alfabéticamente.
 */
export const getActiveWaiters = unstable_cache(
  async (): Promise<Waiter[]> => {
    try {
      const pool = await getDbPool();
      const [rows] = await pool.query<WaiterRow[]>(
        `SELECT id, name, active FROM waiters WHERE active = true ORDER BY name ASC`
      );

      return (rows as WaiterRow[]).map((row) => ({
        id: Number(row.id),
        name: String(row.name),
        active: !!row.active,
      }));
    } catch (error) {
      console.error('Error fetching active waiters:', error);
      return [];
    }
  },
  ['active-waiters'],
  { revalidate: 3600, tags: ['waiters'] }
);

/**
 * Obtiene TODOS los meseros (activos e inactivos) para el admin.
 */
export async function getAllWaiters(): Promise<Waiter[]> {
  try {
    const pool = await getDbPool();
    const [rows] = await pool.query<WaiterRow[]>(
      `SELECT id, name, active FROM waiters ORDER BY active DESC, name ASC`
    );

    return (rows as WaiterRow[]).map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      active: !!row.active,
    }));
  } catch (error) {
    console.error('Error fetching all waiters:', error);
    return [];
  }
}

import { CreateWaiterSchema } from '@/lib/schemas';

/**
 * Crea un nuevo mesero.
 * Retorna el mesero creado o error.
 */
export async function createWaiter(
  name: string
): Promise<{ success: boolean; waiter?: Waiter; error?: string }> {
  const isAuth = await verifySession();
  if (!isAuth) return { success: false, error: 'No autorizado' };

  const validation = CreateWaiterSchema.safeParse({ name });

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  const { name: cleanName } = validation.data;

  try {
    const pool = await getDbPool();

    // Insertar nuevo mesero
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO waiters (name, active) VALUES (?, true)`,
      [cleanName]
    );

    const newWaiter: Waiter = {
      id: result.insertId,
      name: cleanName,
      active: true,
    };

    revalidatePath('/', 'layout');
    return { success: true, waiter: newWaiter };
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Este mesero ya existe.' };
    }
    console.error('Error creating waiter:', error);
    return { success: false, error: 'Error al guardar mesero.' };
  }
}

/**
 * Cambia el estado activo/inactivo de un mesero.
 */
export async function toggleWaiterStatus(
  id: number,
  currentStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifySession();
  if (!isAuth) return { success: false, error: 'No autorizado' };

  try {
    const pool = await getDbPool();
    await pool.execute(`UPDATE waiters SET active = ? WHERE id = ?`, [!currentStatus, id]);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Error toggling waiter status:', error);
    return { success: false, error: 'Error al actualizar estado.' };
  }
}

/**
 * Actualiza el nombre de un mesero.
 */
export async function updateWaiterName(
  id: number,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifySession();
  if (!isAuth) return { success: false, error: 'No autorizado' };

  const cleanName = newName.trim();
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Nombre muy corto.' };
  }

  try {
    const pool = await getDbPool();
    await pool.execute(`UPDATE waiters SET name = ? WHERE id = ?`, [cleanName, id]);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Ya existe un mesero con ese nombre.' };
    }
    console.error('Error updating waiter:', error);
    return { success: false, error: 'Error al actualizar mesero.' };
  }
}
