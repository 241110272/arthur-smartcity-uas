require('dotenv').config();

const mysql = require('mysql2/promise');

async function test() {
  console.log('Testing database connection...');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD);

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    connectTimeout: 30000,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const [rows] = await conn.query('SELECT 1 + 2 AS result');
  console.log('✅ Aiven connected successfully:', rows);

  await conn.end();
}

test().catch((err) => {
  console.error('❌ Aiven connection failed');
  console.error('Message:', err.message);
  console.error('Code:', err.code);
  console.error(err);
});