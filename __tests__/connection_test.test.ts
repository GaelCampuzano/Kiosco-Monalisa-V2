// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { getDbPool } from '../lib/db';
import { loadEnv } from 'vite';

describe('Database Connection', () => {
    beforeAll(() => {
        const env = loadEnv('', process.cwd(), '');
        process.env.DATABASE_URL = env.DATABASE_URL;
    });

    it('should connect to the database and execute a query', async () => {
        try {
            const pool = await getDbPool();
            const result = await pool.query('SELECT NOW() as now');
            expect(result.rows).toHaveLength(1);
            expect(result.rows[0].now).toBeDefined();
            console.log('DB Connection Success:', result.rows[0].now);
        } catch (error) {
            console.error('DB Connection Failed:', error);
            throw error;
        }
    });
});
