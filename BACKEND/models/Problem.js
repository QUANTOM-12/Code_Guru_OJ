const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: true
  },
  timeLimit: {
    type: Number,
    default: 1000 // milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 256 // MB
  }
});

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a problem title'],
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please add a problem description']
  },
  inputFormat: {
    type: String,
    required: [true, 'Please add input format']
  },
  outputFormat: {
    type: String,
    required: [true, 'Please add output format']
  },
  constraints: {
    type: String,
    required: [true, 'Please add constraints']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: [true, 'Please add difficulty level']
  },
  tags: [{
    type: String,
    trim: true
  }],
  points: {
    type: Number,
    default: 100
  },
  timeLimit: {
    type: Number,
    default: 1000 // milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 256 // MB
  },
  supportedLanguages: [{
    type: String,
    enum: ['cpp', 'java', 'python', 'javascript']
  }],
  testCases: [TestCaseSchema],
  sampleTestCases: [TestCaseSchema],
  editorial: {
    type: String,
    default: ''
  },
  hints: [String],
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  statistics: {
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create problem slug from the title
ProblemSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Calculate acceptance rate
ProblemSchema.pre('save', function(next) {
  if (this.statistics.totalSubmissions > 0) {
    this.statistics.acceptanceRate = Math.round(
      (this.statistics.acceptedSubmissions / this.statistics.totalSubmissions) * 100
    );
  }
  next();
});

module.exports = mongoose.model('Problem', ProblemSchema);