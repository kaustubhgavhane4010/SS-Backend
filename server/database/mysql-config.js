import mysql from 'mysql2/promise';

// MySQL Database Configuration
const dbConfig = {
  host: 'db5018543224.hosting-data.io',
  port: 3306,
  user: 'dbu1839369',
  password: process.env.MYSQL_PASSWORD, // We'll set this in Railway
  database: process.env.MYSQL_DATABASE || 'db5018543224', // Usually the same as user
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

let pool;

export const getDatabase = () => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
};

export const initDatabase = async () => {
  try {
    console.log('🚀 Initializing MySQL database connection...');
    console.log('📡 Connecting to IONOS MySQL server...');
    
    // Create connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection successful!');
    
    // Get database info
    const [rows] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as version');
    console.log(`📊 Connected to database: ${rows[0].current_db}`);
    console.log(`🔧 MySQL version: ${rows[0].version}`);
    
    // Create tables if they don't exist
    await createTables(connection);
    
    // Create default admin user if none exists
    await createDefaultAdmin(connection);
    
    connection.release();
    
    console.log('🎉 MySQL database initialization complete!');
    console.log('🛡️ Database is now ready and persistent!');
    
  } catch (error) {
    console.error('❌ MySQL initialization failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔐 Check your MySQL username and password');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🌐 Check your MySQL host and port');
    }
    
    throw error;
  }
};

const createTables = async (connection) => {
  console.log('📋 Creating database tables...');
  
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

  console.log('✅ All tables created successfully');
};

const createDefaultAdmin = async (connection) => {
  try {
    // Check if admin user exists
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['supreme_admin']
    );
    
    if (rows[0].count === 0) {
      console.log('👑 Creating default organization and supreme admin...');
      
      const companyId = crypto.randomUUID();
      const adminId = crypto.randomUUID();
      
      // Create default organization
      await connection.execute(
        'INSERT INTO organizations (id, name, type, status) VALUES (?, ?, ?, ?)',
        [companyId, 'BNU Enterprise', 'company', 'active']
      );
      
      // Create supreme admin user (password: supreme123)
      const hashedPassword = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.CG';
      
      await connection.execute(
        'INSERT INTO users (id, name, email, password_hash, role, status, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [adminId, 'Supreme Administrator', 'supreme@bnu.ac.uk', hashedPassword, 'supreme_admin', 'active', companyId]
      );
      
      console.log('✅ Default organization and supreme admin created');
      console.log('🔑 Login: supreme@bnu.ac.uk / supreme123');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.log('⚠️ User creation error (continuing):', error.message);
  }
};
