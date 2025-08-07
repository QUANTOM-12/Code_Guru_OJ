const express = require('express');
const cors = require('cors');
const compilerRoutes = require('./routes/compilerRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/compiler', compilerRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Code Guru Compiler Service is running',
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`🔧 Code Guru Compiler running on port ${PORT}`);
});
