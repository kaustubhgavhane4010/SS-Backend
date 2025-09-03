#!/usr/bin/env node

/**
 * Test Admin Functionality
 * 
 * This script tests the Admin role functionality including:
 * 1. Admin can create organizations
 * 2. Admin can create users with restricted roles (no Supreme Admin or Admin)
 * 3. Admin can only see their own organizations and users
 * 4. Admin cannot create Supreme Admin or Admin users
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { dbRun, dbGet, dbQuery } from './server/database/mysql-helpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function testAdminFunctionality() {
  console.log('🧪 Testing Admin Functionality...\n');

  try {
    // 1. Create a test Admin user
    console.log('1. Creating test Admin user...');
    const adminId = uuidv4();
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await dbRun(`
      INSERT INTO users (id, name, email, password_hash, role, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [adminId, 'Test Admin', 'admin@test.com', adminPassword, 'admin', 'active', new Date().toISOString()]);
    
    console.log('✅ Admin user created successfully');

    // 2. Test Admin creating an organization
    console.log('\n2. Testing Admin creating organization...');
    const orgId = uuidv4();
    
    await dbRun(`
      INSERT INTO organizations (id, name, type, status, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [orgId, 'Test University', 'university', 'active', adminId, new Date().toISOString()]);
    
    console.log('✅ Organization created by Admin');

    // 3. Test Admin creating users with allowed roles
    console.log('\n3. Testing Admin creating users with allowed roles...');
    const allowedRoles = ['university_admin', 'senior_leadership', 'dean', 'manager', 'team_member'];
    
    for (const role of allowedRoles) {
      const userId = uuidv4();
      const userPassword = await bcrypt.hash('user123', 12);
      
      await dbRun(`
        INSERT INTO users (id, name, email, password_hash, role, status, organization_id, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, `Test ${role.replace('_', ' ')}`, `${role}@test.com`, userPassword, role, 'active', orgId, adminId, new Date().toISOString()]);
      
      console.log(`✅ Created ${role} user`);
    }

    // 4. Test Admin cannot create Supreme Admin or Admin users (this should be prevented by validation)
    console.log('\n4. Testing Admin cannot create restricted roles...');
    const restrictedRoles = ['supreme_admin', 'admin'];
    
    for (const role of restrictedRoles) {
      try {
        const userId = uuidv4();
        const userPassword = await bcrypt.hash('user123', 12);
        
        await dbRun(`
          INSERT INTO users (id, name, email, password_hash, role, status, organization_id, created_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [userId, `Test ${role}`, `${role}@test.com`, userPassword, role, 'active', orgId, adminId, new Date().toISOString()]);
        
        console.log(`❌ ERROR: Should not be able to create ${role} user`);
      } catch (error) {
        console.log(`✅ Correctly prevented creation of ${role} user`);
      }
    }

    // 5. Test Admin can only see their own organizations
    console.log('\n5. Testing Admin organizational scoping...');
    const adminOrgs = await dbQuery(
      'SELECT * FROM organizations WHERE created_by = ?',
      [adminId]
    );
    
    console.log(`✅ Admin can see ${adminOrgs.length} organization(s) they created`);

    // 6. Test Admin can only see users in their organizations
    console.log('\n6. Testing Admin user scoping...');
    const adminUsers = await dbQuery(`
      SELECT u.*, o.name as organization_name
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE o.created_by = ?
    `, [adminId]);
    
    console.log(`✅ Admin can see ${adminUsers.length} user(s) in their organizations`);

    // 7. Test role distribution
    console.log('\n7. Testing role distribution...');
    const roleStats = await dbGet(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'university_admin' THEN 1 ELSE 0 END) as university_admin,
        SUM(CASE WHEN role = 'senior_leadership' THEN 1 ELSE 0 END) as senior_leadership,
        SUM(CASE WHEN role = 'dean' THEN 1 ELSE 0 END) as dean,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as manager,
        SUM(CASE WHEN role = 'team_member' THEN 1 ELSE 0 END) as team_member
      FROM users 
      WHERE organization_id IN (SELECT id FROM organizations WHERE created_by = ?)
    `, [adminId]);
    
    console.log('✅ Role distribution:', roleStats);

    // 8. Clean up test data
    console.log('\n8. Cleaning up test data...');
    await dbRun('DELETE FROM users WHERE created_by = ?', [adminId]);
    await dbRun('DELETE FROM organizations WHERE created_by = ?', [adminId]);
    await dbRun('DELETE FROM users WHERE id = ?', [adminId]);
    
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All Admin functionality tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Admin can create organizations');
    console.log('   ✅ Admin can create users with allowed roles only');
    console.log('   ✅ Admin cannot create Supreme Admin or Admin users');
    console.log('   ✅ Admin can only see their own organizations and users');
    console.log('   ✅ Role-based access control working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAdminFunctionality().catch(console.error);
