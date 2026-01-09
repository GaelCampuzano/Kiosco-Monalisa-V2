const { Pool } = require('@neondatabase/serverless');

// Ejecutar con: node scripts/check-tables.js
// Asegúrate de tener DATABASE_URL en tu entorno
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

async function main() {
    const client = await pool.connect();
    try {
        console.log("--- TABLAS EN LA BASE DE DATOS ---");
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        for (const row of res.rows) {
            console.log(`- ${row.table_name}`);

            const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${row.table_name}'
      `);
            console.log("  Columnas:", cols.rows.map(c => c.column_name).join(", "));

            const count = await client.query(`SELECT count(*) FROM "${row.table_name}"`);
            console.log("  Filas:", count.rows[0].count);
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

main();
