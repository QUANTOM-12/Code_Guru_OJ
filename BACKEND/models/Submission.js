const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.ObjectId,
    ref: 'Problem',
    required: true
  },
  contest: {
    type: mongoose.Schema.ObjectId,
    ref: 'Contest',
    default: null
  },
  language: {
    type: String,
    enum: ['cpp', 'java', 'python', 'javascript'],
    required: [true, 'Please specify programming language']
  },
  code: {
    type: String,
    required: [true, 'Please provide the code']
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Running',
      'Accepted',
      'Wrong Answer',
      'Time Limit Exceeded',
      'Memory Limit Exceeded',
      'Runtime Error',
      'Compilation Error',
      'Internal Error'
    ],
    default: 'Pending'
  },
  verdict: {
    type: String,
    default: ''
  },
  executionTime: {
    type: Number,
    default: 0 // milliseconds
  },
  memoryUsed: {
    type: Number,
    default: 0 // KB
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  testCaseResults: [{
    testCaseId: mongoose.Schema.ObjectId,
    status: {
      type: String,
      enum: ['Passed', 'Failed', 'Error']
    },
    executionTime: Number,
    memoryUsed: Number,
    output: String,
    error: String
  }],
  totalTestCases: {
    type: Number,
    default: 0
  },
  passedTestCases: {
    type: Number,
    default: 0
  },
  submissionId: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate unique submission ID
SubmissionSchema.pre('save', function(next) {
  if (!this.submissionId) {
    this.submissionId = 'SUB_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  next();
});

module.exports = mongoose.model('Submission', SubmissionSchema);
