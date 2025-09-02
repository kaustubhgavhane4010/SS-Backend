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
  // Remove invalid options that cause warnings
  // acquireTimeout: 60000,
  // timeout: 60000,
  // reconnect: true,
  // Add SSL configuration for IONOS
  ssl: {
    rejectUnauthorized: false
  }
};

// Create connection pool
let pool;

export const getConnection = async () => {
  try {
    if (!pool) {
      console.log('🔌 Creating MySQL connection pool...');
      console.log('📡 Connecting to:', dbConfig.host);
      console.log('🗄️ Database:', dbConfig.database);
      console.log('👤 User:', dbConfig.user);
      
      // Test DNS resolution first
      try {
        const dns = require('dns').promises;
        await dns.lookup(dbConfig.host);
        console.log('✅ DNS resolution successful');
      } catch (dnsError) {
        console.error('❌ DNS resolution failed:', dnsError.message);
        console.log('🔄 This suggests a network connectivity issue');
      }
      
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
      console.error('🚨 DNS Resolution Failed - Possible causes:');
      console.error('   1. IONOS database hostname is incorrect');
      console.error('   2. Railway cannot reach IONOS servers');
      console.error('   3. Firewall blocking outbound connections');
      console.error('   4. IONOS database is not accessible from Railway');
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
