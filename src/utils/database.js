require('dotenv').config();
const mysql = require('mysql2/promise');

// Build connection config with proper password handling
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'smartcity_traffic',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
};

// Only add password if it's not empty
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
  connectionConfig.password = process.env.DB_PASSWORD;
}

const pool = mysql.createPool(connectionConfig);

module.exports = pool;
