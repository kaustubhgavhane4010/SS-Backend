import mysql from 'mysql2/promise';

// MySQL Database Configuration
const dbConfig = {
  host: 'db5018543224.hosting-data.io',
  port: 3306,
  user: 'dbu1839369',
  password: process.env.MYSQL_PASSWORD || 'your_mysql_password_here',
  database: 'Campus Asssit',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
let pool;

export const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    try {
      const connection = await pool.getConnection();
      console.log('✅ MySQL connection successful');
      connection.release();
    } catch (error) {
      console.error('❌ MySQL connection failed:', error.message);
      throw error;
    }
  }
  return pool;
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 MySQL connection pool closed');
  }
};

export default dbConfig;
