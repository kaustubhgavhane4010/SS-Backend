import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

console.log('🚨 FORCE DATABASE RECREATION - Fixing authentication issue...');

async function forceInitDatabase() {
  try {
    // Determine database path
    const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL || process.env.PORT;
    const dbPath = isRailway ? '/app/campus-assist.db' : path.join(process.cwd(), 'campus-assist.db');
    
    console.log('📁 Database path:', dbPath);
    console.log('🚨 REMOVING EXISTING DATABASE...');
    
    // Remove existing database if it exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✅ Old database removed');
    }
    
    console.log('🔨 Creating fresh database...');
    
    // Create new database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create tables
    console.log('📋 Creating tables...');
    
    // Users table
    await db.exec(`
      CREATE TABLE users (
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

    // Organizations table
    await db.exec(`
      CREATE TABLE organizations (
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

    // Teams table
    await db.exec(`
      CREATE TABLE teams (
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
      CREATE TABLE user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create default data
    console.log('👤 Creating default admin user...');
    
    const supremeAdminId = uuidv4();
    const hashedPassword = await bcrypt.hash('supreme123', 12);
    
    // Create default organization
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
    
    // Verify data
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    const orgCount = await db.get('SELECT COUNT(*) as count FROM organizations');
    
    console.log('✅ Database created successfully!');
    console.log(`📊 Users: ${userCount.count}, Organizations: ${orgCount.count}`);
    console.log('🔑 Default login:');
    console.log('   Email: supreme@bnu.ac.uk');
    console.log('   Password: supreme123');
    
    await db.close();
    
  } catch (error) {
    console.error('❌ Force database creation failed:', error.message);
    throw error;
  }
}

forceInitDatabase();
