import mysql, { Pool } from 'mysql2/promise';

let pool: Pool;

// Configuración de la base de datos a partir de variables de entorno
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Opciones recomendadas para un entorno de alto tráfico o Serverless:
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
    throw new Error('Database environment variables (DB_HOST, DB_USER, DB_NAME) are not fully configured.');
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
        userAgent VARCHAR(255),
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    connection.release(); // Libera la conexión
    console.log('MySQL table "tips" verified/created.');
    
  } catch (error) {
    console.error('Error establishing connection or verifying table in MySQL:', error);
    // Vuelve a lanzar el error para detener el proceso si la conexión/tabla falla
    throw error; 
  }

  return pool;
}