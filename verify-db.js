import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying Railway database...');

async function verifyDatabase() {
  try {
    // Check multiple possible database paths
    const possiblePaths = [
      'campus-assist.db',
      '/app/campus-assist.db',
      path.join(process.cwd(), 'campus-assist.db'),
      'server/campus-assist.db'
    ];

    console.log('🔍 Current working directory:', process.cwd());
    console.log('🔍 Environment variables:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
    console.log('  - PORT:', process.env.PORT);

    for (const dbPath of possiblePaths) {
      console.log(`\n📁 Checking path: ${dbPath}`);
      
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        console.log(`  ✅ File exists: ${(stats.size / 1024).toFixed(1)}KB`);
        
        try {
          const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
          });

          // Check tables
          const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
          console.log(`  📊 Tables found: ${tables.length}`);
          tables.forEach(table => console.log(`    - ${table.name}`));

          // Check users count
          const userCount = await db.get("SELECT COUNT(*) as count FROM users");
          console.log(`  👥 Users count: ${userCount.count}`);

          // Check organizations count
          const orgCount = await db.get("SELECT COUNT(*) as count FROM organizations");
          console.log(`  🏢 Organizations count: ${orgCount.count}`);

          // Show sample data
          if (userCount.count > 0) {
            const users = await db.all("SELECT name, email, role FROM users LIMIT 3");
            console.log(`  👥 Sample users:`);
            users.forEach(user => console.log(`    - ${user.name} (${user.email}) - ${user.role}`));
          }

          if (orgCount.count > 0) {
            const orgs = await db.all("SELECT name, type FROM organizations LIMIT 3");
            console.log(`  🏢 Sample organizations:`);
            orgs.forEach(org => console.log(`    - ${org.name} (${org.type})`));
          }

          await db.close();
          break; // Found working database
          
        } catch (error) {
          console.log(`  ❌ Database error: ${error.message}`);
        }
      } else {
        console.log(`  ❌ File not found`);
      }
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyDatabase();
