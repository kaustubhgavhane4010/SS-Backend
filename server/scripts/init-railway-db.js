import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

console.log('🚀 Checking Railway database...');

async function initRailwayDatabase() {
  try {
    // Check if database already exists
    const dbPath = '/tmp/campus-assist.db';
    
    if (fs.existsSync(dbPath)) {
      console.log('✅ Database already exists, checking if it has data...');
      
      // Open existing database to check data
      const existingDb = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      
      // Check if database has data
      const userCount = await existingDb.get('SELECT COUNT(*) as count FROM users');
      const orgCount = await existingDb.get('SELECT COUNT(*) as count FROM organizations');
      
      console.log(`📊 Existing database has: ${userCount.count} users, ${orgCount.count} organizations`);
      
      if (userCount.count > 0 && orgCount.count > 0) {
        console.log('✅ Database already has data, skipping initialization');
        await existingDb.close();
        return;
      }
      
      await existingDb.close();
      console.log('⚠️ Database exists but is empty, will initialize...');
    }
    
    console.log('📁 Creating/initializing database at:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create tables
    console.log('🔨 Creating tables...');
    
    // Users table
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

    // Organizations table
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

    // Teams table
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

    console.log('✅ Tables created successfully');

    // Insert initial seed data ONLY if no data exists
    console.log('📊 Inserting initial seed data...');

    // Create Supreme Admin user
    const supremeAdminId = uuidv4();
    const supremeAdminPassword = await bcrypt.hash('supreme123', 10);
    
    await db.run(`
      INSERT OR REPLACE INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [supremeAdminId, 'Supreme Administrator', 'supreme@bnu.ac.uk', supremeAdminPassword, 'supreme_admin', 'active']);

    // Create BNU Enterprise organization
    const bnuOrgId = uuidv4();
    await db.run(`
      INSERT OR REPLACE INTO organizations (id, name, type, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [bnuOrgId, 'BNU Enterprise', 'company', 'active', supremeAdminId]);

    // Create additional organizations (initial seed data)
    const org2Id = uuidv4();
    await db.run(`
      INSERT OR REPLACE INTO organizations (id, name, type, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [org2Id, 'Tech Solutions Inc', 'company', 'active', supremeAdminId]);

    const org3Id = uuidv4();
    await db.run(`
      INSERT OR REPLACE INTO organizations (id, name, type, status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [org3Id, 'Innovation Hub', 'company', 'active', supremeAdminId]);

    // Create additional users (initial seed data)
    const adminId = uuidv4();
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await db.run(`
      INSERT OR REPLACE INTO users (id, name, email, password_hash, role, status, organization_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [adminId, 'John Admin', 'admin@techsolutions.com', adminPassword, 'admin', 'active', org2Id]);

    const managerId = uuidv4();
    const managerPassword = await bcrypt.hash('manager123', 10);
    
    await db.run(`
      INSERT OR REPLACE INTO users (id, name, email, password_hash, role, status, organization_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [managerId, 'Sarah Manager', 'sarah@innovationhub.com', managerPassword, 'manager', 'active', org3Id]);

    console.log('✅ Initial seed data inserted successfully');

    // Verify data
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    const orgCount = await db.get('SELECT COUNT(*) as count FROM organizations');
    
    console.log(`📊 Database verification:`);
    console.log(`  👥 Users: ${userCount.count}`);
    console.log(`  🏢 Organizations: ${orgCount.count}`);

    await db.close();
    
    console.log('🎉 Railway database initialization complete!');
    console.log('🛡️ Your existing data is preserved!');
    
  } catch (error) {
    console.error('❌ Railway database initialization failed:', error.message);
    throw error;
  }
}

initRailwayDatabase();
