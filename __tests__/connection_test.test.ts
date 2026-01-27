// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { getDbPool } from '../lib/db';
import { loadEnv } from 'vite';

describe('Database Connection', () => {
  beforeAll(() => {
    const env = loadEnv('', process.cwd(), '');
    process.env.MYSQL_HOST = env.MYSQL_HOST || '127.0.0.1';
    process.env.MYSQL_USER = env.MYSQL_USER || 'root';
    process.env.MYSQL_PASSWORD = env.MYSQL_PASSWORD || '';
    process.env.MYSQL_DATABASE = env.MYSQL_DATABASE || 'test_db';
  });

  it('should connect to the database and execute a query', async () => {
    try {
      const pool = await getDbPool();
      const [rows] = await pool.query('SELECT NOW() as now');
      const result = rows as { now: Date }[];
      expect(result).toHaveLength(1);
      expect(result[0].now).toBeDefined();
      console.log('DB Connection Success:', result[0].now);
    } catch (error) {
      console.error('DB Connection Failed:', error);
      throw error;
    }
  });
});
