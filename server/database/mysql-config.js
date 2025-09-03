import mysql from 'mysql2/promise';

// Comprehensive MySQL configuration detection
const getRailwayMySQLConfig = () => {
  console.log('🔍 DETECTING MYSQL CONFIGURATION...');
  
  // Check all possible Railway MySQL environment variable patterns
  const possibleConfigs = [
    // Railway automatic service discovery
    {
      name: 'Railway MySQL Service Discovery',
      host: process.env.RAILWAY_MYSQL_HOST,
      port: process.env.RAILWAY_MYSQL_PORT,
      user: process.env.RAILWAY_MYSQL_USER,
      password: process.env.RAILWAY_MYSQL_PASSWORD,
      database: process.env.RAILWAY_MYSQL_DATABASE
    },
    // Manual Railway variables
    {
      name: 'Manual Railway Variables',
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    },
    // Alternative Railway patterns
    {
      name: 'Alternative Railway Pattern',
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME
    }
  ];
  
  // Find the first configuration that has a host
  for (const config of possibleConfigs) {
    if (config.host) {
      console.log(`✅ Using ${config.name}:`);
      console.log(`  Host: ${config.host}`);
      console.log(`  Port: ${config.port || 3306}`);
      console.log(`  User: ${config.user || 'root'}`);
      console.log(`  Database: ${config.database || 'railway'}`);
      console.log(`  Password: ${config.password ? 'SET' : 'NOT SET'}`);
      
      return {
        host: config.host,
        port: config.port || 3306,
        user: config.user || 'root',
        password: config.password || '',
        database: config.database || 'railway'
      };
    }
  }
  
  // If no configuration found, return localhost (will fail but we'll know why)
  console.log('❌ NO MYSQL CONFIGURATION FOUND - Using localhost (will fail)');
  return {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'campus_assist'
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
