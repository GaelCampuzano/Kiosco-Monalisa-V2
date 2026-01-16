import mysql from 'mysql2/promise';

/**
 * Variable global para mantener la conexión (pool) en memoria
 * durante el ciclo de vida de la aplicación en desarrollo.
 * Evita múltiples conexiones al recargar en HMR (Hot Module Replacement).
 */
let pool: mysql.Pool | null = null;

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
  // Manejo de tipos de datos para evitar errores de serialización en Next.js
  supportBigNumbers: true,
  bigNumberStrings: true, // IDs grandes y COUNT(*) serán strings
  decimalNumbers: true, // DECIMALS serán números JS (cuidado con precisión extrema)
  // Configuración SSL para bases de datos en la nube (como Azure o AWS)
  ssl:
    process.env.MYSQL_SSL === 'true'
      ? {
          rejectUnauthorized: true,
        }
      : undefined,
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
    throw new Error(
      'Database environment variables (MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE) are not fully configured.'
    );
  }

  try {
    if (!pool) {
      pool = mysql.createPool(dbConfig);
      console.log('MySQL Connection Pool initialized.');
    }
    return pool;
  } catch (error) {
    console.error('Error establishing connection pool:', error);
    throw error;
  }
}
