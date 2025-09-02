import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { getFallbackDatabase } from '../database/fallback-db.js';
import { authenticateToken, requireSupremeAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get enterprise dashboard stats (simplified)
router.get('/enterprise-stats', [authenticateToken, requireSupremeAdmin], async (req, res) => {
  try {
    const db = getFallbackDatabase();
    
    // Get organization stats
    const organizationStats = await db.get(`
      SELECT 
        COUNT(*) as total_organizations,
        SUM(CASE WHEN type = 'company' THEN 1 ELSE 0 END) as companies,
        SUM(CASE WHEN type = 'university' THEN 1 ELSE 0 END) as universities,
        SUM(CASE WHEN type = 'department' THEN 1 ELSE 0 END) as departments
      FROM organizations
      WHERE is_active = 1
    `);

    // Get user stats by role
    const userStats = await db.get(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'university_admin' THEN 1 ELSE 0 END) as university_admins,
        SUM(CASE WHEN role = 'senior_leadership' THEN 1 ELSE 0 END) as senior_leadership,
        SUM(CASE WHEN role = 'dean' THEN 1 ELSE 0 END) as deans,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as managers,
        SUM(CASE WHEN role = 'team_member' THEN 1 ELSE 0 END) as team_members
      FROM users
      WHERE is_active = 1
    `);

    // Get recent activity
    const recentUsers = await db.all(`
      SELECT u.id, u.name, u.email, u.role, u.created_at, o.name as organization_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.is_active = 1
      ORDER BY u.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        organizations: organizationStats,
        users: userStats,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Get enterprise stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all organizations
router.get('/organizations', [authenticateToken, requireSupremeAdmin], async (req, res) => {
  try {
    const db = getFallbackDatabase();
    
    const organizations = await db.all(`
      SELECT 
        o.*,
        u.name as created_by_name
      FROM organizations o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.is_active = 1
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new organization
router.post('/organizations', [
  authenticateToken,
  requireSupremeAdmin,
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('type').isIn(['company', 'university', 'department']),
  body('status').optional().isIn(['active', 'inactive', 'suspended'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name, type, status = 'active', description } = req.body;
    const organizationId = uuidv4();

    const db = getFallbackDatabase();
    
    await db.run(`
      INSERT INTO organizations (id, name, type, status, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [organizationId, name, type, status, description, req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Organization created successfully (SQLite fallback)',
      data: { id: organizationId, name, type, status }
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all users
router.get('/users', [authenticateToken, requireSupremeAdmin], async (req, res) => {
  try {
    const db = getFallbackDatabase();
    
    const users = await db.all(`
      SELECT 
        u.*,
        o.name as organization_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.is_active = 1
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new user
router.post('/users', [
  authenticateToken,
  requireSupremeAdmin,
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['supreme_admin', 'admin', 'university_admin', 'senior_leadership', 'dean', 'manager', 'team_member']),
  body('organization_id').notEmpty(),
  body('department').optional().trim(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name, email, password, role, organization_id, department, phone } = req.body;
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const db = getFallbackDatabase();
    
    await db.run(`
      INSERT INTO users (id, name, email, password, role, organization_id, department, phone, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, email, hashedPassword, role, organization_id, department, phone, req.user.id]);

    res.status(201).json({
      success: true,
      message: 'User created successfully (SQLite fallback)',
      data: { id: userId, name, email, role, organization_id }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete organization (soft delete)
router.delete('/organizations/:id', [authenticateToken, requireSupremeAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFallbackDatabase();
    
    // Check if organization has users
    const userCount = await db.get('SELECT COUNT(*) as count FROM users WHERE organization_id = ? AND is_active = 1', [id]);
    
    if (userCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organization with active users'
      });
    }
    
    // Soft delete
    await db.run('UPDATE organizations SET is_active = 0 WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user (soft delete)
router.delete('/users/:id', [authenticateToken, requireSupremeAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFallbackDatabase();
    
    // Don't allow deleting self
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    // Soft delete
    await db.run('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    
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
