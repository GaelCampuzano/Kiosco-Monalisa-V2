import mysql, { Pool } from 'mysql2/promise';

let pool: Pool;

// Configuración de la base de datos a partir de variables de entorno
// Configuración de la base de datos a partir de variables de entorno
const dbConfig: mysql.PoolOptions = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
  // Opciones recomendadas para un entorno de alto tráfico o Serverless:
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Configuración SSL para bases de datos en la nube (como Azure o AWS)
  ssl: process.env.MYSQL_SSL === 'true' ? {
    rejectUnauthorized: true
  } : undefined,
};

/**
 * Inicializa el pool de conexiones de MySQL (Singleton) y verifica la tabla.
 * @returns {Promise<Pool>} El pool de conexiones de MySQL.
 */
export async function getDbPool() {
  if (pool) {
    return pool;
  }

  // Validación básica de credenciales
  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    throw new Error('Database environment variables (MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE) are not fully configured.');
  }

  try {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL Connection Pool initialized.');

    const connection = await pool.getConnection();
    // 1. Crear la tabla 'tips' si no existe
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tableNumber VARCHAR(50) NOT NULL,
        waiterName VARCHAR(255) NOT NULL,
        tipPercentage INT NOT NULL,
        amount DECIMAL(10, 2),
        idempotency_key VARCHAR(36) UNIQUE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (createdAt),
        INDEX idx_waiter_name (waiterName),
        INDEX idx_table_number (tableNumber)
      );
    `);
    connection.release(); // Libera la conexión
    console.log('MySQL table "tips" verified/created with indexes.');

    // 2. Crear la tabla 'waiters' si no existe
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS waiters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        active BOOLEAN DEFAULT TRUE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_active (active),
        INDEX idx_name (name)
      );
    `);
    console.log('MySQL table "waiters" verified/created.');

  } catch (error) {
    console.error('Error establishing connection or verifying table in MySQL:', error);
    // Vuelve a lanzar el error para detener el proceso si la conexión/tabla falla
    throw error;
  }

  return pool;
}