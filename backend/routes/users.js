const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getAdmins
} = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and require admin access unless specified
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/', [
  query('role').optional().isIn(['student', 'admin']).withMessage('Invalid role'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], getUsers);

// @route   GET /api/users/students
// @desc    Get all students
// @access  Private (Admin)
router.get('/students', getStudents);

// @route   GET /api/users/admins
// @desc    Get all admins
// @access  Private (Admin)
router.get('/admins', getAdmins);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin)
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid user ID')
], getUser);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin)
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'admin']).withMessage('Role must be student or admin'),
  body('studentId').optional().isString()
], createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin)
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
  body('role').optional().isIn(['student', 'admin']).withMessage('Role must be student or admin'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid user ID')
], deleteUser);

module.exports = router;
