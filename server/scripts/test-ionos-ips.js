import mysql from 'mysql2/promise';

console.log('🔍 Testing Common IONOS IP Addresses...');

// Common IONOS IP ranges
const possibleIPs = [
  '37.120.189.1',
  '37.120.189.2', 
  '37.120.189.3',
  '37.120.189.4',
  '37.120.189.5',
  '37.120.189.6',
  '37.120.189.7',
  '37.120.189.8',
  '37.120.189.9',
  '37.120.189.10',
  '37.120.189.11',
  '37.120.189.12',
  '37.120.189.13',
  '37.120.189.14',
  '37.120.189.15',
  '37.120.189.16',
  '37.120.189.17',
  '37.120.189.18',
  '37.120.189.19',
  '37.120.189.20'
];

const dbConfig = {
  port: 3306,
  user: 'dbu1839369',
  password: 'Sai@40104010',
  database: 'dbs14720204',
  connectTimeout: 10000,
  acquireTimeout: 10000
};

async function testIPs() {
  for (const ip of possibleIPs) {
    try {
      console.log(`\n🔍 Testing IP: ${ip}`);
      
      const connection = await mysql.createConnection({
        ...dbConfig,
        host: ip
      });
      
      console.log(`✅ SUCCESS! Connected to ${ip}`);
      
      // Test if this is the right database
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ Database query successful');
      
      await connection.end();
      console.log(`🎯 FOUND WORKING IP: ${ip}`);
      console.log('💡 Use this IP in your database configuration');
      
      return ip;
      
    } catch (error) {
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log(`✅ IP ${ip} is reachable but wrong credentials`);
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        console.log(`✅ IP ${ip} is reachable but database doesn't exist`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`❌ IP ${ip} refused connection`);
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`⏰ IP ${ip} timed out`);
      } else {
        console.log(`❌ IP ${ip} error: ${error.code}`);
      }
    }
  }
  
  console.log('\n❌ No working IP found');
  return null;
}

testIPs();
