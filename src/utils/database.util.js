const pool = require('./database');

/**
 * Database Query Utility - Prevents SQL Injection
 * Menggunakan parameterized queries untuk semua database operations
 */
class DatabaseUtil {
  /**
   * Execute SELECT query dengan parameterized statements
   * @param {string} query - SQL query dengan ? placeholders
   * @param {array} params - Parameter values untuk ? placeholders
   */
  static async executeSelect(query, params = []) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Execute single row SELECT dengan parameterized statements
   * @param {string} query - SQL query
   * @param {array} params - Parameter values
   */
  static async executeSelectOne(query, params = []) {
    const rows = await this.executeSelect(query, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Execute INSERT query dengan parameterized statements
   * @param {string} query - SQL query
   * @param {array} params - Parameter values
   */
  static async executeInsert(query, params = []) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, params);
      return result;
    } finally {
      connection.release();
    }
  }

  /**
   * Execute UPDATE query dengan parameterized statements
   * @param {string} query - SQL query
   * @param {array} params - Parameter values
   */
  static async executeUpdate(query, params = []) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, params);
      return result;
    } finally {
      connection.release();
    }
  }

  /**
   * Execute DELETE query dengan parameterized statements
   * @param {string} query - SQL query
   * @param {array} params - Parameter values
   */
  static async executeDelete(query, params = []) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(query, params);
      return result;
    } finally {
      connection.release();
    }
  }

  /**
   * Build WHERE clause dynamically dengan parameterized queries
   * @param {object} filters - Object dengan field: value pairs
   * @returns {object} { whereClause, params }
   */
  static buildWhereClause(filters = {}) {
    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    }

    return {
      whereClause: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
      params
    };
  }

  /**
   * Build UPDATE clause dynamically dengan parameterized queries
   * @param {object} updates - Object dengan field: value pairs
   * @returns {object} { updateClause, params }
   */
  static buildUpdateClause(updates = {}) {
    const setters = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id') { // Jangan update ID
        setters.push(`${key} = ?`);
        params.push(value);
      }
    }

    return {
      updateClause: setters.join(', '),
      params
    };
  }

  /**
   * Build INSERT clause dinamis dengan parameterized queries
   * @param {object} data - Object dengan field: value pairs
   * @returns {object} { fields, placeholders, params }
   */
  static buildInsertClause(data = {}) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const params = Object.values(data);

    return {
      fields: fields.join(', '),
      placeholders,
      params
    };
  }

  /**
   * Transaction support untuk complex operations
   * @param {function} callback - Async function yang melakukan operations
   */
  static async transaction(callback) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Escape string untuk mencegah injection dalam edge cases
   * @param {string} str - String untuk di-escape
   */
  static escapeString(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\]/g, (char) => {
      switch (char) {
        case '\0': return '\\0';
        case '\x08': return '\\b';
        case '\x09': return '\\t';
        case '\x1a': return '\\z';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '"':
        case "'":
        case '\\': return '\\' + char;
        default: return char;
      }
    });
  }
}

module.exports = DatabaseUtil;
