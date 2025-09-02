import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { getFallbackDatabase } from '../database/fallback-db.js';
import { authenticateToken, requireStaff, requireTicketAccess } from '../middleware/auth.js';

const router = express.Router();

// Get all tickets (simplified for fallback)
router.get('/', [authenticateToken, requireTicketAccess, requireStaff], async (req, res) => {
  try {
    const db = getFallbackDatabase();
    
    const tickets = await db.all(`
      SELECT * FROM tickets 
      WHERE is_active = 1 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalTickets: tickets.length,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new ticket (simplified)
router.post('/', [
  authenticateToken,
  requireStaff,
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']),
  body('category').trim().isLength({ min: 2, max: 100 })
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

    const { title, description, priority, category } = req.body;
    const ticketId = uuidv4();

    const db = getFallbackDatabase();
    
    await db.run(`
      INSERT INTO tickets (id, title, description, priority, category, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [ticketId, title, description, priority, category, req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully (SQLite fallback)',
      data: { id: ticketId, title, priority, category }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get ticket by ID
router.get('/:id', [authenticateToken, requireStaff, requireTicketAccess], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFallbackDatabase();
    
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ? AND is_active = 1', [id]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update ticket
router.put('/:id', [
  authenticateToken,
  requireStaff,
  requireTicketAccess,
  body('title').optional().trim().isLength({ min: 5, max: 200 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
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
    const db = getFallbackDatabase();
    
    // Check if ticket exists
    const existingTicket = await db.get('SELECT * FROM tickets WHERE id = ? AND is_active = 1', [id]);
    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
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

    params.push(id);

    await db.run(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete ticket (soft delete)
router.delete('/:id', [authenticateToken, requireStaff, requireTicketAccess], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFallbackDatabase();
    
    // Check if ticket exists
    const existingTicket = await db.get('SELECT * FROM tickets WHERE id = ? AND is_active = 1', [id]);
    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Soft delete
    await db.run('UPDATE tickets SET is_active = 0 WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
