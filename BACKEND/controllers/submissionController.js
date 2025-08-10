const compilerService = require('../services/compilerService');
const Problem = require('../models/Problem'); 

// Submit solution
exports.submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user.id;

    // Validation
    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: problemId, code, language'
      });
    }

    console.log(`📝 New submission: User ${userId}, Problem ${problemId}, Language ${language}`);

    // Get problem and test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    const testCases = problem.testCases;

    let verdict = 'Accepted';
    let passedTestCases = 0;
    let executionDetails = [];
    let aiExplanation = null;

    console.log(`🧪 Running ${testCases.length} test cases...`);

    // Run code against all test cases
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`⚡ Running test case ${i + 1}/${testCases.length}`);
      
      const result = await compilerService.executeCode(code, language, testCase.input);
      
      executionDetails.push({
        testCase: i + 1,
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: result.output,
        success: result.success,
        executionTime: result.executionTime,
        error: result.error
      });

      if (!result.success) {
        verdict = result.error || 'Runtime Error';
        console.log(`❌ Test case ${i + 1} failed: ${verdict}`);
        break;
      }

      if (result.output.trim() !== testCase.output.trim()) {
        verdict = 'Wrong Answer';
        console.log(`❌ Test case ${i + 1}: Wrong Answer`);
        break;
      }

      passedTestCases++;
      console.log(`✅ Test case ${i + 1} passed`);
    }

    // Get AI explanation
    if (executionDetails.length > 0 && executionDetails[0].aiExplanation) {
      aiExplanation = executionDetails.aiExplanation;
    }

    // Save submission (assuming you have a Submission model)
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      verdict,
      passedTestCases,
      totalTestCases: testCases.length,
      executionDetails: executionDetails.slice(0, 3), // Only store first 3 for space
      aiExplanation,
      submittedAt: new Date()
    });

    await submission.save();
    console.log(`💾 Submission saved: ${verdict}`);

    res.json({
      success: true,
      submission: {
        id: submission._id,
        verdict,
        passedTestCases,
        totalTestCases: testCases.length,
        aiExplanation,
        submittedAt: submission.submittedAt,
        executionDetails: executionDetails.length <= 3 ? executionDetails : executionDetails.slice(0, 3)
      }
    });

  } catch (error) {
    console.error('❌ Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get AI hint
exports.getHint = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    
    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    console.log(`💡 Generating AI hint for problem ${problemId}`);
    const hintResponse = await compilerService.getAIHint(
      code, 
      language, 
      problem.statement
    );

    res.json(hintResponse);
  } catch (error) {
    console.error('❌ Hint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hint'
    });
  }
};

const Submission = require('../models/Submission');

// GET /api/submissions
exports.getSubmissions = async (req, res) => {
  const subs = await Submission.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: subs });
};

// GET /api/submissions/:id
exports.getSubmissionById = async (req, res) => {
  const sub = await Submission.findById(req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: sub });
};

// GET /api/submissions/user/:userId
exports.getUserSubmissions = async (req, res) => {
  const subs = await Submission.find({ user: req.params.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: subs });
};

// GET /api/submissions/recent
exports.getRecentSubmissions = async (req, res) => {
  const subs = await Submission.find().sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, data: subs });
};

// DELETE /api/submissions/:id
exports.deleteSubmission = async (req, res) => {
  await Submission.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
};
