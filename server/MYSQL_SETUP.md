# MySQL Database Setup Guide

## Environment Variables Required

Create a `.env` file in the `server` directory with the following variables:

```env
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=campus_assist

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Railway MySQL Configuration

When deploying to Railway, the MySQL service will automatically provide these environment variables:

- `MYSQL_HOST` - Railway MySQL host
- `MYSQL_PORT` - Railway MySQL port (usually 3306)
- `MYSQL_USER` - Railway MySQL username
- `MYSQL_PASSWORD` - Railway MySQL password
- `MYSQL_DATABASE` - Railway MySQL database name

## Getting Railway MySQL Connection Details

1. Go to your Railway project dashboard
2. Click on the MySQL service
3. Click the "Connect" button
4. Copy the connection details:
   - Host
   - Port
   - Username
   - Password
   - Database name

## Local Development Setup

1. Install MySQL locally or use Docker:
   ```bash
   docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0
   ```

2. Create the database:
   ```sql
   CREATE DATABASE campus_assist;
   ```

3. Update your `.env` file with local MySQL credentials

## Testing the Connection

The application will automatically test the MySQL connection on startup. If successful, you'll see:
```
✅ MySQL connection test successful
🎉 MySQL database initialized successfully!
```

## Default Admin User

After initialization, you can login with:
- Email: `supreme@bnu.ac.uk`
- Password: `supreme123`

**Important**: Change this password after first login!
