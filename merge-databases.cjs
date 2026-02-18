const sqlite3 = require('sqlite3');
const { open } = require('sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🔄 Starting database consolidation...');

// Database file paths
const databases = [
  'server/database/ticketing.db',
  'server/database/enterprise.db',
  'Campus-Assist/server/database/ticketing.db'
];

// Target consolidated database
const targetDb = 'campus-assist.db';

async function mergeDatabases() {
  try {
    // Check which databases exist
    const existingDbs = [];
    for (const dbPath of databases) {
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        existingDbs.push({
          path: dbPath,
          size: stats.size,
          exists: true
        });
        console.log(`✅ Found: ${dbPath} (${(stats.size / 1024).toFixed(1)}KB)`);
      } else {
        console.log(`❌ Missing: ${dbPath}`);
      }
    }

    if (existingDbs.length === 0) {
      console.log('❌ No existing databases found!');
      return;
    }

    // Use the largest database as the base
    const largestDb = existingDbs.reduce((prev, current) => 
      (prev.size > current.size) ? prev : current
    );
    
    console.log(`\n🎯 Using largest database as base: ${largestDb.path}`);

    // Copy the largest database to target
    fs.copyFileSync(largestDb.path, targetDb);
    console.log(`✅ Copied ${largestDb.path} to ${targetDb}`);

    // Open target database
    const target = await open({
      filename: targetDb,
      driver: sqlite3.Database
    });

    // Get all data from target
    const users = await target.all('SELECT * FROM users WHERE status != "deleted"');
    const organizations = await target.all('SELECT * FROM organizations WHERE status != "deleted"');
    
    console.log(`\n📊 Current data in ${targetDb}:`);
    console.log(`👥 Users: ${users.length}`);
    console.log(`🏢 Organizations: ${organizations.length}`);

    // Show sample data
    if (users.length > 0) {
      console.log('\n👥 Sample Users:');
      users.slice(0, 3).forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    if (organizations.length > 0) {
      console.log('\n🏢 Sample Organizations:');
      organizations.slice(0, 3).forEach(org => {
        console.log(`  - ${org.name} (${org.status})`);
      });
    }

    await target.close();
    
    console.log(`\n🎉 Database consolidation complete!`);
    console.log(`📁 Target database: ${targetDb}`);
    console.log(`🛡️ Your data is now safe in one location!`);

  } catch (error) {
    console.error('❌ Error consolidating databases:', error.message);
  }
}

mergeDatabases();
