import { getDatabase } from '../database/mysql-init.js';

const migrateHierarchy = async () => {
  try {
    const db = getDatabase();
    console.log('Starting hierarchy migration...');

    // Check if organizations table exists
    const tableExists = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='organizations'
    `);

    if (!tableExists) {
      console.log('Creating organizations table...');
      await db.exec(`
        CREATE TABLE organizations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('company', 'university', 'department')),
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          parent_organization_id TEXT,
          settings TEXT,
          FOREIGN KEY (created_by) REFERENCES users (id),
          FOREIGN KEY (parent_organization_id) REFERENCES organizations (id)
        )
      `);
    }

    // First, update role constraints - recreate the table with new constraints
    console.log('Updating role constraints...');
    try {
      // Get all user data
      const allUsers = await db.all('SELECT * FROM users');
      
      // Drop the old table
      await db.exec('DROP TABLE users');
      
      // Create new table with updated constraints
      await db.exec(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('supreme_admin', 'admin', 'university_admin', 'senior_leadership', 'dean', 'manager', 'team_member')),
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          organization_id TEXT,
          department TEXT,
          phone TEXT,
          avatar TEXT,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Reinsert all users
      for (const user of allUsers) {
        await db.run(`
          INSERT INTO users (
            id, name, email, password_hash, role, status, created_by, 
            created_at, updated_at, last_login, organization_id, department, phone, avatar
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          user.id, user.name, user.email, user.password_hash, user.role, user.status, user.created_by,
          user.created_at, user.updated_at, user.last_login, user.organization_id, user.department, user.phone, user.avatar
        ]);
      }

      // Recreate indexes
      await db.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
        CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users (organization_id);
        CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
      `);

    } catch (error) {
      console.log('Role constraint update failed, continuing...', error.message);
    }

    // Check if users table has new columns
    const userColumns = await db.all(`
      PRAGMA table_info(users)
    `);
    
    const hasOrganizationId = userColumns.some(col => col.name === 'organization_id');
    const hasDepartment = userColumns.some(col => col.name === 'department');
    const hasPhone = userColumns.some(col => col.name === 'phone');
    const hasAvatar = userColumns.some(col => col.name === 'avatar');

    if (!hasOrganizationId) {
      console.log('Adding organization_id column to users table...');
      await db.exec('ALTER TABLE users ADD COLUMN organization_id TEXT');
    }

    if (!hasDepartment) {
      console.log('Adding department column to users table...');
      await db.exec('ALTER TABLE users ADD COLUMN department TEXT');
    }

    if (!hasPhone) {
      console.log('Adding phone column to users table...');
      await db.exec('ALTER TABLE users ADD COLUMN phone TEXT');
    }

    if (!hasAvatar) {
      console.log('Adding avatar column to users table...');
      await db.exec('ALTER TABLE users ADD COLUMN avatar TEXT');
    }

    // Now update existing users to have supreme_admin role if they are admin
    const existingAdmins = await db.all(`
      SELECT id, role FROM users WHERE role = 'admin'
    `);

    if (existingAdmins.length > 0) {
      console.log('Updating existing admin users...');
      
      // Create default company organization
      const companyId = 'default-company-' + Date.now();
      await db.run(`
        INSERT INTO organizations (id, name, type, status, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [companyId, 'BNU Enterprise', 'company', 'active', existingAdmins[0].id]);

      // Update first admin to supreme_admin and assign to company
      await db.run(`
        UPDATE users 
        SET role = 'supreme_admin', organization_id = ?
        WHERE id = ?
      `, [companyId, existingAdmins[0].id]);

      // Update other admins to have organization_id
      for (let i = 1; i < existingAdmins.length; i++) {
        await db.run(`
          UPDATE users 
          SET organization_id = ?
          WHERE id = ?
        `, [companyId, existingAdmins[i].id]);
      }
    }

    console.log('Hierarchy migration completed successfully!');
    
    // Show final state
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    const orgCount = await db.get('SELECT COUNT(*) as count FROM organizations');
    const supremeAdminCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'supreme_admin'");
    
    console.log(`Migration Summary:`);
    console.log(`- Total users: ${userCount.count}`);
    console.log(`- Total organizations: ${orgCount.count}`);
    console.log(`- Supreme admins: ${supremeAdminCount.count}`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateHierarchy()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migrateHierarchy;
