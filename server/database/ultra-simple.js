import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

let db;

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export const initDatabase = async () => {
  try {
    console.log('🚀 ULTRA-SIMPLE DATABASE INITIALIZATION...');
    
    // Simple path - always use /app for Railway
    const dbPath = '/app/campus-assist.db';
    console.log('📁 Database path:', dbPath);
    
    // Create database (don't delete, just open/create)
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ Database opened successfully');

    // Create tables with IF NOT EXISTS (safe)
    console.log('📋 Creating tables...');
    
    // Users table - ULTRA SIMPLE
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        organization_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Organizations table - ULTRA SIMPLE
    await db.exec(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Teams table - ULTRA SIMPLE
    await db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        organization_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User sessions table - ULTRA SIMPLE
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables created successfully');

    // Check if admin user exists (safe check)
    try {
      const adminExists = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['supreme_admin']);
      
      if (adminExists.count === 0) {
        console.log('👑 Creating default organization and supreme admin...');
        
        const companyId = uuidv4();
        const adminId = uuidv4();
        const hashedPassword = await bcrypt.hash('supreme123', 12);
        
        // Create default organization
        await db.run(`
          INSERT INTO organizations (id, name, type, status, created_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [companyId, 'BNU Enterprise', 'company', 'active']);
        
        // Create supreme admin user
        await db.run(`
          INSERT INTO users (id, name, email, password_hash, role, status, organization_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [adminId, 'Supreme Administrator', 'supreme@bnu.ac.uk', hashedPassword, 'supreme_admin', 'active', companyId]);
        
        console.log('✅ Default organization and supreme admin created');
        console.log('🔑 SUPREME ADMIN LOGIN: supreme@bnu.ac.uk / supreme123');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (userError) {
      console.log('⚠️ User creation error (continuing):', userError.message);
    }
    
    console.log('🎉 ULTRA-SIMPLE DATABASE INITIALIZATION COMPLETE!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    // Don't throw - just log and continue
    console.log('⚠️ Continuing without database initialization');
  }
};
