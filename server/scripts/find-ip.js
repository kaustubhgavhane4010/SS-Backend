import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 Finding IP address for IONOS database...');

async function findIP() {
  try {
    // Try to resolve the hostname
    const { stdout } = await execAsync(`nslookup db5018543224.hosting-data.io`);
    console.log('📋 DNS Lookup Result:');
    console.log(stdout);
    
    // Extract IP address
    const ipMatch = stdout.match(/Address:\s*(\d+\.\d+\.\d+\.\d+)/);
    if (ipMatch) {
      console.log('\n✅ Found IP Address:', ipMatch[1]);
      console.log('💡 Try using this IP instead of the hostname');
    } else {
      console.log('\n❌ Could not extract IP address');
    }
    
  } catch (error) {
    console.error('❌ DNS lookup failed:', error.message);
    
    // Alternative: try ping
    try {
      console.log('\n🔄 Trying ping...');
      const { stdout } = await execAsync(`ping -n 1 db5018543224.hosting-data.io`);
      console.log('📋 Ping Result:');
      console.log(stdout);
    } catch (pingError) {
      console.error('❌ Ping also failed:', pingError.message);
    }
  }
}

findIP();
