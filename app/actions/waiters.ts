'use server';

import { getDbPool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Waiter {
    id: number;
    name: string;
    active: boolean;
}

/**
 * Obtiene la lista de meseros activos ordenada alfabéticamente.
 */
export async function getActiveWaiters(): Promise<Waiter[]> {
    try {
        const pool = await getDbPool();
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT id, name, active FROM waiters WHERE active = true ORDER BY name ASC`
        );

        return rows as Waiter[];
    } catch (error) {
        console.error("Error fetching active waiters:", error);
        return [];
    }
}

/**
 * Obtiene TODOS los meseros (activos e inactivos) para el admin.
 */
export async function getAllWaiters(): Promise<Waiter[]> {
    try {
        const pool = await getDbPool();
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT id, name, active FROM waiters ORDER BY active DESC, name ASC`
        );

        return (rows as RowDataPacket[]).map(row => ({
            id: row.id,
            name: row.name,
            active: !!row.active // Convertir 1/0 a boolean
        }));
    } catch (error) {
        console.error("Error fetching all waiters:", error);
        return [];
    }
}

/**
 * Crea un nuevo mesero.
 * Retorna el mesero creado o error.
 */
export async function createWaiter(name: string): Promise<{ success: boolean; waiter?: Waiter; error?: string }> {
    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
        return { success: false, error: "El nombre es muy corto." };
    }

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
            active: true
        };

        return { success: true, waiter: newWaiter };
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, error: "Este mesero ya existe." };
        }
        console.error("Error creating waiter:", error);
        return { success: false, error: "Error al guardar mesero." };
    }
}

/**
 * Cambia el estado activo/inactivo de un mesero.
 */
export async function toggleWaiterStatus(id: number, currentStatus: boolean): Promise<{ success: boolean; error?: string }> {
    try {
        const pool = await getDbPool();
        await pool.execute(
            `UPDATE waiters SET active = ? WHERE id = ?`,
            [!currentStatus, id]
        );
        return { success: true };
    } catch (error) {
        console.error("Error toggling waiter status:", error);
        return { success: false, error: "Error al actualizar estado." };
    }
}

/**
 * Actualiza el nombre de un mesero.
 */
export async function updateWaiterName(id: number, newName: string): Promise<{ success: boolean; error?: string }> {
    const cleanName = newName.trim();
    if (!cleanName || cleanName.length < 2) {
        return { success: false, error: "Nombre muy corto." };
    }

    try {
        const pool = await getDbPool();
        await pool.execute(
            `UPDATE waiters SET name = ? WHERE id = ?`,
            [cleanName, id]
        );
        return { success: true };
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, error: "Ya existe un mesero con ese nombre." };
        }
        console.error("Error updating waiter:", error);
        return { success: false, error: "Error al actualizar mesero." };
    }
}
