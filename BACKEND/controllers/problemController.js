const Problem = require('../models/Problem');
const Submission = require('../models/Submission');

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
exports.getProblems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const difficulty = req.query.difficulty;
    const tags = req.query.tags;

    // Build filter
    let filter = { isPublished: true };
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    const problems = await Problem.find(filter)
      .select('title slug difficulty tags points statistics timeLimit memoryLimit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProblems = await Problem.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: problems,
      pagination: {
        page,
        pages: Math.ceil(totalProblems / limit),
        total: totalProblems
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
exports.getProblem = async (req, res) => {
  try {
    const problem = await Problem.findOne({
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ],
      isPublished: true
    })
    .populate('author', 'username firstName lastName')
    .select('-testCases'); // Hide hidden test cases

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // If user is authenticated, check if they've solved this problem
    let userSubmission = null;
    if (req.user) {
      userSubmission = await Submission.findOne({
        user: req.user.id,
        problem: problem._id,
        status: 'Accepted'
      }).select('status createdAt');
    }

    res.status(200).json({
      success: true,
      data: {
        problem,
        userSubmission
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create problem
// @route   POST /api/problems
// @access  Private/Admin
exports.createProblem = async (req, res) => {
  try {
    const problem = await Problem.create({
      ...req.body,
      author: req.user.id
    });

    res.status(201).json({
      success: true,
      data: problem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
exports.updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Delete related submissions
    await Submission.deleteMany({ problem: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Search problems
// @route   GET /api/problems/search
// @access  Public
exports.searchProblems = async (req, res) => {
  try {
    const { q, difficulty, tags } = req.query;
    
    let filter = { isPublished: true };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    const problems = await Problem.find(filter)
      .select('title slug difficulty tags points statistics')
      .limit(50);

    res.status(200).json({
      success: true,
      data: problems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};