import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/init.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session exists and is valid
    const db = getDatabase();
    const session = await db.get(
      'SELECT * FROM user_sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP',
      [token]
    );

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Check if user is still active
    const user = await db.get(
      'SELECT id, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or not found'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

export const requireStaff = (req, res, next) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Staff access required'
    });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const db = getDatabase();
      const session = await db.get(
        'SELECT * FROM user_sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP',
        [token]
      );

      if (session) {
        const user = await db.get(
          'SELECT id, status FROM users WHERE id = ?',
          [decoded.userId]
        );

        if (user && user.status === 'active') {
          req.user = decoded;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};
