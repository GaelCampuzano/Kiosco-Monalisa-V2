
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined
    });

    try {
        console.log('Creating waiters table...');

        await connection.query(`
      CREATE TABLE IF NOT EXISTS waiters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        active BOOLEAN DEFAULT TRUE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_active (active),
        INDEX idx_name (name)
      );
    `);

        console.log('Migration successful: waiters table ready.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

runMigration();
