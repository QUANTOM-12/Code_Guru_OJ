const { executeInDocker } = require('../services/dockerExecutor');

async function runCode(req, res) {
  try {
    console.log('Received request:', req.body);
    
    const { code, language, input = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code and language'
      });
    }

    const supportedLanguages = ['python', 'cpp', 'javascript'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language. Supported: ${supportedLanguages.join(', ')}`
      });
    }

    // For now, let's return a simple response to test
    res.json({
      success: true,
      output: `Hello from Code Guru! Language: ${language}`,
      error: null,
      execution_time: 100
    });
    
  } catch (error) {
    console.error('Compiler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

// THIS IS CRUCIAL - Make sure you export the function
module.exports = { runCode };
