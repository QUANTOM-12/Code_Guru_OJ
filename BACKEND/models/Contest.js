const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a contest title'],
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a contest description']
  },
  startTime: {
    type: Date,
    required: [true, 'Please add start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please add end time']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Please add contest duration']
  },
  problems: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Problem'
  }],
  participants: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    default: null
  },
  rules: {
    type: String,
    default: 'Standard competitive programming rules apply.'
  },
  prizes: [{
    position: Number,
    description: String
  }]
}, {
  timestamps: true
});

// Virtual for contest status
ContestSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.startTime) return 'upcoming';
  if (now <= this.endTime) return 'ongoing';
  return 'ended';
});

module.exports = mongoose.model('Contest', ContestSchema);
