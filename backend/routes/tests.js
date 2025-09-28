const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  publishTest,
  unpublishTest,
  getPublishedTests,
  startTest,
  submitTest,
  saveAnswer,
  getTestForStudent
} = require('../controllers/tests');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tests
// @desc    Get all tests (admin) or published tests (student)
// @access  Private
router.get('/', protect, getTests);

// @route   GET /api/tests/published
// @desc    Get all published tests for students
// @access  Private (Student)
router.get('/published', protect, authorize('student'), getPublishedTests);

// @route   GET /api/tests/:id
// @desc    Get single test
// @access  Private
router.get('/:id', protect, [
  param('id').isMongoId().withMessage('Invalid test ID')
], getTest);

// @route   GET /api/tests/:id/student
// @desc    Get test for student (filtered questions without answers)
// @access  Private (Student)
router.get('/:id/student', protect, authorize('student'), [
  param('id').isMongoId().withMessage('Invalid test ID')
], getTestForStudent);

// @route   POST /api/tests
// @desc    Create new test
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.question').notEmpty().withMessage('Question text is required'),
  body('questions.*.type').isIn(['multiple-choice', 'true-false', 'short-answer', 'essay']).withMessage('Invalid question type'),
  body('questions.*.points').isInt({ min: 1 }).withMessage('Points must be at least 1')
], createTest);

// @route   PUT /api/tests/:id
// @desc    Update test
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid test ID'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 minute')
], updateTest);

// @route   DELETE /api/tests/:id
// @desc    Delete test
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid test ID')
], deleteTest);

// @route   PUT /api/tests/:id/publish
// @desc    Publish test
// @access  Private (Admin)
router.put('/:id/publish', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid test ID')
], publishTest);

// @route   PUT /api/tests/:id/unpublish
// @desc    Unpublish test
// @access  Private (Admin)
router.put('/:id/unpublish', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid test ID')
], unpublishTest);

// @route   POST /api/tests/:id/start
// @desc    Start test attempt
// @access  Private (Student)
router.post('/:id/start', protect, authorize('student'), [
  param('id').isMongoId().withMessage('Invalid test ID')
], startTest);

// @route   POST /api/tests/:id/submit
// @desc    Submit test
// @access  Private (Student)
router.post('/:id/submit', protect, authorize('student'), [
  param('id').isMongoId().withMessage('Invalid test ID'),
  body('answers').isArray().withMessage('Answers must be an array')
], submitTest);

// @route   POST /api/tests/:id/save-answer
// @desc    Save single answer (auto-save)
// @access  Private (Student)
router.post('/:id/save-answer', protect, authorize('student'), [
  param('id').isMongoId().withMessage('Invalid test ID'),
  body('questionId').isMongoId().withMessage('Invalid question ID'),
  body('answer').exists().withMessage('Answer is required')
], saveAnswer);

module.exports = router;
