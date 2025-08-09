// Add this import at the top
const aiService = require('../services/aiService');

// Update your processSubmission function to include AI feedback
async function processSubmission(submissionId, problem, code, language) {
  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) return;

    // ... existing submission processing logic ...

    // 🤖 NEW: Generate AI explanation after processing
    if (submission.status !== 'Pending' && submission.status !== 'Running') {
      try {
        const aiExplanation = await aiService.generateCodeExplanation(
          code, 
          language, 
          submission.status
        );
        
        if (aiExplanation) {
          submission.aiExplanation = aiExplanation;
        }
      } catch (error) {
        console.error('AI explanation generation failed:', error.message);
        // Don't fail the submission if AI fails
      }
    }

    await submission.save();

  } catch (error) {
    console.error('Error processing submission:', error);
    // ... existing error handling
  }
}

// 🤖 NEW: Add AI hint endpoint
exports.getHint = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { code } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    const hint = await aiService.generateHint(problem.description, code);
    
    res.status(200).json({
      success: true,
      hint: hint || 'AI hint generation is currently unavailable'
    });

  } catch (error) {
    console.error('Hint generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate hint'
    });
  }
};

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
