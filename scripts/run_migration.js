
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env
const envConfig = dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (envConfig.error) {
    console.error("Error loading .env file:", envConfig.error);
    process.exit(1);
}

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
        console.log('Running migration...');
        await connection.query(`ALTER TABLE tips ADD COLUMN idempotency_key VARCHAR(36) UNIQUE;`);
        console.log('Migration successful: idempotency_key column added.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists. Skipping.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        await connection.end();
    }
}

runMigration();
