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

export const getDatabase = () => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
};

export const initDatabase = async () => {
  try {
    console.log('🚀 Initializing MySQL database...');
    
    // Create connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection successful');
    connection.release();
    
    console.log('🎉 MySQL database initialized successfully!');
    console.log('📍 Database host:', dbConfig.host);
    console.log('📊 Database name:', dbConfig.database);
    
  } catch (error) {
    console.error('❌ MySQL database initialization failed:', error.message);
    throw error;
  }
};

export const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 MySQL connection pool closed');
  }
};

// Helper function for executing queries
export const executeQuery = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Query execution failed:', error.message);
    throw error;
  }
};

// Helper function for executing single row queries
export const executeQuerySingle = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows[0];
  } catch (error) {
    console.error('❌ Query execution failed:', error.message);
    throw error;
  }
};

export default dbConfig;
