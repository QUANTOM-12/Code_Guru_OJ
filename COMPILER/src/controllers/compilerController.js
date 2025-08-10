const { executeInDocker } = require('../services/dockerExecutor');
const aiService = require('../services/aiServices');

// Simple code execution for testing/demos
async function runCode(req, res) {
  try {
    console.log('🚀 Received run request:', {
      language: req.body.language,
      codeLength: req.body.code?.length || 0
    });

    const { code, language, input = '' } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code and language'
      });
    }

    const supportedLanguages = ['python', 'cpp', 'java', 'javascript'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language. Supported: ${supportedLanguages.join(', ')}`
      });
    }

    // Execute code in Docker
    const result = await executeInDocker(code, language, input);

    // Generate AI explanation if available and execution completed
    let aiExplanation = null;
    if (aiService.isEnabled() && result.success !== undefined) {
      try {
        const verdict = result.success ? 'Accepted' : (result.error || 'Runtime Error');
        aiExplanation = await aiService.generateCodeExplanation(code, language, verdict);
      } catch (aiError) {
        console.error('AI explanation failed:', aiError.message);
      }
    }

    // Response
    res.json({
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      aiExplanation: aiExplanation,
      jobId: result.jobId
    });

  } catch (error) {
    console.error('❌ Compiler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Get AI hint for problem solving
async function getHint(req, res) {
  try {
    if (!aiService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not available'
      });
    }

    const { code, language, problemStatement } = req.body;

    if (!code || !language || !problemStatement) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code, language, problemStatement'
      });
    }

    const hint = await aiService.generateHint(problemStatement, code, language);

    res.json({
      success: true,
      hint: hint || 'AI hint generation is currently unavailable'
    });

  } catch (error) {
    console.error('❌ Hint generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate hint',
      details: error.message
    });
  }
}

// Debug code with AI assistance  
async function debugCode(req, res) {
  try {
    if (!aiService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not available'
      });
    }

    const { code, language, error: userError } = req.body;

    if (!code || !language || !userError) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code, language, error'
      });
    }

    const debugSuggestion = await aiService.debugCode(code, language, userError);

    res.json({
      success: true,
      debugSuggestion: debugSuggestion || 'AI debug service is currently unavailable'
    });

  } catch (error) {
    console.error('❌ Debug assistance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate debug assistance',
      details: error.message
    });
  }
}

// Code optimization suggestions
async function optimizeCode(req, res) {
  try {
    if (!aiService.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not available'
      });
    }

    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code, language'
      });
    }

    const optimization = await aiService.optimizeCode(code, language);

    res.json({
      success: true,
      optimization: optimization || 'AI optimization service is currently unavailable'
    });

  } catch (error) {
    console.error('❌ Optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate optimization suggestions',
      details: error.message
    });
  }
}

module.exports = {
  runCode,
  getHint,
  debugCode,
  optimizeCode
};