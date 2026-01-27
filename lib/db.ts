import mysql from 'mysql2/promise';

/**
 * Variable global para mantener la conexión (pool) en memoria
 * durante el ciclo de vida de la aplicación en desarrollo.
 * Evita múltiples conexiones al recargar en HMR (Hot Module Replacement).
 */
const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

/**
 * Obtiene la configuración de la base de datos de forma dinámica.
 */
function getDbConfig(): mysql.PoolOptions {
  return {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    supportBigNumbers: true,
    bigNumberStrings: true,
    decimalNumbers: true,
    ssl:
      process.env.MYSQL_SSL === 'true'
        ? {
            rejectUnauthorized: true,
          }
        : undefined,
  };
}

/**
 * Inicializa el pool de conexiones de MySQL (Singleton).
 * @returns {Promise<Pool>} El pool de conexiones de MySQL.
 */
export async function getDbPool() {
  if (globalForDb.pool) {
    return globalForDb.pool;
  }

  const config = getDbConfig();

  // Validación básica de credenciales
  if (!config.host || !config.user || !config.database) {
    throw new Error(
      'Las variables de entorno de la base de datos (MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE) no están configuradas correctamente.'
    );
  }

  try {
    if (!globalForDb.pool) {
      globalForDb.pool = mysql.createPool(config);
      console.log('MySQL Connection Pool initialized.');
    }
    return globalForDb.pool;
  } catch (error) {
    console.error('Error establishing connection pool:', error);
    throw error;
  }
}
