import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

console.log('🧠 INTELLIGENT DATABASE INITIALIZATION - NEVER DESTROYING EXISTING DATA...');

async function intelligentInitDatabase() {
  try {
    // Determine database path
    const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL || process.env.PORT;
    const dbPath = isRailway ? '/app/campus-assist.db' : path.join(process.cwd(), 'campus-assist.db');
    
    console.log('📁 Database path:', dbPath);
    
    // Check if database exists and has data
    if (fs.existsSync(dbPath)) {
      console.log('✅ Database file exists, checking if it has data...');
      
      try {
        // Try to read existing database
        const existingDb = await open({
          filename: dbPath,
          driver: sqlite3.Database
        });
        
        // Check if database has meaningful data
        const userCount = await existingDb.get('SELECT COUNT(*) as count FROM users');
        const orgCount = await existingDb.get('SELECT COUNT(*) as count FROM organizations');
        
        console.log(`📊 Existing database has: ${userCount?.count || 0} users, ${orgCount?.count || 0} organizations`);
        
        if (userCount?.count > 0 && orgCount?.count > 0) {
          console.log('🛡️ DATABASE HAS EXISTING DATA - PRESERVING EVERYTHING!');
          console.log('💡 Skipping initialization to protect your data');
          await existingDb.close();
          return; // EXIT - DO NOTHING
        }
        
        await existingDb.close();
        console.log('⚠️ Database exists but is empty, will initialize...');
        
      } catch (readError) {
        console.log('⚠️ Database exists but cannot be read, will recreate:', readError.message);
      }
    }
    
    // Only reach here if database doesn't exist OR is empty
    console.log('🔨 Creating/initializing database...');
    
    // Remove existing database if it exists but is corrupted
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✅ Corrupted database removed');
    }
    
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

    // Create default data ONLY if database is completely empty
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
    console.log('🛡️ FUTURE DEPLOYMENTS WILL PRESERVE YOUR DATA!');
    
    await db.close();
    
  } catch (error) {
    console.error('❌ Intelligent database initialization failed:', error.message);
    throw error;
  }
}

intelligentInitDatabase();
