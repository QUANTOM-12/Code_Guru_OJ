const { executeInDocker } = require('../services/dockerExecutor');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc    Execute code
// @route   POST /api/compiler/run
// @access  Public (for testing), Private (for submissions)
exports.runCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;

    // Validate required fields
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code and language'
      });
    }

    // Validate language
    const supportedLanguages = ['cpp', 'java', 'python', 'javascript'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}. Supported languages: ${supportedLanguages.join(', ')}`
      });
    }

    // Execute code
    const result = await executeInDocker(code, language, input || '');

    res.status(200).json({
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime
    });

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during code execution',
      details: error.message
    });
  }
};

// @desc    Submit solution for a problem
// @route   POST /api/compiler/submit
// @access  Private
exports.submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: problemId, code, and language'
      });
    }

    // Get problem details
    const problem = await Problem.findById(problemId);
    if (!problem || !problem.isPublished) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found or not published'
      });
    }

    // Check if language is supported for this problem
    if (!problem.supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Language ${language} is not supported for this problem`
      });
    }

    // Create submission record
    const submission = await Submission.create({
      user: userId,
      problem: problemId,
      code,
      language,
      status: 'Pending',
      totalTestCases: problem.testCases.length
    });

    // Process submission asynchronously
    processSubmission(submission._id, problem, code, language);

    res.status(201).json({
      success: true,
      message: 'Solution submitted successfully',
      submissionId: submission.submissionId,
      data: {
        submissionId: submission._id,
        status: submission.status,
        problem: problem.title,
        language: submission.language,
        submittedAt: submission.createdAt
      }
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during submission',
      details: error.message
    });
  }
};

// @desc    Get submission status
// @route   GET /api/compiler/submission/:id
// @access  Private
exports.getSubmissionStatus = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'title difficulty points')
      .populate('user', 'username firstName lastName');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check if user owns this submission or is admin
    if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this submission'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

// Process submission against test cases
async function processSubmission(submissionId, problem, code, language) {
  try {
    const submission = await Submission.findById(submissionId);
    if (!submission) return;

    // Update status to running
    submission.status = 'Running';
    await submission.save();

    let passedTestCases = 0;
    const testCaseResults = [];
    let totalExecutionTime = 0;
    let maxMemoryUsed = 0;

    // Run against all test cases
    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      
      try {
        const result = await executeInDocker(code, language, testCase.input);
        
        totalExecutionTime += result.executionTime || 0;
        maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed || 0);

        const testCaseResult = {
          testCaseId: testCase._id,
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsed,
          output: result.output,
          error: result.error
        };

        if (result.success && result.output.trim() === testCase.expectedOutput.trim()) {
          testCaseResult.status = 'Passed';
          passedTestCases++;
        } else {
          testCaseResult.status = 'Failed';
          if (!result.success) {
            testCaseResult.status = 'Error';
          }
        }

        testCaseResults.push(testCaseResult);

        // Check for time limit exceeded
        if (result.executionTime > (testCase.timeLimit || problem.timeLimit)) {
          submission.status = 'Time Limit Exceeded';
          break;
        }

        // Check for memory limit exceeded
        if (result.memoryUsed > (testCase.memoryLimit || problem.memoryLimit) * 1024) {
          submission.status = 'Memory Limit Exceeded';
          break;
        }

      } catch (error) {
        testCaseResults.push({
          testCaseId: testCase._id,
          status: 'Error',
          error: error.message,
          executionTime: 0,
          memoryUsed: 0,
          output: ''
        });
        break;
      }
    }

    // Determine final status
    if (submission.status === 'Running') {
      if (passedTestCases === problem.testCases.length) {
        submission.status = 'Accepted';
        submission.score = 100;
      } else {
        submission.status = 'Wrong Answer';
        submission.score = Math.floor((passedTestCases / problem.testCases.length) * 100);
      }
    }

    // Update submission
    submission.passedTestCases = passedTestCases;
    submission.testCaseResults = testCaseResults;
    submission.executionTime = totalExecutionTime;
    submission.memoryUsed = maxMemoryUsed;
    
    await submission.save();

    // Update problem statistics
    problem.statistics.totalSubmissions += 1;
    if (submission.status === 'Accepted') {
      problem.statistics.acceptedSubmissions += 1;
    }
    await problem.save();

    // Update user statistics
    const user = await User.findById(submission.user);
    user.stats.totalSubmissions += 1;
    if (submission.status === 'Accepted') {
      user.stats.acceptedSubmissions += 1;
      
      // Check if this is the first accepted submission for this problem
      const previousAcceptedSubmission = await Submission.findOne({
        user: submission.user,
        problem: submission.problem,
        status: 'Accepted',
        _id: { $ne: submission._id }
      });
      
      if (!previousAcceptedSubmission) {
        user.stats.problemsSolved += 1;
      }
    }
    await user.save();

  } catch (error) {
    console.error('Error processing submission:', error);
    
    // Update submission with error status
    try {
      await Submission.findByIdAndUpdate(submissionId, {
        status: 'Internal Error',
        verdict: 'System error occurred during evaluation'
      });
    } catch (updateError) {
      console.error('Error updating submission status:', updateError);
    }
  }
}