const mongoose = require('mongoose');

// Problem Schema
const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 10000
  },
  inputFormat: {
    type: String,
    required: true,
    maxlength: 2000
  },
  outputFormat: {
    type: String,
    required: true,
    maxlength: 2000
  },
  constraints: {
    type: String,
    maxlength: 2000
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  points: {
    type: Number,
    default: 100,
    min: 10,
    max: 1000
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Test Cases
  sampleTestCases: [{
    input: {
      type: String,
      required: true
    },
    output: {
      type: String,
      required: true
    },
    explanation: {
      type: String
    }
  }],
  
  hiddenTestCases: [{
    input: {
      type: String,
      required: true
    },
    output: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      default: 1
    }
  }],
  
  // Limits
  timeLimit: {
    type: Number,
    default: 1000, // milliseconds
    min: 100,
    max: 10000
  },
  memoryLimit: {
    type: Number,
    default: 256, // MB
    min: 16,
    max: 1024
  },
  
  // Statistics
  totalSubmissions: {
    type: Number,
    default: 0
  },
  acceptedSubmissions: {
    type: Number,
    default: 0
  },
  acceptanceRate: {
    type: Number,
    default: 0
  },
  
  // Author and Status
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Editorial
  editorial: {
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    publishedAt: Date
  },
  
  // AI Comments
  aiHints: [{
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    hint: String,
    order: Number
  }],
  
  // Companies that asked this problem
  companies: [{
    name: String,
    frequency: {
      type: Number,
      min: 1,
      max: 5
    }
  }]
}, {
  timestamps: true
});

// Indexes for better performance
ProblemSchema.index({ difficulty: 1, tags: 1 });
ProblemSchema.index({ acceptanceRate: -1 });
ProblemSchema.index({ createdAt: -1 });
ProblemSchema.index({ totalSubmissions: -1 });

// Calculate acceptance rate before saving
ProblemSchema.pre('save', function(next) {
  if (this.totalSubmissions > 0) {
    this.acceptanceRate = (this.acceptedSubmissions / this.totalSubmissions) * 100;
  }
  next();
});

module.exports = mongoose.model('Problem', ProblemSchema);