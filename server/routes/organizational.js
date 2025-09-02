import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init.js';
import { authenticateToken, requireSupremeAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get enterprise dashboard stats
router.get('/enterprise-stats', [authenticateToken, requireSupremeAdmin], async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get organization stats
    const organizationStats = await db.get(`
      SELECT 
        COUNT(*) as total_organizations,
        SUM(CASE WHEN type = 'company' THEN 1 ELSE 0 END) as companies,
        SUM(CASE WHEN type = 'university' THEN 1 ELSE 0 END) as universities,
        SUM(CASE WHEN type = 'department' THEN 1 ELSE 0 END) as departments
      FROM organizations
      WHERE status = 'active'
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
      WHERE status = 'active'
    `);

    // Get recent activity
    const recentUsers = await db.all(`
      SELECT u.id, u.name, u.email, u.role, u.created_at, o.name as organization_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.status = 'active'
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
    const db = getDatabase();
    
    const organizations = await db.all(`
      SELECT 
        o.*,
        u.name as created_by_name,
        p.name as parent_organization_name
      FROM organizations o
      LEFT JOIN users u ON o.created_by = u.id
      LEFT JOIN organizations p ON o.parent_organization_id = p.id
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
  body('parent_organization_id').optional().isUUID()
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

    const { name, type, parent_organization_id, settings } = req.body;
    const db = getDatabase();
    const organizationId = uuidv4();

    await db.run(`
      INSERT INTO organizations (id, name, type, status, created_by, parent_organization_id, settings)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [organizationId, name, type, 'active', req.user.userId, parent_organization_id, settings || null]);

    const newOrganization = await db.get(`
      SELECT 
        o.*,
        u.name as created_by_name,
        p.name as parent_organization_name
      FROM organizations o
      LEFT JOIN users u ON o.created_by = u.id
      LEFT JOIN organizations p ON o.parent_organization_id = p.id
      WHERE o.id = ?
    `, [organizationId]);

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: newOrganization
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete organization
router.delete('/organizations/:id', [authenticateToken, requireSupremeAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if organization exists
    const existingOrg = await db.get('SELECT * FROM organizations WHERE id = ?', [id]);
    if (!existingOrg) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if organization has users (prevent deletion if it does)
    const userCount = await db.get('SELECT COUNT(*) as count FROM users WHERE organization_id = ?', [id]);
    if (userCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organization that has users. Please remove all users first.'
      });
    }

    // Soft delete - mark as inactive instead of hard delete
    await db.run('UPDATE organizations SET status = ? WHERE id = ?', ['deleted', id]);

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

// Get all users (for Supreme Admin management)
router.get('/users', [authenticateToken, requireSupremeAdmin], async (req, res) => {
  try {
    const db = getDatabase();
    
    const users = await db.all(`
      SELECT 
        u.*,
        o.name as organization_name,
        c.name as created_by_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN users c ON u.created_by = c.id
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

// Create new admin user (company level)
router.post('/users', [
  authenticateToken,
  requireSupremeAdmin,
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'university_admin']),
  body('organization_id').isUUID(),
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

    const { name, email, password, role, organization_id, department, phone } = req.body;
    const db = getDatabase();

    // Check if email already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if organization exists
    const organization = await db.get('SELECT id, type FROM organizations WHERE id = ?', [organization_id]);
    if (!organization) {
      return res.status(400).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Validate role based on organization type
    if (role === 'university_admin' && organization.type !== 'university') {
      return res.status(400).json({
        success: false,
        message: 'University admin can only be created for university organizations'
      });
    }

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);

    await db.run(`
      INSERT INTO users (id, name, email, password_hash, role, status, organization_id, department, phone, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, email, hashedPassword, role, 'active', organization_id, department, phone, req.user.userId]);

    const newUser = await db.get(`
      SELECT 
        u.*,
        o.name as organization_name,
        c.name as created_by_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
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

// Delete user
router.delete('/users/:id', [authenticateToken, requireSupremeAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting Supreme Admin
    if (existingUser.role === 'supreme_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete Supreme Admin user'
      });
    }

    // Soft delete - mark as inactive instead of hard delete
    await db.run('UPDATE users SET status = ? WHERE id = ?', ['deleted', id]);

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

// Update user
router.put('/users/:id', [
  authenticateToken,
  requireSupremeAdmin,
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'university_admin']),
  body('status').optional().isIn(['active', 'inactive']),
  body('organization_id').optional().isUUID(),
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
    const db = getDatabase();

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent updating Supreme Admin
    if (existingUser.role === 'supreme_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify Supreme Admin user'
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

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedUser = await db.get(`
      SELECT 
        u.*,
        o.name as organization_name,
        c.name as created_by_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
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

export default router;
