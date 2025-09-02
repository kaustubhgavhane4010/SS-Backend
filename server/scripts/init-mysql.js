import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

console.log('🚀 Initializing MySQL Database for Campus Assist...');

const dbConfig = {
  host: 'db5018543224.hosting-data.io',
  port: 3306,
  user: 'dbu1839369',
  password: process.env.MYSQL_PASSWORD || 'your_mysql_password_here',
  database: 'Campus Asssit',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function initMySQLDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');
    
    // Create tables
    console.log('📋 Creating tables...');
    
    // Users table with 7-tier hierarchy
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('supreme_admin', 'admin', 'university_admin', 'senior_leadership', 'dean', 'manager', 'team_member') NOT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        organization_id VARCHAR(36),
        department VARCHAR(255),
        phone VARCHAR(50),
        avatar VARCHAR(255),
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_organization (organization_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Organizations table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('company', 'university', 'department') NOT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        parent_organization_id VARCHAR(36),
        settings JSON,
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_parent (parent_organization_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Teams table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        organization_id VARCHAR(36) NOT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_organization (organization_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // User sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_token (token),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Tickets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tickets (
        id VARCHAR(36) PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        student_email VARCHAR(255) NOT NULL,
        student_id VARCHAR(100),
        course VARCHAR(255) NOT NULL,
        category ENUM('Academic', 'IT Support', 'Finance', 'Accommodation', 'Other') NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL,
        status ENUM('Open', 'In Progress', 'Pending', 'Closed') NOT NULL DEFAULT 'Open',
        assigned_to VARCHAR(36),
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        due_date TIMESTAMP NULL,
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_assigned (assigned_to),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Notes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR(36) PRIMARY KEY,
        ticket_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        note_type ENUM('Internal', 'Student Communication', 'System Update') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ticket (ticket_id),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Attachments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attachments (
        id VARCHAR(36) PRIMARY KEY,
        ticket_id VARCHAR(36) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        uploaded_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ticket (ticket_id),
        INDEX idx_uploader (uploaded_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ All tables created successfully');
    
    // Check if default admin user exists
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    if (users[0].count === 0) {
      console.log('👤 Creating default admin user...');
      
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('supreme123', 12);
      
      // Create default organization
      const companyId = uuidv4();
      await connection.execute(`
        INSERT INTO organizations (id, name, type, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [companyId, 'BNU Enterprise', 'company', 'active', adminId]);
      
      // Create supreme admin user
      await connection.execute(`
        INSERT INTO users (id, name, email, password_hash, role, status, organization_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [adminId, 'Supreme Administrator', 'supreme@bnu.ac.uk', hashedPassword, 'supreme_admin', 'active', companyId]);
      
      console.log('✅ Default admin user created');
      console.log('🔑 Login credentials:');
      console.log('   Email: supreme@bnu.ac.uk');
      console.log('   Password: supreme123');
    } else {
      console.log('🛡️ Users already exist, skipping default user creation');
    }
    
    // Verify data
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [orgCount] = await connection.execute('SELECT COUNT(*) as count FROM organizations');
    
    console.log('📊 Database verification:');
    console.log(`  👥 Users: ${userCount[0].count}`);
    console.log(`  🏢 Organizations: ${orgCount[0].count}`);
    
    console.log('🎉 MySQL database initialization complete!');
    
  } catch (error) {
    console.error('❌ MySQL database initialization failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL connection closed');
    }
  }
}

initMySQLDatabase();
