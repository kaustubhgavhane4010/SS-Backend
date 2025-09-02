import fs from 'fs';
import path from 'path';

console.log('💾 CREATING DATA BACKUP...');

function backupDatabase() {
  try {
    const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL || process.env.PORT;
    const sourcePath = isRailway ? '/app/campus-assist.db' : path.join(process.cwd(), 'campus-assist.db');
    const backupPath = isRailway ? '/app/campus-assist.backup.db' : path.join(process.cwd(), 'campus-assist.backup.db');
    
    if (fs.existsSync(sourcePath)) {
      // Create backup with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const timestampedBackup = backupPath.replace('.db', `.${timestamp}.db`);
      
      fs.copyFileSync(sourcePath, timestampedBackup);
      console.log('✅ Database backup created at:', timestampedBackup);
      
      // Verify backup
      const sourceSize = fs.statSync(sourcePath).size;
      const backupSize = fs.statSync(timestampedBackup).size;
      
      if (sourceSize === backupSize) {
        console.log('✅ Backup verification successful');
        console.log(`📊 Source size: ${sourceSize} bytes`);
        console.log(`📊 Backup size: ${backupSize} bytes`);
      } else {
        console.log('⚠️ Backup size mismatch - backup may be corrupted');
      }
      
      // Keep only last 3 backups
      const backupDir = path.dirname(backupPath);
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('campus-assist.backup.') && file.endsWith('.db'))
        .sort()
        .reverse();
      
      if (backupFiles.length > 3) {
        const filesToDelete = backupFiles.slice(3);
        filesToDelete.forEach(file => {
          fs.unlinkSync(path.join(backupDir, file));
          console.log('🗑️ Removed old backup:', file);
        });
      }
      
    } else {
      console.log('⚠️ Source database not found, skipping backup');
    }
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}

backupDatabase();
