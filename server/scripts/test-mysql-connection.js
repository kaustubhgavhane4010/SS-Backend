import mysql from 'mysql2/promise';

console.log('🔍 Testing MySQL Connection to IONOS...');

const dbConfig = {
  host: 'db5018543224.hosting-data.io',
  port: 3306,
  user: 'dbu1839369',
  password: 'Sai@40104010',
  database: 'dbs14720204',
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
};

async function testConnection() {
  let connection;
  
  try {
    console.log('📍 Attempting to connect to:', dbConfig.host);
    console.log('👤 User:', dbConfig.user);
    console.log('📊 Database:', dbConfig.database);
    
    // Test connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ SUCCESS: Connected to MySQL database!');
    
    // Test basic query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ SUCCESS: Basic query executed:', rows[0]);
    
    // Check if database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📋 Available databases:');
    databases.forEach(db => console.log('  -', db.Database));
    
    // Check if our database exists
    const dbExists = databases.some(db => db.Database === 'dbs14720204');
    if (dbExists) {
      console.log('✅ Database "dbs14720204" exists!');
    } else {
      console.log('❌ Database "dbs14720204" does NOT exist!');
      console.log('💡 You need to create this database in IONOS first');
    }
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔑 Issue: Wrong username or password');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🌐 Issue: Connection refused - check host/port');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('📊 Issue: Database does not exist');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🌐 Issue: Host not found - check hostname');
    }
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed');
    }
  }
}

testConnection();
