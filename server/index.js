import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import ticketRoutes from './routes/tickets.js';
import userRoutes from './routes/users.js';
import organizationalRoutes from './routes/organizational.js';
import adminRoutes from './routes/admin.js';

// Import database
import { initDatabase } from './database/mysql-init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Railway deployment trigger

// Trust Railway's proxy for rate limiting - configure specifically for Railway
app.set('trust proxy', 1); // Trust only the first proxy (Railway's load balancer)
console.log('🔧 COMPREHENSIVE ENVIRONMENT DEBUG - Railway Proxy Fix:');
console.log('  PORT:', process.env.PORT || '5000 (default)');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('  RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || 'Not set');

// Check all possible MySQL environment variable patterns
const mysqlVars = Object.keys(process.env).filter(key => 
  key.includes('MYSQL') || 
  key.includes('DATABASE') || 
  key.includes('DB_')
);

console.log('  All MySQL-related env vars:', mysqlVars);
mysqlVars.forEach(key => {
  console.log(`    ${key}:`, process.env[key] ? 'SET' : 'NOT SET');
});

// Check all Railway environment variables
const railwayVars = Object.keys(process.env).filter(key => key.startsWith('RAILWAY'));
console.log('  All Railway env vars:', railwayVars);
railwayVars.forEach(key => {
  console.log(`    ${key}:`, process.env[key] ? 'SET' : 'NOT SET');
});

// Check for any database-related variables
const dbVars = Object.keys(process.env).filter(key => 
  key.toLowerCase().includes('host') ||
  key.toLowerCase().includes('port') ||
  key.toLowerCase().includes('user') ||
  key.toLowerCase().includes('password')
);
console.log('  All host/port/user/password vars:', dbVars);
dbVars.forEach(key => {
  console.log(`    ${key}:`, process.env[key] ? 'SET' : 'NOT SET');
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://studentsupport.kginnovate.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  trustProxy: 1, // Trust only the first proxy (Railway's load balancer)
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizational', organizationalRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint for Railway (simple, no database dependency)
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested at:', new Date().toISOString());
  console.log('🏥 Health check from IP:', req.ip || req.connection.remoteAddress);
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Server is running',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'BNU Student Support Ticketing System API is running'
  });
});

// Serve built frontend files
app.use(express.static(path.join(__dirname, '../dist')));

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && req.path !== '/health') {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API route not found' 
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Start server first - this is critical for Railway health checks
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🏥 API Health check: http://localhost:${PORT}/api/health`);
      console.log('✅ Server is ready to accept requests');
    });
    
    // Initialize database in background - don't block server startup
    setTimeout(async () => {
      try {
        await initDatabase();
        console.log('✅ Database initialized successfully');
      } catch (dbError) {
        console.error('⚠️ Database initialization failed, but server is running:', dbError.message);
        console.log('🔧 Health check will still work, but database features may not function');
        console.log('🔧 Server will continue running and database can be retried later');
      }
    }, 1000); // Wait 1 second before trying database connection
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
