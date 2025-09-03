# Admin Role Implementation

## Overview

The Admin role has been successfully implemented as the second tier in the organizational hierarchy, sitting below Supreme Admin. This role provides organizational management capabilities with restricted scope and permissions.

## Hierarchy Structure

```
Supreme Admin (Level 0)
    ↓
Admin (Level 1) ← NEW IMPLEMENTATION
    ↓
University Admin (Level 2)
    ↓
Senior Leadership (Level 3)
    ↓
Dean (Level 4)
    ↓
Manager (Level 5)
    ↓
Team Member (Level 6)
```

## Admin Role Capabilities

### ✅ What Admin CAN do:

1. **Create Organizations**
   - Create companies, universities, government agencies, and non-profits
   - Manage organization details (name, type, status)
   - Delete organizations (only if no users exist)

2. **Create Users with Restricted Roles**
   - University Admin
   - Senior Leadership
   - Dean
   - Manager
   - Team Member

3. **Manage Their Own Scope**
   - View only organizations they created
   - View only users within their organizations
   - Edit and delete users in their scope
   - Access organizational statistics for their scope

4. **Dashboard Access**
   - Admin-specific dashboard with scoped data
   - Overview statistics for their organizations
   - User management interface
   - Organization management interface

### ❌ What Admin CANNOT do:

1. **Create Restricted Roles**
   - Cannot create Supreme Admin users
   - Cannot create other Admin users

2. **Access Global Data**
   - Cannot see organizations created by other Admins
   - Cannot see users from other Admin's organizations
   - Cannot access enterprise-wide statistics

3. **System-Level Operations**
   - Cannot access Supreme Admin features
   - Cannot modify system settings
   - Cannot access ticket system (same as Supreme Admin)

## Technical Implementation

### Frontend Components

#### AdminDashboard.tsx
- **Location**: `src/pages/AdminDashboard.tsx`
- **Features**:
  - Role-restricted user creation form
  - Organization management interface
  - Scoped data display
  - Admin-specific navigation

#### Key Features:
- **Role Selection**: Dropdown only shows allowed roles
- **Organization Scoping**: Only shows organizations created by the Admin
- **Data Filtering**: All statistics and user lists are scoped to Admin's organizations
- **Visual Indicators**: Clear indication of Admin level access

### Backend API Endpoints

#### Admin-Specific Routes
All admin endpoints are prefixed with `/api/organizational/admin-*`:

1. **Statistics**
   - `GET /admin-stats` - Get scoped statistics
   - Returns data only for Admin's organizations

2. **Organizations**
   - `GET /admin-organizations` - List Admin's organizations
   - `POST /admin-organizations` - Create new organization
   - `DELETE /admin-organizations/:id` - Delete organization

3. **Users**
   - `GET /admin-users` - List users in Admin's organizations
   - `POST /admin-users` - Create user with role restrictions
   - `DELETE /admin-users/:id` - Delete user

#### Security Features:
- **Role Validation**: Server-side validation prevents creation of restricted roles
- **Organization Scoping**: All queries filtered by `created_by` field
- **Access Control**: Middleware ensures only Admin users can access endpoints

### Database Schema

#### Organizations Table
```sql
CREATE TABLE organizations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('company', 'university', 'government', 'non-profit'),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Users Table (Enhanced)
```sql
-- Existing fields plus:
organization_id VARCHAR(36),
department VARCHAR(100),
phone VARCHAR(20),
created_by VARCHAR(36),
FOREIGN KEY (organization_id) REFERENCES organizations(id),
FOREIGN KEY (created_by) REFERENCES users(id)
```

### Authentication & Authorization

#### Middleware Updates
- **requireAdmin**: Updated to allow both 'admin' and 'supreme_admin' roles
- **Role Validation**: Server-side validation for user creation
- **Scope Enforcement**: All queries filtered by organizational scope

#### Route Protection
```javascript
// Admin-specific routes
router.get('/admin-stats', [authenticateToken, requireAdmin], ...)
router.post('/admin-users', [authenticateToken, requireAdmin], ...)
```

## Usage Examples

### Creating an Admin User (Supreme Admin only)
```javascript
// Only Supreme Admin can create Admin users
POST /api/organizational/users
{
  "name": "John Admin",
  "email": "admin@company.com",
  "password": "secure123",
  "role": "admin",
  "organization_id": "org-uuid"
}
```

### Admin Creating a University Admin
```javascript
// Admin can create University Admin for university organizations
POST /api/organizational/admin-users
{
  "name": "Jane University Admin",
  "email": "university.admin@university.edu",
  "password": "secure123",
  "role": "university_admin",
  "organization_id": "university-org-uuid"
}
```

### Admin Creating an Organization
```javascript
// Admin creates their own organization
POST /api/organizational/admin-organizations
{
  "name": "Tech University",
  "type": "university",
  "status": "active"
}
```

## Testing

### Test Script
Run the test script to verify Admin functionality:
```bash
node test-admin-functionality.js
```

### Test Coverage
- ✅ Admin user creation
- ✅ Organization creation and management
- ✅ User creation with role restrictions
- ✅ Data scoping and access control
- ✅ Role validation and security

## Security Considerations

1. **Role Hierarchy Enforcement**
   - Server-side validation prevents privilege escalation
   - Admin cannot create users with equal or higher privileges

2. **Data Isolation**
   - Each Admin only sees their own organizational data
   - Database queries filtered by `created_by` field

3. **API Security**
   - All endpoints require authentication
   - Role-based access control on all operations
   - Input validation and sanitization

## Future Enhancements

1. **Audit Logging**
   - Track all Admin actions
   - Log user creation and organization management

2. **Advanced Permissions**
   - Granular permissions within Admin scope
   - Department-level access control

3. **Reporting**
   - Admin-specific analytics
   - Performance metrics for their organizations

## Migration Notes

### Existing Data
- Existing users with 'admin' role will automatically have Admin dashboard access
- No data migration required for existing users

### New Features
- Admin Dashboard is automatically available for users with 'admin' role
- New API endpoints are backward compatible
- Existing Supreme Admin functionality unchanged

## Support

For issues or questions regarding the Admin role implementation:
1. Check the test script output
2. Verify database schema matches requirements
3. Ensure proper role assignment in user records
4. Check API endpoint accessibility and permissions
