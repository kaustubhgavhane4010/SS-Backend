const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

const backupData = async () => {
  console.log('🔍 Searching for existing database files...');
  
  const possiblePaths = [
    'server/database/ticketing.db',
    'server/database/enterprise.db',
    'Campus-Assist/server/database/ticketing.db',
    'Campus-Assist/server/database/enterprise.db'
  ];
  
  let existingData = {
    users: [],
    organizations: [],
    tickets: []
  };
  
  for (const dbPath of possiblePaths) {
    if (fs.existsSync(dbPath)) {
      console.log(`📁 Found database: ${dbPath}`);
      try {
        const db = await open({
          filename: dbPath,
          driver: sqlite3.Database
        });
        
        // Try to get users
        try {
          const users = await db.all('SELECT * FROM users');
          if (users.length > 0) {
            console.log(`👥 Found ${users.length} users in ${dbPath}`);
            existingData.users = [...existingData.users, ...users];
          }
        } catch (e) {
          console.log(`❌ No users table in ${dbPath}`);
        }
        
        // Try to get organizations
        try {
          const orgs = await db.all('SELECT * FROM organizations');
          if (orgs.length > 0) {
            console.log(`🏢 Found ${orgs.length} organizations in ${dbPath}`);
            existingData.organizations = [...existingData.organizations, ...orgs];
          }
        } catch (e) {
          console.log(`❌ No organizations table in ${dbPath}`);
        }
        
        await db.close();
      } catch (error) {
        console.log(`❌ Error reading ${dbPath}:`, error.message);
      }
    }
  }
  
  // Remove duplicates based on ID
  existingData.users = existingData.users.filter((user, index, self) => 
    index === self.findIndex(u => u.id === user.id)
  );
  
  existingData.organizations = existingData.organizations.filter((org, index, self) => 
    index === self.findIndex(o => o.id === org.id)
  );
  
  console.log(`\n📊 Total unique data found:`);
  console.log(`👥 Users: ${existingData.users.length}`);
  console.log(`🏢 Organizations: ${existingData.organizations.length}`);
  
  // Save backup
  const backupPath = 'data-backup.json';
  fs.writeFileSync(backupPath, JSON.stringify(existingData, null, 2));
  console.log(`\n💾 Backup saved to: ${backupPath}`);
  
  return existingData;
};

backupData().catch(console.error);
