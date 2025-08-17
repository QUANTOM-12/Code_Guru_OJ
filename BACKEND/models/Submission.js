const mongoose = require('mongoose');

// Submission Schema
const SubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true
  },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    default: null
  },
  
  // Code Details
  code: {
    type: String,
    required: true,
    maxlength: 50000
  },
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'c', 'java', 'python', 'python3', 'javascript', 'go', 'rust', 'kotlin']
  },
  
  // Submission Status
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
      'Presentation Error',
      'Partially Accepted'
    ],
    default: 'Pending',
    index: true
  },
  
  // Execution Details
  executionTime: {
    type: Number, // in milliseconds
    default: 0
  },
  memoryUsed: {
    type: Number, // in MB
    default: 0
  },
  
  // Test Case Results
  testCaseResults: [{
    testCaseNumber: Number,
    status: {
      type: String,
      enum: ['Passed', 'Failed', 'TLE', 'MLE', 'RE', 'CE']
    },
    executionTime: Number,
    memoryUsed: Number,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    errorMessage: String
  }],
  
  // Compilation Details
  compilationError: {
    type: String,
    default: null
  },
  compilationOutput: {
    type: String,
    default: null
  },
  
  // Scoring
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  points: {
    type: Number,
    default: 0
  },
  
  // Judge Details
  judgeId: {
    type: String,
    default: null
  },
  judgedAt: {
    type: Date,
    default: null
  },
  
  // Additional Info
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  
  // Contest specific
  contestSubmissionTime: {
    type: Number, // minutes since contest start
    default: null
  },
  
  // Flags
  isPublic: {
    type: Boolean,
    default: true
  },
  isPlagiarized: {
    type: Boolean,
    default: false
  },
  plagiarismScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
SubmissionSchema.index({ user: 1, createdAt: -1 });
SubmissionSchema.index({ problem: 1, status: 1 });
SubmissionSchema.index({ contest: 1, user: 1 });
SubmissionSchema.index({ status: 1, createdAt: -1 });
SubmissionSchema.index({ language: 1, status: 1 });

// Virtual for getting runtime in seconds
SubmissionSchema.virtual('runtimeSeconds').get(function() {
  return this.executionTime / 1000;
});

// Method to check if submission is accepted
SubmissionSchema.methods.isAccepted = function() {
  return this.status === 'Accepted';
};

// Method to get submission verdict
SubmissionSchema.methods.getVerdict = function() {
  const verdictMap = {
    'Accepted': 'AC',
    'Wrong Answer': 'WA',
    'Time Limit Exceeded': 'TLE',
    'Memory Limit Exceeded': 'MLE',
    'Runtime Error': 'RE',
    'Compilation Error': 'CE',
    'Presentation Error': 'PE',
    'Partially Accepted': 'PA',
    'Pending': 'PD',
    'Running': 'RN'
  };
  return verdictMap[this.status] || 'UN';
};

// Pre-save middleware to update problem statistics
SubmissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Update problem submission count
    await mongoose.model('Problem').findByIdAndUpdate(
      this.problem,
      { $inc: { totalSubmissions: 1 } }
    );
    
    // If accepted, update accepted count
    if (this.status === 'Accepted') {
      await mongoose.model('Problem').findByIdAndUpdate(
        this.problem,
        { $inc: { acceptedSubmissions: 1 } }
      );
      
      // Update user statistics
      await mongoose.model('User').findByIdAndUpdate(
        this.user,
        { 
          $inc: { 
            'stats.totalSubmissions': 1,
            'stats.acceptedSubmissions': 1
          }
        }
      );
    } else {
      // Update user total submissions
      await mongoose.model('User').findByIdAndUpdate(
        this.user,
        { $inc: { 'stats.totalSubmissions': 1 } }
      );
    }
  }
  next();
});

module.exports = mongoose.model('Submission', SubmissionSchema);