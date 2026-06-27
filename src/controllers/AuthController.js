const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userModel = new User();

/**
 * Auth Controller - Handle authentication operations
 */
class AuthController {
  /**
   * Register user baru (async operation)
   */
  static async register(req, res, next) {
    try {
      const { username, email, password, confirmPassword, full_name, phone } = req.body;

      // Validation
      if (!username || !email || !password || !full_name) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, password, dan nama lengkap harus diisi'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password dan konfirmasi password tidak sesuai'
        });
      }

      // Check email exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      // Check username exists
      const existingUsername = await userModel.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: 'Username sudah terdaftar'
        });
      }

      // Create user
      const result = await userModel.createUser({
        username,
        email,
        password,
        full_name,
        phone,
        role: 'user'
      });

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          userId: result.insertId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user (async operation)
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password harus diisi'
        });
      }

      // Find user
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Verify password
      const isPasswordValid = await userModel.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          sub: user.id,
          userId: user.id,
          email: user.email,
          role: user.role,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user (async operation)
   */
  static async getCurrentUser(req, res, next) {
    try {
      const user = await userModel.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(req, res, next) {
    try {
      const users = await userModel.findAll();
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      }));

      res.json({
        success: true,
        data: safeUsers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update password (async operation)
   */
  static async updatePassword(req, res, next) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Semua field harus diisi'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password baru dan konfirmasi tidak sesuai'
        });
      }

      // Get user with password
      const user = await userModel.findWithPasswordById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Verify old password
      const isOldPasswordValid = await userModel.verifyPassword(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Password lama tidak sesuai'
        });
      }

      // Update password
      await userModel.updatePassword(req.user.userId, newPassword);

      res.json({
        success: true,
        message: 'Password berhasil diubah'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { full_name, email, phone } = req.body;
      const updateData = { updated_at: new Date() };
      
      if (full_name !== undefined) updateData.full_name = full_name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;

      await userModel.update(req.user.userId, updateData);

      // Fetch updated user to return
      const updatedUser = await userModel.findById(req.user.userId);
      if (updatedUser) delete updatedUser.password;

      res.json({
        success: true,
        message: 'Profil berhasil diperbarui',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
