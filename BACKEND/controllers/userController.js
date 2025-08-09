const User = require('../models/User');
const Submission = require('../models/Submission');

// @desc    Get all users (for leaderboard)
// @route   GET /api/users
// @access  Public
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ role: 'user' })
      .select('username firstName lastName stats avatar country institution')
      .sort({ 'stats.rating': -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({ role: 'user' });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        pages: Math.ceil(totalUsers / limit),
        total: totalUsers
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'country', 'institution', 'socialLinks', 'preferences'];
    const updates = {};

    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/me/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('stats');
    
    // Get additional stats from submissions
    const submissions = await Submission.find({ user: req.user.id });
    const recentSubmissions = await Submission.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('problem', 'title difficulty');

    const languageStats = {};
    submissions.forEach(submission => {
      languageStats[submission.language] = (languageStats[submission.language] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: {
        basicStats: user.stats,
        languageStats,
        recentSubmissions: recentSubmissions.length,
        totalSubmissions: submissions.length
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

// @desc    Get user submissions
// @route   GET /api/users/me/submissions
// @access  Private
exports.getUserSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ user: req.user.id })
      .populate('problem', 'title difficulty points')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalSubmissions = await Submission.countDocuments({ user: req.user.id });

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
