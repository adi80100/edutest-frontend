const { validationResult } = require('express-validator');
const Result = require('../models/Result');
const Test = require('../models/Test');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get my results (for students)
// @route   GET /api/results/my
// @access  Private (Student)
exports.getMyResults = async (req, res, next) => {
  try {
    const results = await Result.find({ 
      student: req.user.id,
      status: { $in: ['submitted', 'completed', 'auto-submitted'] }
    })
    .populate('test', 'title subject totalPoints duration')
    .sort('-submittedAt');

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all results
// @route   GET /api/results
// @access  Private (Admin)
exports.getResults = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    let query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Result.countDocuments(query);
    const results = await Result.find(query)
      .populate('student', 'name email studentId')
      .populate('test', 'title subject totalPoints')
      .sort('-submittedAt')
      .limit(limit)
      .skip(startIndex);

    // Pagination result
    const pagination = {};

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      pagination,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single result
// @route   GET /api/results/:id
// @access  Private
exports.getResult = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const result = await Result.findById(req.params.id)
      .populate('student', 'name email studentId')
      .populate('test', 'title subject questions totalPoints duration');

    if (!result) {
      return next(new ErrorResponse('Result not found', 404));
    }

    // Check authorization
    if (req.user.role === 'student' && result.student._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view this result', 403));
    }

    if (req.user.role === 'admin') {
      // Admin can only see results for tests they created
      const test = await Test.findById(result.test._id);
      if (test.createdBy.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to view this result', 403));
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results for specific test
// @route   GET /api/results/test/:testId
// @access  Private (Admin)
exports.getTestResults = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const test = await Test.findById(req.params.testId);
    
    if (!test) {
      return next(new ErrorResponse('Test not found', 404));
    }

    // Check if user is the test creator
    if (test.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view these results', 403));
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Result.countDocuments({ test: req.params.testId });
    const results = await Result.find({ test: req.params.testId })
      .populate('student', 'name email studentId')
      .sort('-submittedAt')
      .limit(limit)
      .skip(startIndex);

    // Pagination result
    const pagination = {};

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      pagination,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results for specific student
// @route   GET /api/results/student/:studentId
// @access  Private (Admin)
exports.getStudentResults = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const student = await User.findById(req.params.studentId);
    
    if (!student) {
      return next(new ErrorResponse('Student not found', 404));
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Result.countDocuments({ student: req.params.studentId });
    const results = await Result.find({ student: req.params.studentId })
      .populate('test', 'title subject totalPoints duration createdBy')
      .sort('-submittedAt')
      .limit(limit)
      .skip(startIndex);

    // Filter results to only include tests created by the current admin
    const filteredResults = results.filter(result => 
      result.test.createdBy.toString() === req.user.id
    );

    res.status(200).json({
      success: true,
      count: filteredResults.length,
      total,
      data: filteredResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update result (manual grading)
// @route   PUT /api/results/:id
// @access  Private (Admin)
exports.updateResult = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    let result = await Result.findById(req.params.id).populate('test');

    if (!result) {
      return next(new ErrorResponse('Result not found', 404));
    }

    // Check if user is the test creator
    if (result.test.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this result', 403));
    }

    const fieldsToUpdate = {};
    
    if (req.body.score !== undefined) {
      fieldsToUpdate.score = req.body.score;
    }
    
    if (req.body.reviewNotes !== undefined) {
      fieldsToUpdate.reviewNotes = req.body.reviewNotes;
    }
    
    if (req.body.flaggedForReview !== undefined) {
      fieldsToUpdate.flaggedForReview = req.body.flaggedForReview;
    }

    // Mark as graded
    fieldsToUpdate.graded = true;
    fieldsToUpdate.gradedBy = req.user.id;
    fieldsToUpdate.gradedAt = new Date();

    result = await Result.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).populate('student', 'name email studentId');

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Private (Admin)
exports.deleteResult = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const result = await Result.findById(req.params.id).populate('test');

    if (!result) {
      return next(new ErrorResponse('Result not found', 404));
    }

    // Check if user is the test creator
    if (result.test.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this result', 403));
    }

    await result.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics dashboard data
// @route   GET /api/results/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res, next) => {
  try {
    // Get tests created by this admin
    const tests = await Test.find({ createdBy: req.user.id });
    const testIds = tests.map(test => test._id);

    // Get all results for admin's tests
    const results = await Result.find({ 
      test: { $in: testIds },
      status: { $in: ['submitted', 'completed', 'auto-submitted'] }
    });

    // Calculate statistics
    const totalTests = tests.length;
    const totalSubmissions = results.length;
    const averageScore = results.length > 0 
      ? Math.round(results.reduce((acc, result) => acc + result.percentage, 0) / results.length)
      : 0;

    // Recent submissions (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentSubmissions = results.filter(result => 
      result.submittedAt > weekAgo
    ).length;

    // Grade distribution
    const gradeDistribution = {
      'A (90-100%)': results.filter(r => r.percentage >= 90).length,
      'B (80-89%)': results.filter(r => r.percentage >= 80 && r.percentage < 90).length,
      'C (70-79%)': results.filter(r => r.percentage >= 70 && r.percentage < 80).length,
      'D (60-69%)': results.filter(r => r.percentage >= 60 && r.percentage < 70).length,
      'F (0-59%)': results.filter(r => r.percentage < 60).length
    };

    // Test performance
    const testPerformance = tests.map(test => {
      const testResults = results.filter(r => r.test.toString() === test._id.toString());
      return {
        testId: test._id,
        title: test.title,
        submissions: testResults.length,
        averageScore: testResults.length > 0 
          ? Math.round(testResults.reduce((acc, r) => acc + r.percentage, 0) / testResults.length)
          : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalTests,
          totalSubmissions,
          averageScore,
          recentSubmissions
        },
        gradeDistribution,
        testPerformance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics for specific test
// @route   GET /api/results/test/:testId/analytics
// @access  Private (Admin)
exports.getTestAnalytics = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const test = await Test.findById(req.params.testId);
    
    if (!test) {
      return next(new ErrorResponse('Test not found', 404));
    }

    if (test.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to view these analytics', 403));
    }

    const results = await Result.find({ 
      test: req.params.testId,
      status: { $in: ['submitted', 'completed', 'auto-submitted'] }
    });

    // Question-wise analysis
    const questionAnalysis = test.questions.map(question => {
      const questionAnswers = results.map(result => 
        result.answers.find(a => a.questionId.toString() === question._id.toString())
      ).filter(Boolean);

      const correctAnswers = questionAnswers.filter(a => a.isCorrect).length;
      const totalAnswers = questionAnswers.length;
      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      return {
        questionId: question._id,
        question: question.question,
        type: question.type,
        totalAnswers,
        correctAnswers,
        accuracy: `${accuracy}%`,
        averageTimeSpent: totalAnswers > 0 
          ? Math.round(questionAnswers.reduce((acc, a) => acc + (a.timeSpent || 0), 0) / totalAnswers)
          : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        testInfo: {
          title: test.title,
          totalQuestions: test.questions.length,
          totalSubmissions: results.length,
          averageScore: results.length > 0 
            ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
            : 0
        },
        questionAnalysis
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export test results to CSV
// @route   GET /api/results/export/:testId
// @access  Private (Admin)
exports.exportResults = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const test = await Test.findById(req.params.testId);
    
    if (!test) {
      return next(new ErrorResponse('Test not found', 404));
    }

    if (test.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to export these results', 403));
    }

    const results = await Result.find({ test: req.params.testId })
      .populate('student', 'name email studentId')
      .sort('-submittedAt');

    // Create CSV content
    let csvContent = 'Student Name,Email,Student ID,Score,Percentage,Time Spent (min),Submitted At,Status\n';
    
    results.forEach(result => {
      csvContent += `"${result.student.name}","${result.student.email}","${result.student.studentId || ''}",${result.score},${result.percentage}%,${result.timeSpent},"${result.submittedAt}","${result.status}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${test.title}_results.csv"`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};
