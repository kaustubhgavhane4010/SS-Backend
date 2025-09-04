import { getMySQLPool, testMySQLConnection } from './mysql-config.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

let pool;

export const getDatabase = () => {
  if (!pool) {
    pool = getMySQLPool();
  }
  return pool;
};

export const initDatabase = async () => {
  try {
    console.log('🚀 Initializing MySQL database...');
    
    // Test connection first
    const connectionTest = await testMySQLConnection();
    if (!connectionTest) {
      throw new Error('MySQL connection test failed');
    }

    pool = getMySQLPool();
    console.log('✅ MySQL connection pool established');

    // Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Create tables
    await createTables();
    
    // Create default admin user if no users exist
    await createDefaultAdmin();
    
    console.log('🎉 MySQL database initialized successfully!');
    
  } catch (error) {
    console.error('❌ MySQL database initialization failed:', error.message);
    throw error;
  }
};

const createDatabaseIfNotExists = async () => {
  try {
    const dbName = process.env.MYSQL_DATABASE || 'campus_assist';
    
    // For Railway, the database already exists, so we just use it
    console.log(`🎯 Using database '${dbName}'`);
    
  } catch (error) {
    console.error('Error using database:', error);
    throw error;
  }
};

const createTables = async () => {
  try {
    console.log('📋 Creating MySQL tables...');

    // Users table first (no foreign key dependencies)
    await pool.execute(`
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
        avatar TEXT,
        INDEX idx_users_email (email),
        INDEX idx_users_role (role),
        INDEX idx_users_status (status),
        INDEX idx_users_organization (organization_id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Organizations table for enterprise management
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('company', 'university', 'department', 'government', 'non-profit') NOT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        parent_organization_id VARCHAR(36),
        settings JSON,
        INDEX idx_organizations_type (type),
        INDEX idx_organizations_status (status),
        INDEX idx_organizations_parent (parent_organization_id),
        FOREIGN KEY (created_by) REFERENCES users (id),
        FOREIGN KEY (parent_organization_id) REFERENCES organizations (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Add foreign key constraint to users table after organizations table exists (if not already exists)
    try {
      await pool.execute(`
        ALTER TABLE users 
        ADD CONSTRAINT fk_users_organization 
        FOREIGN KEY (organization_id) REFERENCES organizations (id)
      `);
    } catch (error) {
      if (error.code !== 'ER_FK_DUP_NAME') {
        throw error;
      }
      // Constraint already exists, continue
    }

    // Update organization type ENUM to include new types (if needed)
    try {
      await pool.execute(`
        ALTER TABLE organizations 
        MODIFY COLUMN type ENUM('company', 'university', 'department', 'government', 'non-profit') NOT NULL
      `);
      console.log('✅ Updated organization type ENUM to include government and non-profit');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️ Organization type ENUM already updated or no changes needed');
      } else {
        console.log('⚠️ Could not update organization type ENUM:', error.message);
      }
    }

    // Tickets table
    await pool.execute(`
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
        INDEX idx_tickets_status (status),
        INDEX idx_tickets_priority (priority),
        INDEX idx_tickets_assigned_to (assigned_to),
        INDEX idx_tickets_created_at (created_at),
        INDEX idx_tickets_category (category),
        FOREIGN KEY (assigned_to) REFERENCES users (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Notes table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR(36) PRIMARY KEY,
        ticket_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        note_type ENUM('Internal', 'Student Communication', 'System Update') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_notes_ticket_id (ticket_id),
        INDEX idx_notes_user_id (user_id),
        INDEX idx_notes_created_at (created_at),
        FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Attachments table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS attachments (
        id VARCHAR(36) PRIMARY KEY,
        ticket_id VARCHAR(36) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        uploaded_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_attachments_ticket_id (ticket_id),
        INDEX idx_attachments_uploaded_by (uploaded_by),
        FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // User sessions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_sessions_token (token),
        INDEX idx_user_sessions_expires_at (expires_at),
        INDEX idx_user_sessions_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ All MySQL tables created successfully');

  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

const createDefaultAdmin = async () => {
  try {
    // Check if any users exist
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
    
    if (rows[0].count === 0) {
      console.log('👤 Creating default admin user...');
      
      // Create default supreme admin user first
      const supremeAdminId = uuidv4();
      const hashedPassword = await bcrypt.hash('supreme123', 12);
      
      // Create supreme admin user without organization_id first
      await pool.execute(`
        INSERT INTO users (id, name, email, password_hash, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [supremeAdminId, 'Supreme Administrator', 'supreme@bnu.ac.uk', hashedPassword, 'supreme_admin', 'active']);
      
      // Create default company organization
      const companyId = uuidv4();
      await pool.execute(`
        INSERT INTO organizations (id, name, type, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [companyId, 'BNU Enterprise', 'company', 'active', supremeAdminId]);
      
      // Update user with organization_id
      await pool.execute(`
        UPDATE users SET organization_id = ? WHERE id = ?
      `, [companyId, supremeAdminId]);
      
      console.log('✅ Default Supreme Admin user created:');
      console.log('📧 Email: supreme@bnu.ac.uk');
      console.log('🔑 Password: supreme123');
      console.log('⚠️  Please change the password after first login!');
    } else {
      console.log('👥 Users already exist, skipping default admin creation');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};
