import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { dbGet, dbRun, dbQuery } from '../database/mysql-helpers.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get admin dashboard stats (organization-scoped)
router.get('/dashboard-stats', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's organization
    const user = await dbGet('SELECT organization_id FROM users WHERE id = ?', [userId]);
    if (!user || !user.organization_id) {
      return res.status(403).json({
        success: false,
        message: 'User not associated with any organization'
      });
    }

    const organizationId = user.organization_id;

    // Get organization stats
    const organizationStats = await dbGet(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'university_admin' THEN 1 ELSE 0 END) as university_admins,
        SUM(CASE WHEN role = 'senior_leadership' THEN 1 ELSE 0 END) as senior_leadership,
        SUM(CASE WHEN role = 'dean' THEN 1 ELSE 0 END) as deans,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as managers,
        SUM(CASE WHEN role = 'team_member' THEN 1 ELSE 0 END) as team_members
      FROM users
      WHERE organization_id = ? AND status = 'active'
    `, [organizationId]);

    // Get recent users in organization
    const recentUsers = await dbQuery(`
      SELECT u.id, u.name, u.email, u.role, u.created_at, u.status
      FROM users u
      WHERE u.organization_id = ? AND u.status = 'active'
      ORDER BY u.created_at DESC
      LIMIT 10
    `, [organizationId]);

    // Get organization details
    const organization = await dbGet(`
      SELECT id, name, type, status, created_at, settings
      FROM organizations
      WHERE id = ?
    `, [organizationId]);

    // Parse JSON settings
    const organizationWithSettings = {
      ...organization,
      settings: organization.settings ? JSON.parse(organization.settings) : {}
    };

    res.json({
      success: true,
      data: {
        organization: organizationWithSettings,
        stats: organizationStats,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all users in admin's organization
router.get('/users', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's organization
    const user = await dbGet('SELECT organization_id FROM users WHERE id = ?', [userId]);
    if (!user || !user.organization_id) {
      return res.status(403).json({
        success: false,
        message: 'User not associated with any organization'
      });
    }

    const organizationId = user.organization_id;

    const users = await dbQuery(`
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at, u.last_login,
        c.name as created_by_name
      FROM users u
      LEFT JOIN users c ON u.created_by = c.id
      WHERE u.organization_id = ? AND u.status = 'active'
      ORDER BY u.created_at DESC
    `, [organizationId]);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get organization users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new user in admin's organization (limited roles)
router.post('/users', [
  authenticateToken,
  requireAdmin,
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['university_admin', 'senior_leadership', 'dean', 'manager', 'team_member']),
  body('department').optional().trim(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, role, department, phone } = req.body;
    const adminId = req.user.userId;
    
    // Get admin's organization
    const admin = await dbGet('SELECT organization_id FROM users WHERE id = ?', [adminId]);
    if (!admin || !admin.organization_id) {
      return res.status(403).json({
        success: false,
        message: 'Admin not associated with any organization'
      });
    }

    const organizationId = admin.organization_id;

    // Check if email already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);

    await dbRun(`
      INSERT INTO users (id, name, email, password_hash, role, status, organization_id, department, phone, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, email, hashedPassword, role, 'active', organizationId, department, phone, adminId]);

    const newUser = await dbGet(`
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.created_at, u.organization_id, u.department, u.phone,
        c.name as created_by_name
      FROM users u
      LEFT JOIN users c ON u.created_by = c.id
      WHERE u.id = ?
    `, [userId]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user in admin's organization
router.put('/users/:id', [
  authenticateToken,
  requireAdmin,
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['university_admin', 'senior_leadership', 'dean', 'manager', 'team_member']),
  body('status').optional().isIn(['active', 'inactive']),
  body('department').optional().trim(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;
    const adminId = req.user.userId;
    
    // Get admin's organization
    const admin = await dbGet('SELECT organization_id FROM users WHERE id = ?', [adminId]);
    if (!admin || !admin.organization_id) {
      return res.status(403).json({
        success: false,
        message: 'Admin not associated with any organization'
      });
    }

    const organizationId = admin.organization_id;

    // Check if user exists and belongs to admin's organization
    const existingUser = await dbGet('SELECT * FROM users WHERE id = ? AND organization_id = ?', [id, organizationId]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found in your organization'
      });
    }

    // Prevent updating admin or supreme_admin roles
    if (existingUser.role === 'admin' || existingUser.role === 'supreme_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin or supreme admin users'
      });
    }

    // Build update query
    const updates = [];
    const params = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await dbRun(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedUser = await dbGet(`
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at, u.organization_id, u.department, u.phone,
        c.name as created_by_name
      FROM users u
      LEFT JOIN users c ON u.created_by = c.id
      WHERE u.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user from admin's organization
router.delete('/users/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;
    
    // Get admin's organization
    const admin = await dbGet('SELECT organization_id FROM users WHERE id = ?', [adminId]);
    if (!admin || !admin.organization_id) {
      return res.status(403).json({
        success: false,
        message: 'Admin not associated with any organization'
      });
    }

    const organizationId = admin.organization_id;

    // Check if user exists and belongs to admin's organization
    const existingUser = await dbGet('SELECT * FROM users WHERE id = ? AND organization_id = ?', [id, organizationId]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found in your organization'
      });
    }

    // Prevent deleting admin or supreme_admin
    if (existingUser.role === 'admin' || existingUser.role === 'supreme_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin or supreme admin users'
      });
    }

    // Hard delete - completely remove the user and related data
    // First delete user sessions
    await dbRun('DELETE FROM user_sessions WHERE user_id = ?', [id]);
    
    // Then delete the user
    await dbRun('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
