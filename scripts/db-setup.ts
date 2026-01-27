import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function setupDatabase() {
  const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  };

  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error('❌ Missing database configuration. Check your .env.local file.');
    process.exit(1);
  }

  console.log('🔌 Connecting to MySQL...');

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected.');

    console.log('🛠️  Verifying/Creating tables...');

    // 1. Create 'tips' table (Updated with audit columns)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tableNumber VARCHAR(50) NOT NULL,
        waiterName VARCHAR(255) NOT NULL,
        tipPercentage INT NOT NULL,
        amount DECIMAL(10, 2),
        idempotency_key VARCHAR(36) UNIQUE,
        ip_address VARCHAR(45),
        user_agent TEXT,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (createdAt),
        INDEX idx_waiter_name (waiterName),
        INDEX idx_table_number (tableNumber),
        INDEX idx_ip (ip_address)
      );
    `);

    // Migración manual: Añadir columnas si ya existe la tabla (para no perder datos)
    try {
      await connection.execute('ALTER TABLE tips ADD COLUMN ip_address VARCHAR(45)');
      await connection.execute('ALTER TABLE tips ADD COLUMN user_agent TEXT');
      await connection.execute('CREATE INDEX idx_ip ON tips(ip_address)');
    } catch {
      /* Columnas ya existen */
    }

    console.log('   - Table "tips" is ready with audit columns.');

    // 2. Create 'waiters' table
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
    console.log('   - Table "waiters" is ready.');

    // 3. Create 'app_settings' table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value JSON NOT NULL,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('   - Table "app_settings" is ready.');

    // 4. Create 'users' table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('   - Table "users" is ready.');

    console.log('   - Table "users" is ready.');

    // Seed default tips if not exists
    await connection.execute(`
      INSERT IGNORE INTO app_settings (setting_key, setting_value)
      VALUES ('tip_percentages', '[20, 23, 25]');
    `);
    console.log('   - Default settings seeded.');

    // Seed default admin user (ignoring if exists)
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await connection.execute(
      `
      INSERT IGNORE INTO users (username, password_hash, role)
      VALUES (?, ?, 'admin')
    `,
      [process.env.ADMIN_USER || 'admin', hashedPassword]
    );

    console.log(`   - Default admin user configured (User: ${process.env.ADMIN_USER || 'admin'}).`);

    console.log('✨ Database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
