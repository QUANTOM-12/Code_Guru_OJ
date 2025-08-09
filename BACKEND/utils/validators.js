const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// User Registration Validation
exports.registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .custom(async (value) => {
      // Check if username is already taken (you can implement this later)
      return true;
    }),
    
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
    .custom(async (value) => {
      // Check if email is already taken (you can implement this later)
      return true;
    }),
    
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6-100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// User Login Validation
exports.loginValidation = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Identifier must be between 3-100 characters'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be between 6-100 characters')
];

// Problem Validation
exports.problemValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Problem title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5-200 characters'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Problem description is required')
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50-5000 characters'),
    
  body('inputFormat')
    .trim()
    .notEmpty()
    .withMessage('Input format is required'),
    
  body('outputFormat')
    .trim()
    .notEmpty()
    .withMessage('Output format is required'),
    
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
    
  body('testCases')
    .isArray({ min: 1, max: 50 })
    .withMessage('Must provide 1-50 test cases'),
    
  body('sampleTestCases')
    .isArray({ min: 1, max: 10 })
    .withMessage('Must provide 1-10 sample test cases'),
    
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
    
  body('timeLimit')
    .optional()
    .isInt({ min: 100, max: 10000 })
    .withMessage('Time limit must be between 100-10000 milliseconds'),
    
  body('memoryLimit')
    .optional()
    .isInt({ min: 16, max: 1024 })
    .withMessage('Memory limit must be between 16-1024 MB')
];

// Code Submission Validation  
exports.submissionValidation = [
  body('problemId')
    .notEmpty()
    .withMessage('Problem ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid problem ID format');
      }
      return true;
    }),
    
  body('language')
    .notEmpty()
    .withMessage('Programming language is required')
    .isIn(['cpp', 'java', 'python', 'javascript'])
    .withMessage('Supported languages: cpp, java, python, javascript'),
    
  body('code')
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ min: 10, max: 50000 })
    .withMessage('Code must be between 10-50000 characters')
    .custom((value) => {
      // Basic code validation
      if (value.trim().length === 0) {
        throw new Error('Code cannot be empty or only whitespace');
      }
      return true;
    })
];

// User Update Validation
exports.userUpdateValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
    
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
    
  body('country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country name too long'),
    
  body('institution')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Institution name too long')
];

// Contest Validation
exports.contestValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Contest title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5-200 characters'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Contest description is required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20-2000 characters'),
    
  body('startTime')
    .isISO8601()
    .toDate()
    .withMessage('Start time must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start time must be in the future');
      }
      return true;
    }),
    
  body('endTime')
    .isISO8601()
    .toDate()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      
      const duration = new Date(value) - new Date(req.body.startTime);
      const maxDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (duration > maxDuration) {
        throw new Error('Contest duration cannot exceed 7 days');
      }
      
      return true;
    }),
    
  body('problems')
    .isArray({ min: 1, max: 20 })
    .withMessage('Contest must have 1-20 problems')
    .custom((problems) => {
      const invalidIds = problems.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        throw new Error('Invalid problem IDs provided');
      }
      return true;
    }),
    
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Max participants must be between 1-10000')
];

// Contest Update Validation
exports.contestUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5-200 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20-2000 characters'),
    
  body('startTime')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Start time must be a valid date'),
    
  body('endTime')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('End time must be a valid date'),
    
  body('problems')
    .optional()
    .isArray({ min: 1, max: 20 })
    .withMessage('Contest must have 1-20 problems')
];

// Validation Middleware
exports.validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
          field: error.path || error.param,
          message: error.msg,
          value: error.value
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }
      
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during validation'
      });
    }
  };
};

// Additional utility validations
exports.validateObjectId = (value, fieldName = 'ID') => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  return true;
};

exports.validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  if (page < 1 || page > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Page must be between 1 and 1000'
    });
  }
  
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};
