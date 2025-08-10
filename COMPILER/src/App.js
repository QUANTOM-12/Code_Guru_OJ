const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compilerRoutes = require('./routes/compilerRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3005',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/compiler', compilerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Code Guru Compiler Service is running',
    timestamp: new Date().toISOString(),
    ai_enabled: !!process.env.GEMINI_API_KEY
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🔧 Code Guru Compiler running on port ${PORT}`);
  console.log(`🤖 AI Integration: ${process.env.GEMINI_API_KEY ? 'ENABLED' : 'DISABLED'}`);
});

module.exports = app;