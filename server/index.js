import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initMySQLDatabase, testConnection } from './database/mysql-init.js';
import { initFallbackDatabase } from './database/fallback-db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for Railway (simple, no database dependency)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

// Import routes after database initialization
let ticketRoutes, organizationalRoutes;

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting server with smart database selection...');
    
    // Skip MySQL entirely - go straight to SQLite fallback
    let databaseType = 'sqlite-fallback';
    
    try {
      console.log('🔄 Initializing SQLite fallback database...');
      await initFallbackDatabase();
      console.log('🎉 Using SQLite fallback database');
    } catch (sqliteError) {
      console.error('❌ SQLite fallback failed:', sqliteError.message);
      throw new Error('SQLite fallback failed');
    }
    
    // Import routes based on database type
    if (databaseType === 'mysql') {
      ticketRoutes = (await import('./routes/tickets.js')).default;
      organizationalRoutes = (await import('./routes/organizational.js')).default;
    } else {
      // Use simplified routes for fallback
      ticketRoutes = (await import('./routes/tickets-fallback.js')).default;
      organizationalRoutes = (await import('./routes/organizational-fallback.js')).default;
    }
    
    // Apply routes
    app.use('/api/tickets', ticketRoutes);
    app.use('/api/organizational', organizationalRoutes);
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        message: 'Server is running',
        database: databaseType
      });
    });
    
    // Serve static frontend files
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Serve built frontend files
    app.use(express.static(path.join(__dirname, '../dist')));
    
    // Handle React Router - serve index.html for all non-API routes
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
      }
    });
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️ Database: ${databaseType}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('🔍 Full error:', error);
    process.exit(1);
  }
};

startServer();
