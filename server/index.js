import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initMySQLDatabase } from './database/mysql-init.js';
import ticketRoutes from './routes/tickets.js';
import organizationalRoutes from './routes/organizational.js';

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

// Routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/organizational', organizationalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initMySQLDatabase();
    console.log('MySQL database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 Connected to MySQL database: ${process.env.DB_HOST || 'db5018543224.hosting-data.io'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
