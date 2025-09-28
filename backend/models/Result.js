const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  pointsEarned: {
    type: Number,
    required: true,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
});

const ResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  test: {
    type: mongoose.Schema.ObjectId,
    ref: 'Test',
    required: true
  },
  answers: [AnswerSchema],
  score: {
    type: Number,
    required: true,
    default: 0
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'submitted', 'auto-submitted'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  flaggedForReview: {
    type: Boolean,
    default: false
  },
  reviewNotes: {
    type: String,
    trim: true
  },
  graded: {
    type: Boolean,
    default: false
  },
  gradedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  }
});

// Calculate percentage before saving
ResultSchema.pre('save', function(next) {
  if (this.totalPoints > 0) {
    this.percentage = Math.round((this.score / this.totalPoints) * 100);
  }
  next();
});

// Add compound index to prevent duplicate submissions
ResultSchema.index({ student: 1, test: 1, attemptNumber: 1 }, { unique: true });

// Add indexes for better performance
ResultSchema.index({ student: 1 });
ResultSchema.index({ test: 1 });
ResultSchema.index({ status: 1 });
ResultSchema.index({ submittedAt: 1 });

module.exports = mongoose.model('Result', ResultSchema);
