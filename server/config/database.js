import mysql from 'mysql2/promise';

// MySQL Database Configuration for Railway
const parseMySQLURL = (url) => {
  if (!url) return null;
  
  try {
    // Parse mysql://user:password@host:port/database
    const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (match) {
      return {
        host: match[3],
        port: parseInt(match[4]),
        user: match[1],
        password: match[2],
        database: match[5]
      };
    }
  } catch (error) {
    console.error('❌ Failed to parse MYSQL_URL:', error.message);
  }
  return null;
};

const dbConfig = parseMySQLURL(process.env.MYSQL_URL) || {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'railway'
};

// Add connection pool settings
Object.assign(dbConfig, {
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create connection pool
let pool;

export const getConnection = async () => {
  try {
    if (!pool) {
      console.log('🔌 Creating MySQL connection pool...');
      console.log('📡 Connecting to:', dbConfig.host);
      console.log('🗄️ Database:', dbConfig.database);
      console.log('👤 User:', dbConfig.user);
      

      
      pool = mysql.createPool(dbConfig);
      
      // Test the connection immediately
      const testConnection = await pool.getConnection();
      console.log('✅ MySQL connection test successful!');
      testConnection.release();
      
      console.log('🔌 MySQL connection pool created successfully');
    }
    return pool;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.error('🔍 Connection details:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      ssl: dbConfig.ssl ? 'enabled' : 'disabled'
    });
    
    // Provide specific guidance based on error type
    if (error.code === 'ENOTFOUND') {
      console.error('🚨 DNS Resolution Failed - Cannot reach MySQL database');
      console.error('💡 SOLUTION: Check if MySQL service is running and accessible');
      console.error('🔄 FALLBACK: System will use SQLite fallback database');
    }
    
    throw error;
  }
};

export const testConnection = async () => {
  try {
    const pool = await getConnection();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ MySQL connection test passed');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection test failed:', error.message);
    return false;
  }
};

export const closeConnection = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 MySQL connection pool closed');
  }
};

export default dbConfig;
