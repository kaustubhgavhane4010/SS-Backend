#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

console.log('🔧 MySQL Setup Helper for Railway');
console.log('=====================================\n');

console.log('📋 To connect your application to Railway MySQL, you need to:');
console.log('\n1. Get your Railway MySQL connection details:');
console.log('   - Go to your Railway project dashboard');
console.log('   - Click on the MySQL service');
console.log('   - Click the "Connect" button');
console.log('   - Copy the connection details\n');

console.log('2. Create a .env file in the server directory with these variables:');
console.log(`
MYSQL_HOST=your_railway_mysql_host
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_railway_mysql_password
MYSQL_DATABASE=railway

JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
`);

console.log('3. For local development, you can use:');
console.log(`
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_local_mysql_password
MYSQL_DATABASE=campus_assist

JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
`);

console.log('\n4. Test the connection by running:');
console.log('   npm start');
console.log('\n✅ If successful, you should see:');
console.log('   ✅ MySQL connection test successful');
console.log('   🎉 MySQL database initialized successfully!');

console.log('\n🔑 Default admin credentials:');
console.log('   Email: supreme@bnu.ac.uk');
console.log('   Password: supreme123');
console.log('   ⚠️  Change this password after first login!');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  console.log('\n📄 .env file found!');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('MYSQL_HOST')) {
    console.log('✅ MySQL configuration detected in .env file');
  } else {
    console.log('⚠️  MySQL configuration not found in .env file');
    console.log('   Please add the MySQL environment variables as shown above');
  }
} else {
  console.log('\n⚠️  No .env file found!');
  console.log('   Please create a .env file with the MySQL configuration');
}
