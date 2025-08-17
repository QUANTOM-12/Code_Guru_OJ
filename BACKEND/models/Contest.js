const mongoose = require('mongoose');

// Contest Schema
const ContestSchema = new mongoose.Schema({
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
    maxlength: 5000
  },
  
  // Contest Timing
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  
  // Contest Configuration
  type: {
    type: String,
    enum: ['Public', 'Private', 'Educational', 'Rated', 'Unrated'],
    default: 'Public'
  },
  format: {
    type: String,
    enum: ['ICPC', 'IOI', 'AtCoder', 'CodeChef', 'Custom'],
    default: 'ICPC'
  },
  
  // Problems in Contest
  problems: [{
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true
    },
    points: {
      type: Number,
      default: 100
    },
    order: {
      type: Number,
      required: true
    },
    alias: {
      type: String, // A, B, C, etc.
      required: true
    }
  }],
  
  // Organizer Details
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Participation Settings
  maxParticipants: {
    type: Number,
    default: null // unlimited if null
  },
  registrationStartTime: {
    type: Date,
    default: null
  },
  registrationEndTime: {
    type: Date,
    default: null
  },
  
  // Contest Rules
  rules: {
    type: String,
    maxlength: 2000
  },
  allowedLanguages: [{
    type: String,
    enum: ['cpp', 'c', 'java', 'python', 'python3', 'javascript', 'go', 'rust', 'kotlin']
  }],
  
  // Scoring Configuration
  penaltyPerWrongSubmission: {
    type: Number,
    default: 20 // minutes
  },
  freezeScoreboardTime: {
    type: Number, // minutes before end
    default: null
  },
  
  // Contest Status
  status: {
    type: String,
    enum: ['Draft', 'Upcoming', 'Running', 'Finished', 'Cancelled'],
    default: 'Draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isRated: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  totalParticipants: {
    type: Number,
    default: 0
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  
  // Announcements
  announcements: [{
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isImportant: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Clarifications
  clarifications: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      default: null
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    answeredAt: {
      type: Date,
      default: null
    }
  }]
}, {
  timestamps: true
});

// Contest Participation Schema
const ContestParticipationSchema = new mongoose.Schema({
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Participation Details
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  
  // Virtual Contest Support
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualStartTime: {
    type: Date,
    default: null
  },
  
  // Scoring
  totalScore: {
    type: Number,
    default: 0
  },
  penalty: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: null
  },
  
  // Problem-wise Performance
  problemResults: [{
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true
    },
    alias: String, // A, B, C, etc.
    attempts: {
      type: Number,
      default: 0
    },
    solved: {
      type: Boolean,
      default: false
    },
    solvedAt: {
      type: Date,
      default: null
    },
    score: {
      type: Number,
      default: 0
    },
    penalty: {
      type: Number,
      default: 0
    },
    firstSolvedSubmission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['Registered', 'Participating', 'Finished', 'Disqualified'],
    default: 'Registered'
  },
  
  // Rating Change (for rated contests)
  oldRating: {
    type: Number,
    default: null
  },
  newRating: {
    type: Number,
    default: null
  },
  ratingChange: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
ContestSchema.index({ startTime: 1, endTime: 1 });
ContestSchema.index({ status: 1, isPublic: 1 });
ContestSchema.index({ organizer: 1 });

ContestParticipationSchema.index({ contest: 1, user: 1 }, { unique: true });
ContestParticipationSchema.index({ contest: 1, totalScore: -1, penalty: 1 });
ContestParticipationSchema.index({ user: 1, createdAt: -1 });

// Virtual for contest duration in hours
ContestSchema.virtual('durationHours').get(function() {
  return Math.round(this.duration / 60 * 100) / 100;
});

// Method to check if contest is currently running
ContestSchema.methods.isRunning = function() {
  const now = new Date();
  return this.startTime <= now && now <= this.endTime && this.status === 'Running';
};

// Method to check if contest has ended
ContestSchema.methods.hasEnded = function() {
  return new Date() > this.endTime || this.status === 'Finished';
};

// Method to get time until contest starts (in minutes)
ContestSchema.methods.timeUntilStart = function() {
  if (this.hasStarted()) return 0;
  return Math.max(0, Math.floor((this.startTime - new Date()) / (1000 * 60)));
};

// Method to check if contest has started
ContestSchema.methods.hasStarted = function() {
  return new Date() >= this.startTime;
};

module.exports = {
  Contest: mongoose.model('Contest', ContestSchema),
  ContestParticipation: mongoose.model('ContestParticipation', ContestParticipationSchema)
};