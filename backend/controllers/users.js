const { validationResult } = require('express-validator');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    let query = {};
    
    // Filter by role if provided
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort('-createdAt')
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
      count: users.length,
      total,
      pagination,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private (Admin)
exports.getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admins
// @route   GET /api/users/admins
// @access  Private (Admin)
exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const { name, email, password, role, studentId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('User with this email already exists', 400));
    }

    // Check if studentId already exists for students
    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return next(new ErrorResponse('Student ID already exists', 400));
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      studentId: role === 'student' ? studentId : undefined
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check if email is being changed and is already taken
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      
      if (existingUser) {
        return next(new ErrorResponse('Email is already taken', 400));
      }
    }

    // Check if studentId is being changed and already exists
    if (req.body.studentId && req.body.studentId !== user.studentId) {
      const existingStudent = await User.findOne({
        studentId: req.body.studentId,
        _id: { $ne: req.params.id }
      });
      
      if (existingStudent) {
        return next(new ErrorResponse('Student ID already exists', 400));
      }
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return next(new ErrorResponse('Cannot delete your own account', 400));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
