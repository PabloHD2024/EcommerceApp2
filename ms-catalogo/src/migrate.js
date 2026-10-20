require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const { createPool } = require('./db');

async function migrate() {
  const pool = createPool();
  try {
    const sql = await fs.readFile(path.join(__dirname, '..', 'migrations', '001-initial.sql'), 'utf8');
    await pool.query(sql);
    console.log('Catalog migration 001 applied');
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Catalog migration failed:', error);
  process.exitCode = 1;
});
