# 🎓 BNU Student Support Ticketing System

A comprehensive web application for managing student support tickets at Buckinghamshire New University. Built with React, Node.js, and SQLite.

## ✨ Features

### 🔐 Authentication & User Management
- **Role-based access control** (Admin/Staff)
- **Secure JWT authentication**
- **Admin-only user creation**
- **Session management with expiration**

### 📊 Dashboard
- **Real-time statistics** (open tickets, assigned tickets, high priority)
- **Recent activity feed**
- **Quick action buttons**
- **Performance metrics**

### 🎫 Ticket Management
- **Comprehensive ticket creation** with student information
- **Priority levels** (Low, Medium, High, Urgent)
- **Status tracking** (Open, In Progress, Pending, Closed)
- **Category classification** (Academic, IT Support, Finance, Accommodation, Other)
- **File attachments** support
- **Advanced filtering and search**

### 👥 Team Collaboration
- **Ticket assignment** to team members
- **Notes and communication** system
- **Internal and student-facing notes**
- **Activity timeline**

### 🎨 Design & Branding
- **Buckinghamshire New University** brand colors
- **Modern, responsive design**
- **Professional UI/UX**
- **Mobile-friendly interface**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bnu-student-support-ticketing
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Default Admin Account
The system creates a default admin account on first run:
- **Email**: admin@bnu.ac.uk
- **Password**: admin123

⚠️ **Important**: Change the default password after first login!

## 📁 Project Structure

```
bnu-student-support-ticketing/
├── src/                    # Frontend React source
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── types/             # TypeScript type definitions
├── server/                # Backend Node.js server
│   ├── database/          # Database initialization
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── uploads/           # File uploads directory
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database (SQLite is used by default)
DATABASE_URL=./database/ticketing.db
```

### Database

The application uses SQLite by default, which is perfect for development and small to medium deployments. The database file is automatically created at `server/database/ticketing.db`.

## 🎯 Usage Guide

### For Administrators

1. **User Management**
   - Create new staff accounts
   - Manage user roles and permissions
   - Activate/deactivate user accounts
   - View user activity and statistics

2. **System Overview**
   - Access all tickets and analytics
   - Monitor team performance
   - Generate reports

### For Staff Members

1. **Ticket Management**
   - Create new support tickets
   - Update ticket status and priority
   - Add notes and communications
   - Upload attachments

2. **Dashboard**
   - View assigned tickets
   - Monitor high-priority items
   - Track resolution times

## 🔒 Security Features

- **JWT-based authentication** with session management
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **SQL injection protection** with parameterized queries
- **XSS prevention** with Content Security Policy
- **File upload security** with type and size validation
- **Rate limiting** to prevent abuse
- **Role-based access control**

## 🎨 Customization

### Branding Colors

The application uses Buckinghamshire New University brand colors defined in `tailwind.config.js`:

```javascript
colors: {
  'bnu': {
    primary: '#003366',    // Deep navy blue
    secondary: '#0066CC',  // Bright blue
    accent: '#FFB81C',     // University gold
    'light-grey': '#F8F9FA',
    'dark-grey': '#6C757D',
  }
}
```

### Adding New Features

1. **New Ticket Categories**: Update the `TicketCategory` type in `src/types/index.ts`
2. **New User Roles**: Modify the `User` interface and update middleware
3. **Custom Fields**: Extend the database schema and update forms

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/users` - Create user (admin only)
- `GET /api/auth/users` - Get all users (admin only)

### Ticket Endpoints

- `GET /api/tickets` - Get tickets with filtering
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `GET /api/tickets/stats` - Get dashboard statistics

### Notes Endpoints

- `GET /api/tickets/:id/notes` - Get ticket notes
- `POST /api/tickets/:id/notes` - Add note to ticket

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   FRONTEND_URL=https://your-domain.com
   ```

3. **Start the production server**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Stay updated with the latest features and security patches by regularly pulling from the main branch.

---

**Built with ❤️ for Buckinghamshire New University**
