import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

console.log('🔄 Creating database backup...');

async function backupDatabase() {
  try {
    const sourcePath = path.join(process.cwd(), 'campus-assist.db');
    const backupPath = path.join(process.cwd(), 'campus-assist.backup.db');
    
    if (fs.existsSync(sourcePath)) {
      // Create backup
      fs.copyFileSync(sourcePath, backupPath);
      console.log('✅ Database backup created at:', backupPath);
      
      // Verify backup
      const sourceSize = fs.statSync(sourcePath).size;
      const backupSize = fs.statSync(backupPath).size;
      
      if (sourceSize === backupSize) {
        console.log('✅ Backup verification successful');
        console.log(`📊 Source size: ${sourceSize} bytes`);
        console.log(`📊 Backup size: ${backupSize} bytes`);
      } else {
        console.log('⚠️ Backup size mismatch - backup may be corrupted');
      }
    } else {
      console.log('⚠️ Source database not found, skipping backup');
    }
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}

backupDatabase();
