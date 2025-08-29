# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### 3. Create Environment File
Create a file named `.env` in the `server` directory with the following content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=bnu-student-support-secret-key-2024

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database (SQLite is used by default)
DATABASE_URL=./database/ticketing.db
```

### 4. Start the Backend Server
```bash
cd server
npm run dev
```

### 5. Start the Frontend Development Server
In a new terminal:
```bash
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login Credentials
- **Email**: admin@bnu.ac.uk
- **Password**: admin123

⚠️ **Important**: Change the default password after first login!

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
1. Change the PORT in the `.env` file
2. Update the proxy in `vite.config.ts` to match the new port

### Database Issues
The SQLite database will be created automatically on first run. If you encounter issues:
1. Delete the `server/database/ticketing.db` file
2. Restart the server

### CORS Issues
If you see CORS errors:
1. Ensure the `FRONTEND_URL` in `.env` matches your frontend URL
2. Check that both servers are running

## Next Steps
1. Log in with the default admin account
2. Create additional staff accounts
3. Start creating and managing tickets
4. Customize the system for your needs

For detailed documentation, see the main README.md file.
