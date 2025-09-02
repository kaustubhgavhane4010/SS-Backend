import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use('/api/', limiter);

// SIMPLE HEALTH CHECK - This will definitely work
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'SIMPLE SERVER IS RUNNING - NO DATABASE REQUIRED'
  });
});

// SIMPLE API endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Simple API is working',
    timestamp: new Date().toISOString()
  });
});

// Serve static files
app.use(express.static('dist'));

// Catch all route
app.get('*', (req, res) => {
  res.sendFile('dist/index.html', { root: '.' });
});

// Start server - NO DATABASE, NO COMPLEX LOGIC
app.listen(PORT, () => {
  console.log(`🚀 SIMPLE SERVER RUNNING ON PORT ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ API test: http://localhost:${PORT}/api/test`);
  console.log(`🎯 This server will definitely work!`);
});

export default app;
