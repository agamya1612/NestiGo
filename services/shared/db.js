const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://nestigo_user:nestigo_password@localhost:5433/nestigo_db',
});

pool.on('error', (err) => {
  console.error('[Postgres] Unexpected error on idle client', err);
  process.exit(-1);
});

const gracefulShutdownDB = async () => {
  console.log('\n[Postgres] Closing database pool...');
  try {
    await pool.end();
    console.log('[Postgres] Pool closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('[Postgres] Error closing pool:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdownDB);
process.on('SIGTERM', gracefulShutdownDB);

const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log(`[Postgres] executed query`, { text, duration, rows: res.rowCount });
  return res;
};

module.exports = {
  query,
  pool,
};
