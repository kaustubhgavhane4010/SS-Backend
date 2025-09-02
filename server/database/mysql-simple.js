import mysql from 'mysql2/promise';

// MySQL Database Configuration
const dbConfig = {
  host: 'db5018543224.hosting-data.io',
  port: 3306,
  user: 'dbu1839369',
  password: 'Sai@40104010',
  database: 'db5018543224',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  acquireTimeout: 30000,
  timeout: 30000,
  reconnect: true
};

let pool = null;

export const getDatabase = () => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
};

export const initDatabase = async () => {
  try {
    console.log('🚀 Starting MySQL connection...');
    
    // Create connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test connection with timeout
    const connection = await Promise.race([
      pool.getConnection(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ]);
    
    console.log('✅ MySQL connection successful!');
    
    // Get database info
    const [rows] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as version');
    console.log(`📊 Connected to: ${rows[0].current_db}`);
    console.log(`🔧 MySQL version: ${rows[0].version}`);
    
    // Create tables
    await createTables(connection);
    
    // Create default admin
    await createDefaultAdmin(connection);
    
    connection.release();
    console.log('🎉 MySQL setup complete!');
    
  } catch (error) {
    console.error('⚠️ MySQL connection failed:', error.message);
    console.log('🔄 Continuing without database - server will start anyway');
    
    // Don't throw - let server continue
    pool = null;
  }
};

const createTables = async (connection) => {
  console.log('📋 Creating tables...');
  
  // Users table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('supreme_admin', 'admin', 'university_admin', 'senior_leadership', 'dean', 'manager', 'team_member') NOT NULL,
      status ENUM('active', 'inactive') DEFAULT 'active',
      organization_id VARCHAR(36),
      department VARCHAR(255),
      phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Organizations table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS organizations (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type ENUM('company', 'university', 'department') NOT NULL,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Teams table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS teams (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      organization_id VARCHAR(36) NOT NULL,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id)
    )
  `);

  // User sessions table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      token VARCHAR(500) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Tables created successfully');
};

const createDefaultAdmin = async (connection) => {
  try {
    // Check if admin exists
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['supreme_admin']
    );
    
    if (rows[0].count === 0) {
      console.log('👑 Creating default admin...');
      
      const companyId = crypto.randomUUID();
      const adminId = crypto.randomUUID();
      
      // Create organization
      await connection.execute(
        'INSERT INTO organizations (id, name, type, status) VALUES (?, ?, ?, ?)',
        [companyId, 'BNU Enterprise', 'company', 'active']
      );
      
      // Create admin user (password: supreme123)
      const hashedPassword = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.CG';
      
      await connection.execute(
        'INSERT INTO users (id, name, email, password_hash, role, status, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [adminId, 'Supreme Administrator', 'supreme@bnu.ac.uk', hashedPassword, 'supreme_admin', 'active', companyId]
      );
      
      console.log('✅ Default admin created: supreme@bnu.ac.uk / supreme123');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.log('⚠️ Admin creation error:', error.message);
  }
};
