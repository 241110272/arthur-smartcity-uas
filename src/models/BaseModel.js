const pool = require('../utils/database');

/**
 * Base Model Class - Parent class untuk semua models
 * Mengimplementasikan inheritance dan basic CRUD operations
 */
class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Find semua records atau dengan filter
   */
  async findAll(whereClause = '', params = []) {
    const connection = await pool.getConnection();
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      if (whereClause) {
        query += ` WHERE ${whereClause}`;
      }
      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Find satu record berdasarkan ID
   */
  async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Insert data baru
   */
  async create(data) {
    const connection = await pool.getConnection();
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map(() => '?').join(',');
      
      const query = `INSERT INTO ${this.tableName} (${columns.join(',')}) VALUES (${placeholders})`;
      const [result] = await connection.execute(query, values);
      return result;
    } finally {
      connection.release();
    }
  }

  /**
   * Update data
   */
  async update(id, data) {
    const connection = await pool.getConnection();
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns.map(col => `${col} = ?`).join(',');
      
      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
      values.push(id);
      const [result] = await connection.execute(query, values);
      return result;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete data
   */
  async delete(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `DELETE FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return result;
    } finally {
      connection.release();
    }
  }
}

module.exports = BaseModel;
