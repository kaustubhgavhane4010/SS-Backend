import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment process...\n');

// Step 1: Clean previous build
console.log('1. Cleaning previous build...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('   ✅ Previous build cleaned');
}

// Step 2: Install dependencies
console.log('\n2. Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('   ✅ Dependencies installed');
} catch (error) {
  console.error('   ❌ Failed to install dependencies');
  process.exit(1);
}

// Step 3: Build for production
console.log('\n3. Building for production...');
try {
  execSync('npm run build:prod', { stdio: 'inherit' });
  console.log('   ✅ Production build completed');
} catch (error) {
  console.error('   ❌ Build failed');
  process.exit(1);
}

// Step 4: Verify build
console.log('\n4. Verifying build...');
if (fs.existsSync('dist')) {
  const files = fs.readdirSync('dist');
  console.log(`   ✅ Build directory created with ${files.length} files`);
  
  // Check if index.html exists
  if (fs.existsSync('dist/index.html')) {
    const indexContent = fs.readFileSync('dist/index.html', 'utf8');
    if (indexContent.includes('ss-backend-production.up.railway.app')) {
      console.log('   ✅ Railway backend URL found in build');
    } else {
      console.log('   ⚠️  Warning: Railway backend URL not found in build');
    }
  }
} else {
  console.error('   ❌ Build directory not found');
  process.exit(1);
}

console.log('\n🎉 Deployment build completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Upload the contents of the "dist" folder to your IONOS hosting');
console.log('2. Ensure your domain (studentsupport.kginnovate.com) points to the uploaded files');
console.log('3. Test the application to verify it connects to the Railway backend');
console.log('\n🔗 Backend URL: https://ss-backend-production.up.railway.app');
console.log('🌐 Frontend URL: https://studentsupport.kginnovate.com');
