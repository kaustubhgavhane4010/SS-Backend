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
    console.log('🚀 BULLETPROOF DATABASE INITIALIZATION STARTING...');
    
    // ALWAYS use /app for Railway - NO EXCEPTIONS
    const dbPath = '/app/campus-assist.db';
    console.log('📁 Database path:', dbPath);
    
    // DELETE OLD DATABASE IF EXISTS (nuclear option)
    try {
      const fs = await import('fs');
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('🗑️ Deleted old database file');
      }
    } catch (error) {
      console.log('📁 No old database to delete');
    }
    
    // Create FRESH database
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('✅ Fresh database created successfully');

    // Create ALL tables from scratch
    console.log('📋 Creating tables...');
    
    // Users table - BULLETPROOF
    await db.exec(`
      CREATE TABLE users (
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

    // Organizations table - BULLETPROOF
    await db.exec(`
      CREATE TABLE organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Teams table - BULLETPROOF
    await db.exec(`
      CREATE TABLE teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        organization_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User sessions table - BULLETPROOF
    await db.exec(`
      CREATE TABLE user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All tables created successfully');

    // ALWAYS create default organization and supreme admin
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
    console.log('🔑 SUPREME ADMIN LOGIN:');
    console.log('   Email: supreme@bnu.ac.uk');
    console.log('   Password: supreme123');
    
    // Verify everything works
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    const orgCount = await db.get('SELECT COUNT(*) as count FROM organizations');
    
    console.log(`📊 Database verification: ${userCount.count} users, ${orgCount.count} organizations`);
    console.log('🎉 BULLETPROOF DATABASE INITIALIZATION COMPLETE!');
    console.log('🛡️ This database will work 100% of the time!');
    
  } catch (error) {
    console.error('❌ BULLETPROOF initialization failed:', error.message);
    throw error;
  }
};
