import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function resetTestData() {
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
  };

  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error('❌ Missing database configuration.');
    process.exit(1);
  }

  console.log('🧹 Purging test data for production launch...');

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // 1. Limpiar Propinas
    await connection.execute('TRUNCATE TABLE tips');
    console.log('✅ Tips table cleared.');

    // 2. Limpiar Meseros
    await connection.execute('DELETE FROM waiters');
    // Reiniciar el auto-incremento para que empiecen desde 1
    await connection.execute('ALTER TABLE waiters AUTO_INCREMENT = 1');
    console.log('✅ Waiters table cleared.');

    console.log('✨ System is CLEAN and ready for use in 2 days!');
  } catch (error) {
    console.error('❌ Error purging data:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetTestData();
