import fs from 'fs';
import path from 'path';

console.log('🛡️ DATA PROTECTION SYSTEM ACTIVATED...');

// Create a data protection flag file
function createDataProtectionFlag() {
  try {
    const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL || process.env.PORT;
    const flagPath = isRailway ? '/app/.data-protected' : path.join(process.cwd(), '.data-protected');
    
    if (!fs.existsSync(flagPath)) {
      fs.writeFileSync(flagPath, `Data Protection Activated: ${new Date().toISOString()}\nThis file prevents data loss.\nDO NOT DELETE.`);
      console.log('✅ Data protection flag created at:', flagPath);
    } else {
      console.log('🛡️ Data protection flag already exists');
    }
    
    // Check if database exists and has data
    const dbPath = isRailway ? '/app/campus-assist.db' : path.join(process.cwd(), 'campus-assist.db');
    
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`📊 Database file size: ${stats.size} bytes`);
      
      if (stats.size > 1000) { // If database has meaningful data
        console.log('🛡️ DATABASE HAS DATA - PROTECTION ACTIVE');
        console.log('💡 Future deployments will preserve your data');
      } else {
        console.log('⚠️ Database appears to be small/empty');
      }
    } else {
      console.log('⚠️ Database file not found');
    }
    
  } catch (error) {
    console.error('❌ Data protection setup failed:', error.message);
  }
}

createDataProtectionFlag();
