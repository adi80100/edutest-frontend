const { validationResult } = require('express-validator');
const Test = require('../models/Test');
const Result = require('../models/Result');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all tests
// @route   GET /api/tests
// @access  Private
exports.getTests = async (req, res, next) => {
  try {
    let query;
    
    if (req.user.role === 'admin') {
      // Admin can see all tests they created
      query = Test.find({ createdBy: req.user.id });
    } else {
      // Students can only see published tests
      query = Test.find({ isPublished: true });
    }

    const tests = await query
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get published tests for students
// @route   GET /api/tests/published
// @access  Private (Student)
exports.getPublishedTests = async (req, res, next) => {
  try {
    const currentDate = new Date();
    
    // Ensure both schedule and expiry windows are respected
    const tests = await Test.find({
      isPublished: true,
      $and: [
        { $or: [
            { scheduledAt: { $lte: currentDate } },
            { scheduledAt: null }
          ]
        },
        { $or: [
            { expiresAt: { $gte: currentDate } },
            { expiresAt: null }
          ]
        }
      ]
    })
    .populate('createdBy', 'name')
    .select('-questions.correctAnswer -questions.explanation')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single test
// @route   GET /api/tests/:id
// @access  Private
exports.getTest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    let test = await Test.findById(req.params.id).populate('createdBy', 'name email');

    if (!test) {
      return next(new ErrorResponse('Test not found', 404));
    }

    // Check authorization
    if (req.user.role === 'student' && !test.isPublished) {
      return next(new ErrorResponse('Test not found', 404));
    }

    if (req.user.role === 'admin' && test.createdBy._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this test', 403));
    }

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get test for student (without correct answers)
// @route   GET /api/tests/:id/student
// @access  Private (Student)
exports.getTestForStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const test = await Test.findById(req.params.id)
      .populate('createdBy', 'name')
      .select('-questions.correctAnswer -questions.explanation');

    if (!test) {
      return next(new ErrorResponse('Test not found', 404));
    }

    if (!test.isPublished) {
      return next(new ErrorResponse('Test is not available', 403));
    }

    // Check if test is scheduled
    const now = new Date();
    if (test.scheduledAt && test.scheduledAt > now) {
      return next(new ErrorResponse('Test is not yet available', 403));
    }

    if (test.expiresAt && test.expiresAt < now) {
      return next(new ErrorResponse('Test has expired', 403));
    }

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new test
// @route   POST /api/tests
// @access  Private (Admin)
exports.createTest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    // Add user to req.body
    req.body.createdBy = req.user.id;

    const test = await Test.create(req.body);

    res.status(201).json({
      success: true,
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Private (Admin)
exports.updateTest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    let test = await Test.findById(req.params.id);

    if (!test) {
      return next(new ErrorResponse('Test not found', 404));
    }

    // Make sure user is test owner
    if (test.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this test', 403));
    }

    test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete test
// @route   DELETE /api/tests/:id
// @access  Private (Admin)
exports.deleteTest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const test = await Test.findById(req.params.id);

    if (!test) {
      return next(new ErrorResponse('Test not found', 404));
    }

    // Make sure user is test owner
    if (test.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this test', 403));
    }

    // Delete associated results
    await Result.deleteMany({ test: req.params.id });

    await test.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish test
// @route   PUT /api/tests/:id/publish
// @access  Private (Admin)
exports.publishTest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    let test = await Test.findById(req.params.id);

    if (!test) {
      return next(new ErrorResponse('Test not found', 404));
    }

    // Make sure user is test owner
    if (test.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to publish this test', 403));
    }

    test.isPublished = true;
    await test.save();

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unpublish test
// @route   PUT /api/tests/:id/unpublish
// @access  Private (Admin)
exports.unpublishTest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    let test = await Test.findById(req.params.id);

    if (!test) {
      return next(new ErrorResponse('Test not found', 404));
    }

    // Make sure user is test owner
    if (test.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to unpublish this test', 403));
    }

    test.isPublished = false;
    await test.save();

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start test attempt
// @route   POST /api/tests/:id/start
// @access  Private (Student)
exports.startTest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const test = await Test.findById(req.params.id);

    if (!test) {
      return next(new ErrorResponse('Test not found', 404));
    }

    if (!test.isPublished) {
      return next(new ErrorResponse('Test is not available', 403));
    }

    const now = new Date();
    if (test.scheduledAt && test.scheduledAt > now) {
      return next(new ErrorResponse('Test is not yet available', 403));
    }

    if (test.expiresAt && test.expiresAt < now) {
      return next(new ErrorResponse('Test has expired', 403));
    }

    // ✅ 1️⃣ CHECK IN-PROGRESS FIRST (IMPORTANT)
    const inProgressAttempt = await Result.findOne({
      student: req.user.id,
      test: req.params.id,
      status: 'in-progress'
    });

    if (inProgressAttempt) {
      return res.status(200).json({
        success: true,
        data: inProgressAttempt
      });
    }

    // ✅ 2️⃣ COUNT ONLY SUBMITTED ATTEMPTS
    const completedAttempts = await Result.countDocuments({
      student: req.user.id,
      test: req.params.id,
      status: 'submitted'
    });

    if (completedAttempts >= test.allowedAttempts) {
      return next(new ErrorResponse('Maximum attempts reached', 403));
    }

    // ✅ 3️⃣ CREATE NEW ATTEMPT
    const result = await Result.create({
      student: req.user.id,
      test: req.params.id,
      totalPoints: test.totalPoints,
      attemptNumber: completedAttempts + 1,
      status: 'in-progress',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Submit test
// @route   POST /api/tests/:id/submit
// @access  Private (Student)
exports.submitTest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const { answers } = req.body;

    const test = await Test.findById(req.params.id);
    const result = await Result.findOne({
      student: req.user.id,
      test: req.params.id,
      status: 'in-progress'
    });

    if (!test || !result) {
      return next(new ErrorResponse('Test or result not found', 404));
    }

    // Grade the test
    let score = 0;
    const gradedAnswers = [];

    for (const answer of answers) {
      const question = test.questions.id(answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let pointsEarned = 0;

      // Auto-grade based on question type
      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        isCorrect = String(answer.answer) === String(question.correctAnswer);
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.type === 'short-answer') {
        // Simple string matching - in production, you might want more sophisticated matching
        isCorrect = answer.answer.toLowerCase().trim() === 
                   question.correctAnswer.toLowerCase().trim();
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.type === 'essay') {
        // Essays need manual grading
        isCorrect = false;
        pointsEarned = 0;
      }

      score += pointsEarned;

      gradedAnswers.push({
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        pointsEarned,
        timeSpent: answer.timeSpent || 0
      });
    }

    // Update result
    result.answers = gradedAnswers;
    result.score = score;
    result.status = 'submitted';
    result.submittedAt = new Date();
    result.timeSpent = Math.round((result.submittedAt - result.startedAt) / 60000); // Convert to minutes
    
    // Auto-grade if no essays
    const hasEssays = test.questions.some(q => q.type === 'essay');
    result.graded = !hasEssays;
    if (result.graded) {
      result.gradedAt = new Date();
    }

    await result.save();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save single answer (auto-save)
// @route   POST /api/tests/:id/save-answer
// @access  Private (Student)
exports.saveAnswer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const { questionId, answer } = req.body;

    const result = await Result.findOne({
      student: req.user.id,
      test: req.params.id,
      status: 'in-progress'
    });

    if (!result) {
      return next(new ErrorResponse('No active test session found', 404));
    }

    // Update or add answer
    const existingAnswerIndex = result.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (existingAnswerIndex >= 0) {
      result.answers[existingAnswerIndex].answer = answer;
    } else {
      result.answers.push({
        questionId,
        answer,
        isCorrect: false,
        pointsEarned: 0
      });
    }

    await result.save();

    res.status(200).json({
      success: true,
      message: 'Answer saved successfully'
    });
  } catch (error) {
    next(error);
  }
};
