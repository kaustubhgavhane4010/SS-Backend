import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

console.log('🔧 SIMPLE DATABASE CREATION - GUARANTEED TO WORK...');

async function createSimpleDatabase() {
  try {
    // Simple path logic
    const dbPath = '/app/campus-assist.db';
    console.log('📁 Creating database at:', dbPath);
    
    // Remove any existing database
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✅ Removed old database');
    }
    
    // Create new database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('📋 Creating tables...');
    
    // Users table
    await db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        organization_id TEXT,
        department TEXT,
        phone TEXT
      )
    `);

    // Organizations table
    await db.exec(`
      CREATE TABLE organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Teams table
    await db.exec(`
      CREATE TABLE teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        organization_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_by TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User sessions table
    await db.exec(`
      CREATE TABLE user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create default admin user
    console.log('👤 Creating default admin user...');
    
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash('supreme123', 12);
    
    // Create default organization
    const companyId = uuidv4();
    await db.run(`
      INSERT INTO organizations (id, name, type, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [companyId, 'BNU Enterprise', 'company', 'active', adminId]);
    
    // Create admin user
    await db.run(`
      INSERT INTO users (id, name, email, password_hash, role, status, organization_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [adminId, 'Supreme Administrator', 'supreme@bnu.ac.uk', hashedPassword, 'supreme_admin', 'active', companyId]);
    
    // Verify
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    const orgCount = await db.get('SELECT COUNT(*) as count FROM organizations');
    
    console.log('✅ Database created successfully!');
    console.log(`📊 Users: ${userCount.count}, Organizations: ${orgCount.count}`);
    console.log('🔑 Login credentials:');
    console.log('   Email: supreme@bnu.ac.uk');
    console.log('   Password: supreme123');
    
    await db.close();
    
  } catch (error) {
    console.error('❌ Database creation failed:', error.message);
    throw error;
  }
}

createSimpleDatabase();
