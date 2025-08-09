const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
exports.getContests = async (req, res) => {
  try {
    const now = new Date();
    const status = req.query.status;

    let filter = {};
    if (status === 'upcoming') {
      filter.startTime = { $gt: now };
    } else if (status === 'ongoing') {
      filter.startTime = { $lte: now };
      filter.endTime = { $gt: now };
    } else if (status === 'past') {
      filter.endTime = { $lte: now };
    }

    const contests = await Contest.find(filter)
      .populate('createdBy', 'username')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      data: contests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get contest by ID
// @route   GET /api/contests/:id
// @access  Public
exports.getContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('problems', 'title slug difficulty points')
      .populate('createdBy', 'username firstName lastName');

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create contest
// @route   POST /api/contests
// @access  Private/Admin
exports.createContest = async (req, res) => {
  try {
    const contest = await Contest.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: contest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private/Admin
exports.updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
exports.deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contest deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Join contest
// @route   POST /api/contests/:id/join
// @access  Private
exports.joinContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Check if contest has started
    if (new Date() > contest.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Contest has already ended'
      });
    }

    // Check if user already joined
    if (contest.participants.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already joined this contest'
      });
    }

    contest.participants.push(req.user.id);
    await contest.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined contest'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Public
exports.getContestLeaderboard = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        message: 'Contest not found'
      });
    }

    // Get submissions for this contest
    const submissions = await Submission.find({
      contest: req.params.id,
      status: 'Accepted'
    })
    .populate('user', 'username firstName lastName')
    .populate('problem', 'points');

    // Calculate leaderboard
    const leaderboard = {};
    submissions.forEach(submission => {
      const userId = submission.user._id.toString();
      if (!leaderboard[userId]) {
        leaderboard[userId] = {
          user: submission.user,
          score: 0,
          problems: new Set()
        };
      }
      
      if (!leaderboard[userId].problems.has(submission.problem._id.toString())) {
        leaderboard[userId].score += submission.problem.points;
        leaderboard[userId].problems.add(submission.problem._id.toString());
      }
    });

    // Convert to array and sort
    const leaderboardArray = Object.values(leaderboard)
      .map(entry => ({
        user: entry.user,
        score: entry.score,
        problemsSolved: entry.problems.size
      }))
      .sort((a, b) => b.score - a.score);

    res.status(200).json({
      success: true,
      data: leaderboardArray
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
