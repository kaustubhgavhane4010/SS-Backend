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

export const getFallbackDatabase = () => {
  if (!fallbackDb) {
    throw new Error('Fallback database not initialized');
  }
  return fallbackDb;
};
