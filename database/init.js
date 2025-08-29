import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export const initDatabase = async () => {
  // Create database file
  db = await open({
    filename: path.join(__dirname, 'ticketing.db'),
    driver: sqlite3.Database
  });

  // Create tables
  await createTables();
  
  // Create default admin user if no users exist
  await createDefaultAdmin();
  
  console.log('Database initialized successfully');
};

const createTables = async () => {
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      FOREIGN KEY (created_by) REFERENCES users (id)
    )
  `);

  // Tickets table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      student_name TEXT NOT NULL,
      student_email TEXT NOT NULL,
      student_id TEXT,
      course TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('Academic', 'IT Support', 'Finance', 'Accommodation', 'Other')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
      status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Pending', 'Closed')),
      assigned_to TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME,
      FOREIGN KEY (assigned_to) REFERENCES users (id),
      FOREIGN KEY (created_by) REFERENCES users (id)
    )
  `);

  // Notes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      note_type TEXT NOT NULL CHECK (note_type IN ('Internal', 'Student Communication', 'System Update')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Attachments table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users (id)
    )
  `);

  // User sessions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
    CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets (priority);
    CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets (assigned_to);
    CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets (created_at);
    CREATE INDEX IF NOT EXISTS idx_notes_ticket_id ON notes (ticket_id);
    CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON attachments (ticket_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions (token);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions (expires_at);
  `);
};

const createDefaultAdmin = async () => {
  // Check if any users exist
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  
  if (userCount.count === 0) {
    // Create default admin user
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await db.run(`
      INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [adminId, 'System Administrator', 'admin@bnu.ac.uk', hashedPassword, 'admin', 'active']);
    
    console.log('Default admin user created:');
    console.log('Email: admin@bnu.ac.uk');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');
  }
};
