const { executeInDocker } = require('../services/dockerExecute');

async function runCode(req, res) {
  try {
    const { code, language, input = '' } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code and language'
      });
    }

    // Supported languages
    const supportedLanguages = ['python', 'cpp', 'java', 'javascript'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language. Supported: ${supportedLanguages.join(', ')}`
      });
    }

    // Execute code in Docker
    const result = await executeInDocker(code, language, input);
    
    res.json({
      success: result.success,
      output: result.output || '',
      error: result.error || null,
      execution_time: result.executionTime || 0
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

module.exports = { runCode };
