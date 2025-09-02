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
    console.log('🚀 Starting SIMPLE database initialization...');
    
    // Simple path - always use /app for Railway
    const dbPath = '/app/campus-assist.db';
    console.log('📁 Database path:', dbPath);
    
    // Create database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ Database opened successfully');

    // Create tables - SIMPLE structure
    console.log('📋 Creating tables...');
    
    // Users table - SIMPLE
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

    // Organizations table - SIMPLE
    await db.exec(`
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Teams table - SIMPLE
    await db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        organization_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User sessions table - SIMPLE
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

    // Check if admin user exists
    const adminExists = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['supreme_admin']);
    
    if (adminExists.count === 0) {
      console.log('👤 Creating default admin user...');
      
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('supreme123', 12);
      
      // Create default organization
      const companyId = uuidv4();
      await db.run(`
        INSERT INTO organizations (id, name, type, status, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [companyId, 'BNU Enterprise', 'company', 'active']);
      
      // Create admin user
      await db.run(`
        INSERT INTO users (id, name, email, password_hash, role, status, organization_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [adminId, 'Supreme Administrator', 'supreme@bnu.ac.uk', hashedPassword, 'supreme_admin', 'active', companyId]);
      
      console.log('✅ Default admin user created');
      console.log('🔑 Login: supreme@bnu.ac.uk / supreme123');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Verify database
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    const orgCount = await db.get('SELECT COUNT(*) as count FROM organizations');
    
    console.log(`📊 Database ready: ${userCount.count} users, ${orgCount.count} organizations`);
    console.log('🎉 Database initialization COMPLETE!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};
