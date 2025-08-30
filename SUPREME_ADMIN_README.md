# Supreme Admin Implementation

## Overview

This document describes the implementation of the new 7-tier hierarchy system, starting with the **Supreme Admin** role. The Supreme Admin is the highest level user who manages enterprise-level operations and cannot access the ticket system.

## New Hierarchy System

The system now supports 7 distinct roles:

1. **Supreme Admin** (Product Owners) - Enterprise management only
2. **Admin** (Company/Product Owner side) - Company-level management
3. **University Admin** - University-level management
4. **Senior Leadership** - Strategic oversight
5. **Dean** - Academic leadership
6. **Manager** - Operational management
7. **Team Member** - Day-to-day operations

## Supreme Admin Features

### What Supreme Admin CAN do:
- Access Enterprise Dashboard
- Create and manage company-level organizations
- Create and manage admin users
- View enterprise-wide statistics
- Manage user roles and permissions
- Access system settings

### What Supreme Admin CANNOT do:
- Access ticket system
- View or manage individual tickets
- Access student support features
- Use regular dashboard

## Database Changes

### New Tables
- `organizations` - Stores company, university, and department information
- Enhanced `users` table with new fields

### New Fields in Users Table
- `organization_id` - Links user to an organization
- `department` - User's department
- `phone` - Contact information
- `avatar` - Profile picture

### Role Constraints
Updated role validation to support all 7 hierarchy levels.

## API Endpoints

### New Organizational Routes (`/api/organizational`)

#### Enterprise Statistics
- `GET /enterprise-stats` - Get enterprise dashboard statistics

#### Organizations
- `GET /organizations` - List all organizations
- `POST /organizations` - Create new organization

#### Users
- `GET /users` - List all users
- `POST /users` - Create new admin user
- `PUT /users/:id` - Update user information

## Frontend Changes

### New Components
- `EnterpriseDashboard.tsx` - Supreme Admin's main interface
- Updated routing to conditionally show Enterprise Dashboard

### Navigation Changes
- Supreme Admin sees different navigation menu
- Regular users cannot access Enterprise Dashboard
- Ticket-related navigation hidden for Supreme Admin

## Authentication & Authorization

### New Middleware
- `requireSupremeAdmin` - Restricts access to Supreme Admin only
- `requireTicketAccess` - Prevents Supreme Admin from accessing tickets

### Role-Based Access Control
- Supreme Admin: Enterprise Dashboard + Settings only
- Admin: Full system access (including tickets)
- Other roles: Ticket system access based on permissions

## Migration Process

### Running the Migration
```bash
cd server
node scripts/migrate-hierarchy.js
```

### What the Migration Does
1. Creates organizations table
2. Adds new columns to users table
3. Converts existing admin to Supreme Admin
4. Creates default company organization
5. Updates role constraints

## Default Credentials

After migration, the default Supreme Admin credentials are:
- **Email**: supreme@bnu.ac.uk
- **Password**: supreme123

**⚠️ IMPORTANT**: Change the password immediately after first login!

## Usage Examples

### Creating a Company Organization
```javascript
const newCompany = await organizationalAPI.createOrganization({
  name: "New Company Ltd",
  type: "company",
  settings: JSON.stringify({ theme: "dark" })
});
```

### Creating an Admin User
```javascript
const newAdmin = await organizationalAPI.createUser({
  name: "John Doe",
  email: "john@company.com",
  password: "securepassword123",
  role: "admin",
  organization_id: "company-uuid",
  department: "IT"
});
```

## Security Considerations

1. **Role Validation**: All role assignments are validated server-side
2. **Organization Isolation**: Users can only access resources within their organization
3. **Audit Trail**: All user and organization changes are logged
4. **Password Security**: Passwords are hashed using bcrypt with salt rounds 12

## Future Enhancements

### Phase 2: University Admin
- University-specific dashboards
- Academic program management
- Student enrollment systems

### Phase 3: Department Management
- Department-level user management
- Resource allocation
- Performance metrics

### Phase 4: Advanced Analytics
- Cross-organization reporting
- Predictive analytics
- Performance dashboards

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check database permissions
   - Ensure no active connections
   - Verify SQLite version compatibility

2. **Supreme Admin Cannot Login**
   - Verify migration completed successfully
   - Check user table for correct role
   - Verify organization_id is set

3. **API Endpoints Return 403**
   - Check user role in database
   - Verify JWT token contains correct role
   - Check middleware configuration

### Debug Commands

```bash
# Check database schema
sqlite3 server/database/ticketing.db ".schema users"
sqlite3 server/database/ticketing.db ".schema organizations"

# Check user roles
sqlite3 server/database/ticketing.db "SELECT id, name, email, role, organization_id FROM users;"

# Check organizations
sqlite3 server/database/ticketing.db "SELECT * FROM organizations;"
```

## Support

For technical support or questions about the Supreme Admin implementation:

1. Check the migration logs
2. Verify database schema
3. Review authentication middleware
4. Check browser console for frontend errors

## Version History

- **v1.0.0** - Initial Supreme Admin implementation
- **v1.0.1** - Added organization management
- **v1.0.2** - Enhanced user management features
- **v1.0.3** - Added enterprise statistics dashboard
