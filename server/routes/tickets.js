
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult, query } from 'express-validator';
import { getConnection } from '../config/database.js';
import { authenticateToken, requireStaff, requireTicketAccess } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed'));
    }
  }
});

// Get all tickets with filtering and pagination
router.get('/', [
  authenticateToken,
  requireTicketAccess,
  requireStaff,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('category').optional().isString(),
  query('assigned_to').optional().isString(),
  query('search').optional().isString(),
  query('filter').optional().isIn(['my', 'unassigned', 'high-priority'])
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

    const {
      page = 1,
      limit = 20,
      status,
      priority,
      category,
      assigned_to,
      search,
      filter,
      sort = 'created_at',
      order = 'desc'
    } = req.query;

    const pool = await getConnection();
    let whereConditions = [];
    let params = [];

    // Build WHERE conditions based on filters
    if (status) {
      whereConditions.push('t.status = ?');
      params.push(status);
    }

    if (priority) {
      whereConditions.push('t.priority = ?');
      params.push(priority);
    }

    if (category) {
      whereConditions.push('t.category = ?');
      params.push(category);
    }

    if (assigned_to) {
      whereConditions.push('t.assigned_to = ?');
      params.push(assigned_to);
    }

    if (search) {
      whereConditions.push('(t.title LIKE ? OR t.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // Apply user-specific filters
    if (filter === 'my') {
      whereConditions.push('t.assigned_to = ?');
      params.push(req.user.id);
    } else if (filter === 'unassigned') {
      whereConditions.push('t.assigned_to IS NULL');
    } else if (filter === 'high-priority') {
      whereConditions.push('t.priority IN (?, ?)');
      params.push('high', 'urgent');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM tickets t ${whereClause}
    `, params);
    
    const totalTickets = countResult[0].total;
    const totalPages = Math.ceil(totalTickets / limit);

    // Get tickets
    const [tickets] = await pool.execute(`
      SELECT 
        t.*,
        u.name as assigned_to_name,
        c.name as created_by_name,
        o.name as organization_name
      FROM tickets t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      LEFT JOIN organizations o ON t.organization_id = o.id
      ${whereClause}
      ORDER BY t.${sort} ${order.toUpperCase()}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTickets,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
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

// Create new ticket
router.post('/', [
  authenticateToken,
  requireStaff,
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']),
  body('category').trim().isLength({ min: 2, max: 100 }),
  body('assigned_to').optional().isString()
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

    const { title, description, priority, category, assigned_to } = req.body;
    const ticketId = uuidv4();

    const pool = await getConnection();
    
    await pool.execute(`
      INSERT INTO tickets (id, title, description, priority, category, assigned_to, created_by, organization_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [ticketId, title, description, priority, category, assigned_to || null, req.user.id, req.user.organization_id]);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
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
    const pool = await getConnection();
    
    const [tickets] = await pool.execute(`
      SELECT 
        t.*,
        u.name as assigned_to_name,
        c.name as created_by_name,
        o.name as organization_name
      FROM tickets t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      LEFT JOIN organizations o ON t.organization_id = o.id
      WHERE t.id = ?
    `, [id]);

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: tickets[0]
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
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('category').optional().trim().isLength({ min: 2, max: 100 }),
  body('assigned_to').optional().isString()
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
    const pool = await getConnection();
    
    // Check if ticket exists
    const [existingTickets] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [id]);
    if (existingTickets.length === 0) {
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

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await pool.execute(
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

// Delete ticket
router.delete('/:id', [authenticateToken, requireStaff, requireTicketAccess], async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    // Check if ticket exists
    const [existingTickets] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [id]);
    if (existingTickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Soft delete
    await pool.execute('UPDATE tickets SET is_active = FALSE WHERE id = ?', [id]);
    
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

   