import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Testing build process...\n');

// Set the environment variable
process.env.VITE_API_URL = 'https://campusassist.kginnovate.com/api';
console.log('Environment variable set:', process.env.VITE_API_URL);

// Run a simple build
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Build completed');
  
  // Check if the Railway URL is in the built files
  if (fs.existsSync('dist/assets/index-d8a56c49.js')) {
    const content = fs.readFileSync('dist/assets/index-d8a56c49.js', 'utf8');
    if (content.includes('ss-backend-production.up.railway.app')) {
      console.log('✅ Railway URL found in build');
    } else {
      console.log('❌ Railway URL NOT found in build');
      console.log('This means the environment variable is not being embedded properly');
    }
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
}
