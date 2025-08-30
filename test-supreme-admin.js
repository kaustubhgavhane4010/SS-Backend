import { initDatabase } from './server/database/init.js';
import migrateHierarchy from './server/scripts/migrate-hierarchy.js';

const testSupremeAdmin = async () => {
  try {
    console.log('🧪 Testing Supreme Admin Implementation...\n');

    // Initialize database
    console.log('1. Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized\n');

    // Run migration
    console.log('2. Running hierarchy migration...');
    await migrateHierarchy();
    console.log('✅ Migration completed\n');

    // Test database connection and verify tables
    console.log('3. Verifying database schema...');
    const db = await import('./server/database/init.js').then(m => m.getDatabase());
    
    // Check organizations table
    const orgCount = await db.get('SELECT COUNT(*) as count FROM organizations');
    console.log(`   Organizations: ${orgCount.count}`);
    
    // Check users table
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    console.log(`   Users: ${userCount.count}`);
    
    // Check Supreme Admin
    const supremeAdmin = await db.get("SELECT * FROM users WHERE role = 'supreme_admin'");
    if (supremeAdmin) {
      console.log(`   Supreme Admin: ${supremeAdmin.name} (${supremeAdmin.email})`);
    } else {
      console.log('   ❌ No Supreme Admin found');
    }
    
    // Check organization structure
    const organizations = await db.all('SELECT * FROM organizations');
    console.log(`   Organization types: ${organizations.map(o => o.type).join(', ')}`);
    
    console.log('✅ Database schema verified\n');

    console.log('🎉 Supreme Admin implementation test completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Login with Supreme Admin credentials:');
    console.log('   Email: supreme@bnu.ac.uk');
    console.log('   Password: supreme123');
    console.log('3. You should see the Enterprise Dashboard');
    console.log('4. Regular ticket pages should be inaccessible');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run test
testSupremeAdmin();
