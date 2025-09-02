import mysql from 'mysql2/promise';

// MySQL Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'db5018543224.hosting-data.io',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'dbu1839369',
  password: process.env.DB_PASSWORD || 'Sai@40104010',
  database: process.env.DB_NAME || 'dbs14720204',
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
    console.log('🔌 MySQL connection pool created');
  }
  return pool;
};

export const closeConnection = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 MySQL connection pool closed');
  }
};

export default dbConfig;
