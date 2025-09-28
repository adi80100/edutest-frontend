const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question'],
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
    required: [true, 'Please specify question type']
  },
  options: {
    type: [String],
    validate: {
      validator: function(v) {
        if (this.type === 'multiple-choice') {
          return v && v.length >= 2;
        }
        if (this.type === 'true-false') {
          return v && v.length === 2;
        }
        return true;
      },
      message: 'Multiple choice questions must have at least 2 options, true/false must have exactly 2 options'
    }
  },
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: function() {
      return this.type !== 'essay';
    }
  },
  points: {
    type: Number,
    required: [true, 'Please specify points for this question'],
    min: [1, 'Points must be at least 1']
  },
  explanation: {
    type: String,
    trim: true
  }
});

const TestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a test title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a test description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Please specify test duration in minutes'],
    min: [1, 'Duration must be at least 1 minute']
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  questions: [QuestionSchema],
  instructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instructions cannot be more than 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  scheduledAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  allowedAttempts: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 attempt must be allowed']
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  showResults: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total points before saving
TestSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better performance
TestSchema.index({ createdBy: 1 });
TestSchema.index({ subject: 1 });
TestSchema.index({ isPublished: 1 });
TestSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('Test', TestSchema);
