import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const db = getDatabase();
    const users = await db.all(`
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at, u.last_login,
        c.name as created_by_name
      FROM users u
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

// Get user by ID (admin only)
router.get('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const user = await db.get(`
      SELECT 
        u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at, u.last_login,
        c.name as created_by_name
      FROM users u
      LEFT JOIN users c ON u.created_by = c.id
      WHERE u.id = ?
    `, [id]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user statistics (admin only)
router.get('/:id/stats', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if user exists
    const user = await db.get('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status != 'Closed' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed_tickets,
        SUM(CASE WHEN priority IN ('High', 'Urgent') THEN 1 ELSE 0 END) as high_priority_tickets,
        AVG(CASE WHEN status = 'Closed' THEN 
          (julianday(updated_at) - julianday(created_at)) 
        END) as avg_resolution_days
      FROM tickets 
      WHERE assigned_to = ?
    `, [id]);

    // Get recent activity
    const recentActivity = await db.all(`
      SELECT 
        'ticket_created' as type,
        t.title as description,
        t.created_at as timestamp
      FROM tickets t
      WHERE t.created_by = ?
      UNION ALL
      SELECT 
        'note_added' as type,
        n.content as description,
        n.created_at as timestamp
      FROM notes n
      WHERE n.user_id = ?
      ORDER BY timestamp DESC
      LIMIT 10
    `, [id, id]);

    res.json({
      success: true,
      data: {
        stats,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
