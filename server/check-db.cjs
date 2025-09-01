const sqlite3 = require('sqlite3');
const fs = require('fs');

console.log('🔍 Checking all database files...\n');

// Check each database file
const databases = [
  'database/ticketing.db',
  'database/enterprise.db', 
  '../campus-assist.db'
];

function checkDatabase(dbPath) {
  if (!fs.existsSync(dbPath)) {
    console.log(`❌ ${dbPath} - FILE NOT FOUND`);
    return;
  }

  try {
    const stats = fs.statSync(dbPath);
    console.log(`📁 ${dbPath} (${(stats.size / 1024).toFixed(1)}KB):`);
    
    // Try to open database
    const db = new sqlite3.Database(dbPath);
    
    // Check if database is valid
    db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
      if (err) {
        console.log(`  ❌ Database error: ${err.message}`);
      } else {
        console.log(`  ✅ Database is valid`);
        
        // Count users
        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
          if (err) {
            console.log(`  ❌ Users table error: ${err.message}`);
          } else {
            console.log(`  👥 Users: ${row.count}`);
          }
          
          // Count organizations
          db.get("SELECT COUNT(*) as count FROM organizations", (err, row) => {
            if (err) {
              console.log(`  ❌ Organizations table error: ${err.message}`);
            } else {
              console.log(`  🏢 Organizations: ${row.count}`);
            }
            
            db.close();
            console.log('');
          });
        });
      }
    });

  } catch (error) {
    console.log(`❌ ${dbPath} - ERROR: ${error.message}\n`);
  }
}

function checkAll() {
  for (const dbPath of databases) {
    checkDatabase(dbPath);
  }
  
  console.log('🔍 Database check complete!');
}

checkAll();
