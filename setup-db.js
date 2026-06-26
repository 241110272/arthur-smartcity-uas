require('dotenv').config();

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('Starting database setup...\n');

  console.log('Using database config:');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
  console.log('');

  let conn;

  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'defaultdb',
      multipleStatements: true,
      connectTimeout: 30000,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Connected to Aiven MySQL');

    const sqlPath = path.join(__dirname, 'database.sql');
    let sqlFile = fs.readFileSync(sqlPath, 'utf8');

    /**
     * Aiven database is usually already selected through DB_NAME.
     * This removes local-only SQL commands like:
     * CREATE DATABASE smartcity_traffic;
     * USE smartcity_traffic;
     */
    sqlFile = sqlFile
      .replace(/CREATE DATABASE IF NOT EXISTS .*?;/gi, '')
      .replace(/CREATE DATABASE .*?;/gi, '')
      .replace(/USE .*?;/gi, '');

    await conn.query(sqlFile);

    console.log('✅ SQL file executed');

    const [tables] = await conn.query('SHOW TABLES');

    console.log(`\n📋 Tables created/found: ${tables.length}`);

    if (tables.length > 0) {
      tables.forEach((t, i) => {
        const tableName = Object.values(t)[0];
        console.log(`   ${i + 1}. ${tableName}`);
      });
    }

    try {
      const [userCount] = await conn.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n📊 Users table rows: ${userCount[0].count}`);
    } catch (e) {
      console.log('\n⚠️ Could not query users table. This is okay if your SQL does not create users yet.');
    }

    console.log('\n🎉 Database setup complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

setupDatabase();