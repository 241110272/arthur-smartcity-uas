const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');
const pool = require('../utils/database');

/**
 * User Model - Extends BaseModel dengan fitur authentication
 * Mendemonstrasikan inheritance dari BaseModel
 */
class User extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Create user baru dengan hashing password
   */
  async createUser(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const data = {
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'user',
      full_name: userData.full_name,
      phone: userData.phone || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    return await this.create(data);
  }

  /**
   * Find user by ID (untuk JWT authentication)
   */
  async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT id, username, email, full_name, phone, role, created_at, updated_at FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Find user berdasarkan email (async operation)
   */
  async findByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM ${this.tableName} WHERE email = ?`,
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Verify password - async operation
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Find user berdasarkan username
   */
  async findByUsername(username) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM ${this.tableName} WHERE username = ?`,
        [username]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    return await this.update(userId, {
      password: hashedPassword,
      updated_at: new Date()
    });
  }

  /**
   * Get all users dengan role tertentu
   */
  async getUsersByRole(role) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT id, username, email, full_name, phone, role, created_at FROM ${this.tableName} WHERE role = ? ORDER BY created_at DESC`,
        [role]
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = User;
