const Submission = require('../models/Submission');

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private
exports.getSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = req.user.role === 'admin' ? {} : { user: req.user.id };

    const submissions = await Submission.find(filter)
      .populate('user', 'username firstName lastName')
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalSubmissions = await Submission.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        page,
        pages: Math.ceil(totalSubmissions / limit),
        total: totalSubmissions
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

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('user', 'username firstName lastName')
      .populate('problem', 'title slug difficulty');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Check if user owns this submission or is admin
    if (submission.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get submissions for a specific user
// @route   GET /api/submissions/user/:userId
// @access  Private
exports.getUserSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ user: req.params.userId })
      .populate('problem', 'title slug difficulty points')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalSubmissions = await Submission.countDocuments({ user: req.params.userId });

    res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        page,
        pages: Math.ceil(totalSubmissions / limit),
        total: totalSubmissions
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

// @desc    Get recent submissions
// @route   GET /api/submissions/recent
// @access  Private
exports.getRecentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('user', 'username')
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private/Admin
exports.deleteSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByIdAndDelete(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
