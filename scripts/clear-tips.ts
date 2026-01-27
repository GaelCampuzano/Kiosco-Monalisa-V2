import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el raíz
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function clearTips() {
  const config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
  };

  if (!config.host || !config.user || !config.database) {
    console.error('Error: Variables de entorno de base de datos no encontradas.');
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(config);
    console.log(`Conectado a la base de datos: ${config.database}`);

    console.log('Limpiando tabla "tips"...');
    // TRUNCATE es más rápido y reinicia los IDs auto-incrementables
    await connection.execute('TRUNCATE TABLE tips');

    console.log('¡Éxito! Todas las propinas han sido eliminadas.');
    await connection.end();
  } catch (error) {
    console.error('Error al limpiar las propinas:', error);
    process.exit(1);
  }
}

clearTips();
