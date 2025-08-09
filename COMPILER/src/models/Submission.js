// Add to your existing SubmissionSchema
aiExplanation: {
  type: String,
  default: null
},
aiHints: [{
  hint: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}]