import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'campus_assist',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

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
