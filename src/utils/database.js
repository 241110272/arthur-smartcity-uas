const mysql = require('mysql2/promise');

const connectionConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  ssl: process.env.DB_SSL === 'true'
    ? {
        rejectUnauthorized: false
      }
    : undefined
};

console.log('Database pool config:', {
  host: connectionConfig.host,
  port: connectionConfig.port,
  user: connectionConfig.user,
  database: connectionConfig.database,
  ssl: !!connectionConfig.ssl
});

const pool = mysql.createPool(connectionConfig);

module.exports = pool;