import mysql from 'mysql2/promise';

// Try to get MySQL connection from Railway service discovery
const getRailwayMySQLConfig = () => {
  // Railway automatically provides these when services are linked
  if (process.env.RAILWAY_MYSQL_HOST) {
    return {
      host: process.env.RAILWAY_MYSQL_HOST,
      port: process.env.RAILWAY_MYSQL_PORT || 3306,
      user: process.env.RAILWAY_MYSQL_USER || 'root',
      password: process.env.RAILWAY_MYSQL_PASSWORD || '',
      database: process.env.RAILWAY_MYSQL_DATABASE || 'railway'
    };
  }
  
  // Fallback to manual environment variables
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'campus_assist'
  };
};

// MySQL connection configuration
const mysqlConfig = {
  ...getRailwayMySQLConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Debug environment variables
console.log('🔧 MySQL Config Debug:');
console.log('  MYSQL_HOST:', process.env.MYSQL_HOST || 'NOT SET (defaulting to localhost)');
console.log('  MYSQL_PORT:', process.env.MYSQL_PORT || 'NOT SET (defaulting to 3306)');
console.log('  MYSQL_USER:', process.env.MYSQL_USER || 'NOT SET (defaulting to root)');
console.log('  MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? 'SET' : 'NOT SET');
console.log('  MYSQL_DATABASE:', process.env.MYSQL_DATABASE || 'NOT SET (defaulting to campus_assist)');
console.log('  Final config:', mysqlConfig);

// Create connection pool
let pool;

export const getMySQLPool = () => {
  if (!pool) {
    pool = mysql.createPool(mysqlConfig);
    console.log('🔗 MySQL connection pool created');
  }
  return pool;
};

export const getMySQLConnection = async () => {
  const pool = getMySQLPool();
  return await pool.getConnection();
};

export const closeMySQLPool = async () => {
  if (pool) {
    await pool.end();
    console.log('🔌 MySQL connection pool closed');
  }
};

// Test MySQL connection
export const testMySQLConnection = async () => {
  try {
    const connection = await getMySQLConnection();
    await connection.ping();
    connection.release();
    console.log('✅ MySQL connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection test failed:', error.message);
    return false;
  }
};

export default mysqlConfig;
