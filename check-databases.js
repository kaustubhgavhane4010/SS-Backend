const sqlite3 = require('sqlite3');
const { open } = require('sqlite3');
const fs = require('fs');

console.log('🔍 Checking all database files...\n');

// Check each database file
const databases = [
  'server/database/ticketing.db',
  'server/database/enterprise.db', 
  'campus-assist.db'
];

async function checkDatabase(dbPath) {
  if (!fs.existsSync(dbPath)) {
    console.log(`❌ ${dbPath} - FILE NOT FOUND`);
    return;
  }

  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Check users table
    let users = [];
    try {
      users = await db.all('SELECT id, name, email, role, organization_id FROM users WHERE status != "deleted"');
    } catch (e) {
      console.log(`  ❌ Users table error: ${e.message}`);
    }

    // Check organizations table
    let organizations = [];
    try {
      organizations = await db.all('SELECT id, name, status FROM organizations WHERE status != "deleted"');
    } catch (e) {
      console.log(`  ❌ Organizations table error: ${e.message}`);
    }

    const stats = fs.statSync(dbPath);
    console.log(`📁 ${dbPath} (${(stats.size / 1024).toFixed(1)}KB):`);
    console.log(`  👥 Users: ${users.length}`);
    console.log(`  🏢 Organizations: ${organizations.length}`);

    if (users.length > 0) {
      console.log(`  👥 Sample Users:`);
      users.slice(0, 3).forEach(user => {
        console.log(`    - ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    if (organizations.length > 0) {
      console.log(`  🏢 Sample Organizations:`);
      organizations.slice(0, 3).forEach(org => {
        console.log(`    - ${org.name} (${org.status})`);
      });
    }

    await db.close();
    console.log('');

  } catch (error) {
    console.log(`❌ ${dbPath} - ERROR: ${error.message}\n`);
  }
}

async function checkAll() {
  for (const dbPath of databases) {
    await checkDatabase(dbPath);
  }
  
  console.log('🔍 Database check complete!');
}

checkAll();
