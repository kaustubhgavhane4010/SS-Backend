import fs from 'fs';
import path from 'path';

console.log('🚀 Setting up Railway database...');

// Source database (your consolidated data)
const sourceDb = 'campus-assist.db';
const railwayDb = '/app/campus-assist.db';

// Check if source database exists
if (!fs.existsSync(sourceDb)) {
  console.log('❌ Source database not found:', sourceDb);
  console.log('🔍 Current directory:', process.cwd());
  console.log('📁 Available files:', fs.readdirSync('.'));
  process.exit(1);
}

// Copy database to Railway app directory
try {
  // Create /app directory if it doesn't exist
  if (!fs.existsSync('/app')) {
    console.log('📁 Creating /app directory...');
    fs.mkdirSync('/app', { recursive: true });
  }
  
  // Copy database
  fs.copyFileSync(sourceDb, railwayDb);
  console.log('✅ Database copied to Railway path:', railwayDb);
  
  // Verify copy
  const stats = fs.statSync(railwayDb);
  console.log('📊 Railway database size:', (stats.size / 1024).toFixed(1), 'KB');
  
  console.log('🎉 Railway database setup complete!');
  
} catch (error) {
  console.error('❌ Railway database setup failed:', error.message);
  console.log('🔄 Falling back to local database...');
  
  // If Railway setup fails, ensure local database is used
  console.log('📁 Using local database:', sourceDb);
}
