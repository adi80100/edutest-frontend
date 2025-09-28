const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getResults,
  getResult,
  getMyResults,
  getTestResults,
  getStudentResults,
  updateResult,
  deleteResult,
  getAnalytics,
  getTestAnalytics,
  exportResults
} = require('../controllers/results');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/results/my
// @desc    Get current user's results
// @access  Private (Student)
router.get('/my', authorize('student'), getMyResults);

// @route   GET /api/results/analytics
// @desc    Get analytics dashboard data
// @access  Private (Admin)
router.get('/analytics', authorize('admin'), getAnalytics);

// @route   GET /api/results/test/:testId/analytics
// @desc    Get analytics for specific test
// @access  Private (Admin)
router.get('/test/:testId/analytics', authorize('admin'), [
  param('testId').isMongoId().withMessage('Invalid test ID')
], getTestAnalytics);

// @route   GET /api/results/test/:testId
// @desc    Get all results for a specific test
// @access  Private (Admin)
router.get('/test/:testId', authorize('admin'), [
  param('testId').isMongoId().withMessage('Invalid test ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], getTestResults);

// @route   GET /api/results/student/:studentId
// @desc    Get all results for a specific student
// @access  Private (Admin)
router.get('/student/:studentId', authorize('admin'), [
  param('studentId').isMongoId().withMessage('Invalid student ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], getStudentResults);

// @route   GET /api/results/export/:testId
// @desc    Export test results to CSV
// @access  Private (Admin)
router.get('/export/:testId', authorize('admin'), [
  param('testId').isMongoId().withMessage('Invalid test ID')
], exportResults);

// @route   GET /api/results
// @desc    Get all results (admin only)
// @access  Private (Admin)
router.get('/', authorize('admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['in-progress', 'completed', 'submitted', 'auto-submitted']).withMessage('Invalid status')
], getResults);

// @route   GET /api/results/:id
// @desc    Get single result
// @access  Private
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid result ID')
], getResult);

// @route   PUT /api/results/:id
// @desc    Update result (for manual grading)
// @access  Private (Admin)
router.put('/:id', authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid result ID'),
  body('score').optional().isNumeric().withMessage('Score must be a number'),
  body('reviewNotes').optional().isString().withMessage('Review notes must be a string'),
  body('flaggedForReview').optional().isBoolean().withMessage('flaggedForReview must be a boolean')
], updateResult);

// @route   DELETE /api/results/:id
// @desc    Delete result
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid result ID')
], deleteResult);

module.exports = router;
