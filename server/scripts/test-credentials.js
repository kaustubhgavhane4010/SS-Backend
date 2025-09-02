import mysql from 'mysql2/promise';

console.log('🔍 Testing Different IONOS Credentials...');

// Try different possible credentials
const credentials = [
  { user: 'dbu1839369', password: 'Sai@40104010' },
  { user: 'dbu1839369', password: 'Sai40104010' },
  { user: 'dbu1839369', password: 'Sai@40104010' },
  { user: 'root', password: 'Sai@40104010' },
  { user: 'admin', password: 'Sai@40104010' }
];

const dbConfig = {
  host: '37.120.189.6', // The IP that was reachable
  port: 3306,
  database: 'dbs14720204',
  connectTimeout: 10000
};

async function testCredentials() {
  for (const cred of credentials) {
    try {
      console.log(`\n🔍 Testing: ${cred.user} / ${cred.password}`);
      
      const connection = await mysql.createConnection({
        ...dbConfig,
        user: cred.user,
        password: cred.password
      });
      
      console.log(`✅ SUCCESS! Connected with ${cred.user}`);
      
      // Test if this is the right database
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ Database query successful');
      
      await connection.end();
      console.log(`🎯 WORKING CREDENTIALS: ${cred.user} / ${cred.password}`);
      
      return cred;
      
    } catch (error) {
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log(`❌ Wrong credentials for ${cred.user}`);
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        console.log(`✅ Credentials work but database doesn't exist`);
      } else {
        console.log(`❌ Error: ${error.code}`);
      }
    }
  }
  
  console.log('\n❌ No working credentials found');
  return null;
}

testCredentials();
