import { Pool } from '@neondatabase/serverless';

let pool: Pool;

/**
 * Inicializa el pool de conexiones a Neon (Postgres) utilizando el patrón Singleton.
 * @returns {Promise<Pool>} El pool de conexiones a Neon.
 */
export async function getDbPool() {
  if (pool) {
    return pool;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('La variable de entorno DATABASE_URL no está configurada.');
  }

  try {
    // Configurar el pool de conexiones usando la cadena de conexión
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: true, // Neon requiere SSL
    });

    // 1. Verificar conexión y crear la tabla 'tips' si no existe
    // Nota: Postgres usa SERIAL o GENERATED ALWAYS AS IDENTITY para auto-incremento
    const client = await pool.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS tips (
        id SERIAL PRIMARY KEY,
        "tableNumber" VARCHAR(50) NOT NULL,
        "waiterName" VARCHAR(255) NOT NULL,
        "tipPercentage" INT NOT NULL,
        amount DECIMAL(10, 2),
        "userAgent" VARCHAR(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Agregar índices si no existen (Postgres no soporta IF NOT EXISTS para índices directamente en versiones antiguas,
    // pero podemos confiar en la verificación de errores o lógica condicional si fuera necesario, aquí lo mantenemos simple)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_created_at ON tips ("createdAt");`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_waiter_name ON tips ("waiterName");`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_table_number ON tips ("tableNumber");`);

    client.release(); // Liberar el cliente de vuelta al pool

  } catch (error) {
    console.error('Error estableciendo conexión o verificando tabla en Neon:', error);
    throw error;
  }

  return pool;
}