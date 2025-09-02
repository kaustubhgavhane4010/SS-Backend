import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let fallbackDb;

export const initFallbackDatabase = async () => {
  try {
    console.log('🔄 Initializing fallback SQLite database...');
    
    const dbPath = path.join(process.cwd(), 'fallback-campus-assist.db');
    console.log('📁 Fallback database path:', dbPath);
    
    fallbackDb = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Create basic tables for fallback
    await createFallbackTables();
    
    // Create default Supreme Admin user if no users exist
    await createDefaultSupremeAdmin();
    
    console.log('✅ Fallback SQLite database initialized');
    return fallbackDb;
    
  } catch (error) {
    console.error('❌ Fallback database initialization failed:', error.message);
    throw error;
  }
};

const createFallbackTables = async () => {
  console.log('🔨 Creating fallback tables...');
  
  // Basic users table
  await fallbackDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      organization_id TEXT,
      department TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    )
  `);
  
  // Basic organizations table
  await fallbackDb.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    )
  `);
  
  // Basic tickets table
  await fallbackDb.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'medium',
      category TEXT,
      assigned_to TEXT,
      created_by TEXT NOT NULL,
      organization_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    )
  `);
  
  console.log('✅ Fallback tables created');
};

const createDefaultSupremeAdmin = async () => {
  try {
    // Check if any users exist
    const userCount = await fallbackDb.get('SELECT COUNT(*) as count FROM users');
    
    if (userCount.count === 0) {
      console.log('👑 Creating default Supreme Admin user...');
      
      // Create default organization for Supreme Admin
      const orgId = 'org-supreme-admin';
      await fallbackDb.run(`
        INSERT OR IGNORE INTO organizations (id, name, type, description)
        VALUES (?, ?, ?, ?)
      `, [orgId, 'CampusAssist Enterprise', 'enterprise', 'Default enterprise organization for Supreme Admin']);
      
      // Create Supreme Admin user
      const userId = 'user-supreme-admin';
      const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // supreme123
      
      await fallbackDb.run(`
        INSERT OR IGNORE INTO users (id, name, email, password, role, organization_id, department)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [userId, 'Supreme Admin', 'supreme@campusassist.com', hashedPassword, 'supreme_admin', orgId, 'Executive']);
      
      console.log('✅ Default Supreme Admin user created');
      console.log('📧 Email: supreme@campusassist.com');
      console.log('🔑 Password: supreme123');
    } else {
      console.log('👥 Users already exist, skipping default user creation');
    }
  } catch (error) {
    console.error('❌ Failed to create default Supreme Admin:', error.message);
  }
};

export const getFallbackDatabase = () => {
  if (!fallbackDb) {
    throw new Error('Fallback database not initialized');
  }
  return fallbackDb;
};
