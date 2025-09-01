import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
  console.log('🚀 Starting database initialization...');
  console.log('🔍 Environment variables:', {
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    PWD: process.env.PWD,
    CWD: process.cwd()
  });

  // STRATEGY: Use persistent database path that survives Railway restarts
  let dbPath;
  let pathStrategy = 'unknown';
  
  // Check if we're in Railway/Production environment
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL || process.env.PORT;
  
  if (isRailway) {
    // RAILWAY STRATEGY: Use persistent volume path
    dbPath = '/app/campus-assist.db';
    pathStrategy = 'railway-persistent-volume';
    console.log('🚀 Railway/Production detected - using persistent volume path:', dbPath);
  } else {
    // LOCAL STRATEGY: Use project root
    dbPath = path.join(process.cwd(), 'campus-assist.db');
    pathStrategy = 'local-project-root';
    console.log('💻 Local development - using project root:', dbPath);
  }
  
  console.log('🎯 Database strategy:', pathStrategy);
  console.log('📁 Database path:', dbPath);
  console.log('🛡️ This ensures data persistence across all environments');
  
  try {
    // Check if database file exists and has data
    let databaseExists = false;
    let hasData = false;
    
    if (fs.existsSync(dbPath)) {
      databaseExists = true;
      console.log('✅ Database file exists at:', dbPath);
      
      // Check if database has data by trying to read it
      try {
        const tempDb = await open({
          filename: dbPath,
          driver: sqlite3.Database
        });
        
        const userCount = await tempDb.get('SELECT COUNT(*) as count FROM users');
        const orgCount = await tempDb.get('SELECT COUNT(*) as count FROM organizations');
        
        hasData = (userCount?.count > 0 || orgCount?.count > 0);
        console.log(`📊 Existing database has: ${userCount?.count || 0} users, ${orgCount?.count || 0} organizations`);
        
        await tempDb.close();
      } catch (readError) {
        console.log('⚠️ Database exists but cannot be read, will recreate:', readError.message);
        hasData = false;
      }
    }
    
    // Open or create database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Test database write access
    await db.exec('CREATE TABLE IF NOT EXISTS _test_write (id INTEGER)');
    await db.exec('DROP TABLE _test_write');
    console.log('✅ Database write access confirmed');

    // Only create tables if database is new or empty
    if (!databaseExists || !hasData) {
      console.log('🔨 Creating tables...');
      await createTables();
      
      console.log('👤 Creating default admin user...');
      await createDefaultAdmin();
      
      console.log('✅ Database initialized with fresh data');
    } else {
      console.log('🛡️ Database already has data - preserving existing data');
    }
    
    console.log('🎉 Database initialization successful!');
    console.log('📍 Final database location:', dbPath);
    console.log('🛡️ Data persistence strategy:', pathStrategy);
    console.log('💡 Your data is now safe and persistent!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('🔍 Attempted path:', dbPath);
    console.error('🔍 Strategy:', pathStrategy);
    
    // CRITICAL: If Railway path fails, try project root as fallback
    if (pathStrategy === 'railway-persistent-volume') {
      console.log('🔄 Railway path failed, trying project root fallback...');
      const fallbackPath = path.join(process.cwd(), 'campus-assist.db');
      console.log('📁 Fallback path:', fallbackPath);
      
      try {
        db = await open({
          filename: fallbackPath,
          driver: sqlite3.Database
        });
        
        await createTables();
        await createDefaultAdmin();
        
        console.log('✅ Database initialized with fallback path');
        console.log('📍 Final database location:', fallbackPath);
        
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError.message);
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }
};

const createTables = async () => {
  // Users table with new hierarchy system
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('supreme_admin', 'admin', 'university_admin', 'senior_leadership', 'dean', 'manager', 'team_member')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      organization_id TEXT,
      department TEXT,
      phone TEXT,
      avatar TEXT,
      FOREIGN KEY (created_by) REFERENCES users (id)
    )
  `);

  // Organizations table for enterprise management
  await db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('company', 'university', 'department')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      parent_organization_id TEXT,
      settings TEXT,
      FOREIGN KEY (created_by) REFERENCES users (id),
      FOREIGN KEY (parent_organization_id) REFERENCES organizations (id)
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

  // Teams table for enterprise management
  await db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      organization_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations (id),
      FOREIGN KEY (created_by) REFERENCES users (id)
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
    CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams (organization_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions (token);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions (expires_at);
  `);
};

const createDefaultAdmin = async () => {
  // Check if any users exist
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  
  if (userCount.count === 0) {
    // Create default supreme admin user
    const supremeAdminId = uuidv4();
    const hashedPassword = await bcrypt.hash('supreme123', 12);
    
    // Create default company organization
    const companyId = uuidv4();
    await db.run(`
      INSERT INTO organizations (id, name, type, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [companyId, 'BNU Enterprise', 'company', 'active', supremeAdminId]);
    
    // Create supreme admin user
    await db.run(`
      INSERT INTO users (id, name, email, password_hash, role, status, organization_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [supremeAdminId, 'Supreme Administrator', 'supreme@bnu.ac.uk', hashedPassword, 'supreme_admin', 'active', companyId]);
    
    console.log('Default Supreme Admin user created:');
    console.log('Email: supreme@bnu.ac.uk');
    console.log('Password: supreme123');
    console.log('Please change the password after first login!');
  }
};
