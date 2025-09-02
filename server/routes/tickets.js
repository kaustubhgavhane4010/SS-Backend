
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult, query } from 'express-validator';
import { getDatabase } from '../database/ultra-simple.js';
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
  query('status').optional().isIn(['Open', 'In Progress', 'Pending', 'Closed']),
  query('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  query('category').optional().isIn(['Academic', 'IT Support', 'Finance', 'Accommodation', 'Other']),
  query('assigned_to').optional().isUUID(),
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

    const db = getDatabase();
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
      whereConditions.push(`(
        t.student_name LIKE ? OR 
        t.student_email LIKE ? OR 
        t.title LIKE ? OR 
        t.description LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Apply role-based filters
    if (req.user.role === 'staff') {
      whereConditions.push('(t.assigned_to = ? OR t.assigned_to IS NULL)');
      params.push(req.user.userId);
    }

    // Apply specific filters
    if (filter === 'my') {
      whereConditions.push('t.assigned_to = ?');
      params.push(req.user.userId);
    } else if (filter === 'unassigned') {
      whereConditions.push('t.assigned_to IS NULL');
    } else if (filter === 'high-priority') {
      whereConditions.push('t.priority IN ("High", "Urgent")');
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM tickets t 
      ${whereClause}
    `;
    const countResult = await db.get(countQuery, params);
    const total = countResult.total;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get tickets with user information
    const ticketsQuery = `
      SELECT 
        t.*,
        u1.name as assigned_to_name,
        u2.name as created_by_name
      FROM tickets t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      ${whereClause}
      ORDER BY t.${sort} ${order.toUpperCase()}
      LIMIT ? OFFSET ?
    `;

    const tickets = await db.all(ticketsQuery, [...params, limit, offset]);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
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

// Get dashboard stats
router.get('/stats', [authenticateToken, requireTicketAccess], async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.userId;

    // Get stats based on user role
    let totalOpenTickets, myAssignedTickets, highPriorityTickets, resolvedToday;

    if (req.user.role === 'admin') {
      // Admin sees all tickets
      totalOpenTickets = await db.get(
        'SELECT COUNT(*) as count FROM tickets WHERE status != "Closed"'
      );
      
      highPriorityTickets = await db.get(
        'SELECT COUNT(*) as count FROM tickets WHERE priority IN ("High", "Urgent") AND status != "Closed"'
      );
    } else {
      // Staff sees only their assigned tickets
      totalOpenTickets = await db.get(
        'SELECT COUNT(*) as count FROM tickets WHERE assigned_to = ? AND status != "Closed"',
        [userId]
      );
      
      highPriorityTickets = await db.get(
        'SELECT COUNT(*) as count FROM tickets WHERE assigned_to = ? AND priority IN ("High", "Urgent") AND status != "Closed"',
        [userId]
      );
    }

    myAssignedTickets = await db.get(
      'SELECT COUNT(*) as count FROM tickets WHERE assigned_to = ? AND status != "Closed"',
      [userId]
    );

    resolvedToday = await db.get(
      'SELECT COUNT(*) as count FROM tickets WHERE status = "Closed" AND DATE(updated_at) = DATE("now")',
    );

    res.json({
      success: true,
      data: {
        totalOpenTickets: totalOpenTickets.count,
        myAssignedTickets: myAssignedTickets.count,
        highPriorityTickets: highPriorityTickets.count,
        resolvedToday: resolvedToday.count
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single ticket
router.get('/:id', [authenticateToken, requireTicketAccess, requireStaff], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const ticket = await db.get(`
      SELECT 
        t.*,
        u1.name as assigned_to_name,
        u2.name as created_by_name
      FROM tickets t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.id = ?
    `, [id]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if staff user can access this ticket
    if (req.user.role === 'staff' && ticket.assigned_to !== req.user.userId && ticket.created_by !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
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

// Create new ticket
router.post('/', [
  authenticateToken,
  requireTicketAccess,
  requireStaff,
  body('student_name').trim().isLength({ min: 2, max: 100 }),
  body('student_email').isEmail().normalizeEmail(),
  body('student_id').optional().isString(),
  body('course').trim().isLength({ min: 1, max: 100 }),
  body('category').isIn(['Academic', 'IT Support', 'Finance', 'Accommodation', 'Other']),
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('priority').isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('assigned_to').optional().isUUID(),
  body('due_date').optional().isISO8601()
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
      student_name,
      student_email,
      student_id,
      course,
      category,
      title,
      description,
      priority,
      assigned_to,
      due_date
    } = req.body;

    const db = getDatabase();
    const ticketId = uuidv4();

    await db.run(`
      INSERT INTO tickets (
        id, student_name, student_email, student_id, course, category, 
        title, description, priority, assigned_to, created_by, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ticketId, student_name, student_email, student_id, course, category,
      title, description, priority, assigned_to, req.user.userId, due_date
    ]);

    const newTicket = await db.get(`
      SELECT 
        t.*,
        u1.name as assigned_to_name,
        u2.name as created_by_name
      FROM tickets t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.id = ?
    `, [ticketId]);

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: newTicket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update ticket
router.put('/:id', [
  authenticateToken,
  requireTicketAccess,
  requireStaff,
  body('title').optional().trim().isLength({ min: 5, max: 200 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('status').optional().isIn(['Open', 'In Progress', 'Pending', 'Closed']),
  body('assigned_to').optional().isUUID(),
  body('due_date').optional().isISO8601()
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

    // Check if ticket exists and user has access
    const existingTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (req.user.role === 'staff' && existingTicket.assigned_to !== req.user.userId && existingTicket.created_by !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
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
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedTicket = await db.get(`
      SELECT 
        t.*,
        u1.name as assigned_to_name,
        u2.name as created_by_name
      FROM tickets t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      WHERE t.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete ticket (admin only)
router.delete('/:id', [authenticateToken, requireTicketAccess, requireStaff], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if ticket exists
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Only allow deletion by admin or the creator
    if (req.user.role !== 'admin' && ticket.created_by !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete related data first
    await db.run('DELETE FROM notes WHERE ticket_id = ?', [id]);
    await db.run('DELETE FROM attachments WHERE ticket_id = ?', [id]);
    
    // Delete ticket
    await db.run('DELETE FROM tickets WHERE id = ?', [id]);

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

// Get ticket notes
router.get('/:id/notes', [authenticateToken, requireTicketAccess, requireStaff], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if ticket exists and user has access
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (req.user.role === 'staff' && ticket.assigned_to !== req.user.userId && ticket.created_by !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const notes = await db.all(`
      SELECT 
        n.*,
        u.name as user_name
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.ticket_id = ?
      ORDER BY n.created_at ASC
    `, [id]);

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create note
router.post('/:id/notes', [
  authenticateToken,
  requireTicketAccess,
  requireStaff,
  body('content').trim().isLength({ min: 1 }),
  body('note_type').isIn(['Internal', 'Student Communication', 'System Update'])
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
    const { content, note_type } = req.body;
    const db = getDatabase();

    // Check if ticket exists and user has access
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (req.user.role === 'staff' && ticket.assigned_to !== req.user.userId && ticket.created_by !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const noteId = uuidv4();
    await db.run(`
      INSERT INTO notes (id, ticket_id, user_id, content, note_type)
      VALUES (?, ?, ?, ?, ?)
    `, [noteId, id, req.user.userId, content, note_type]);

    const newNote = await db.get(`
      SELECT 
        n.*,
        u.name as user_name
      FROM notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.id = ?
    `, [noteId]);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: newNote
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Upload attachment
router.post('/:id/attachments', [
  authenticateToken,
  requireTicketAccess,
  requireStaff,
  upload.single('file')
], async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check if ticket exists and user has access
    const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (req.user.role === 'staff' && ticket.assigned_to !== req.user.userId && ticket.created_by !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const attachmentId = uuidv4();
    await db.run(`
      INSERT INTO attachments (id, ticket_id, filename, file_path, file_size, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      attachmentId,
      id,
      req.file.originalname,
      req.file.filename,
      req.file.size,
      req.user.userId
    ]);

    const newAttachment = await db.get('SELECT * FROM attachments WHERE id = ?', [attachmentId]);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: newAttachment
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;

   