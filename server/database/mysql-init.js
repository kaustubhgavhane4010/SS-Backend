import { getConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const initMySQLDatabase = async () => {
  try {
    console.log('🚀 Initializing MySQL database...');
    
    const pool = await getConnection();
    
    // Create tables
    await createTables(pool);
    
    // Create default admin user if no users exist
    await createDefaultAdmin(pool);
    
    console.log('✅ MySQL database initialized successfully!');
    
  } catch (error) {
    console.error('❌ MySQL database initialization failed:', error.message);
    throw error;
  }
};

const createTables = async (pool) => {
  console.log('🔨 Creating MySQL tables...');
  
  // Users table with new hierarchy system
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('supreme_admin', 'admin', 'university_admin', 'senior_leadership', 'dean', 'manager', 'team_member') NOT NULL,
      organization_id VARCHAR(36),
      department VARCHAR(255),
      phone VARCHAR(50),
      avatar VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(36),
      is_active BOOLEAN DEFAULT TRUE,
      INDEX idx_email (email),
      INDEX idx_role (role),
      INDEX idx_organization (organization_id)
    )
  `);
  
  // Organizations table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS organizations (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type ENUM('company', 'university', 'department') NOT NULL,
      status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
      description TEXT,
      address TEXT,
      phone VARCHAR(50),
      email VARCHAR(255),
      website VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(36),
      is_active BOOLEAN DEFAULT TRUE,
      INDEX idx_name (name),
      INDEX idx_type (type),
      INDEX idx_status (status)
    )
  `);
  
  // Teams table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS teams (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      organization_id VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(36),
      is_active BOOLEAN DEFAULT TRUE,
      INDEX idx_organization (organization_id),
      INDEX idx_name (name)
    )
  `);
  
  // Tickets table (keeping existing structure)
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tickets (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      category VARCHAR(100),
      assigned_to VARCHAR(36),
      created_by VARCHAR(36) NOT NULL,
      organization_id VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      resolved_at TIMESTAMP NULL,
      INDEX idx_status (status),
      INDEX idx_priority (priority),
      INDEX idx_assigned_to (assigned_to),
      INDEX idx_created_by (created_by),
      INDEX idx_organization (organization_id)
    )
  `);
  
  // Notes table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id VARCHAR(36) PRIMARY KEY,
      ticket_id VARCHAR(36) NOT NULL,
      content TEXT NOT NULL,
      created_by VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_ticket (ticket_id),
      INDEX idx_created_by (created_by)
    )
  `);
  
  // Attachments table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS attachments (
      id VARCHAR(36) PRIMARY KEY,
      ticket_id VARCHAR(36) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100),
      size BIGINT,
      path VARCHAR(500) NOT NULL,
      created_by VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ticket (ticket_id),
      INDEX idx_created_by (created_by)
    )
  `);
  
  console.log('✅ All tables created successfully');
};

const createDefaultAdmin = async (pool) => {
  try {
    // Check if users exist
    const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
    
    if (users[0].count === 0) {
      console.log('👤 Creating default Supreme Admin user...');
      
      // Create default organization first
      const defaultOrgId = uuidv4();
      await pool.execute(`
        INSERT INTO organizations (id, name, type, status, description, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [defaultOrgId, 'BNU Enterprise', 'company', 'active', 'Default organization for system administration', defaultOrgId]);
      
      // Create Supreme Admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.execute(`
        INSERT INTO users (id, name, email, password, role, organization_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [defaultOrgId, 'Supreme Administrator', 'supreme@bnu.ac.uk', hashedPassword, 'supreme_admin', defaultOrgId, defaultOrgId]);
      
      console.log('✅ Default Supreme Admin user created');
    } else {
      console.log('✅ Users already exist, skipping default user creation');
    }
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
    throw error;
  }
};
