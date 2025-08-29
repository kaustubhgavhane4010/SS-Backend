import { execSync } from 'child_process';
import fs from 'fs';

// Set the production API URL
process.env.VITE_API_URL = 'https://campusassist.kginnovate.com/api';

console.log('Building with API URL:', process.env.VITE_API_URL);

// Run the build command
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
