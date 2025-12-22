import { Pool } from '@neondatabase/serverless';

let pool: Pool;

/**
 * Initializes the Neon (Postgres) connection pool (Singleton).
 * @returns {Promise<Pool>} The Neon connection pool.
 */
export async function getDbPool() {
  if (pool) {
    return pool;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not configured.');
  }

  try {
    // Configure the connection pool using the connection string
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: true, // Neon requires SSL
    });

    console.log('Neon (Postgres) Connection Pool initialized.');

    // 1. Verify connection and create table 'tips' if it doesn't exist
    // Note: Postgres uses SERIAL or GENERATED ALWAYS AS IDENTITY for auto-increment
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

    // Add indexes if they don't exist (Postgres doesn't support IF NOT EXISTS for indexes directly in older versions, 
    // but we can check or just rely on 'IF NOT EXISTS' if using Postgres 9.5+)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_created_at ON tips ("createdAt");`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_waiter_name ON tips ("waiterName");`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_table_number ON tips ("tableNumber");`);

    client.release(); // Release the client back to the pool
    console.log('Neon/Postgres table "tips" verified/created with indexes.');

  } catch (error) {
    console.error('Error establishing connection or verifying table in Neon:', error);
    throw error;
  }

  return pool;
}