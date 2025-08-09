const { body, validationResult } = require('express-validator');

// Existing validations
exports.registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

exports.loginValidation = [
  body('identifier').trim().notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.problemValidation = [
  body('title').trim().notEmpty().withMessage('Problem title is required'),
  body('description').trim().notEmpty().withMessage('Problem description is required'),
  body('inputFormat').trim().notEmpty().withMessage('Input format is required'),
  body('outputFormat').trim().notEmpty().withMessage('Output format is required'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty level'),
  body('testCases').isArray({ min: 1 }).withMessage('At least one test case is required'),
  body('sampleTestCases').isArray({ min: 1 }).withMessage('At least one sample test case is required')
];

// ADD THESE NEW VALIDATIONS:

exports.submissionValidation = [
  body('problemId')
    .notEmpty()
    .withMessage('Problem ID is required')
    .isMongoId()
    .withMessage('Invalid problem ID format'),
  body('language')
    .notEmpty()
    .withMessage('Programming language is required')
    .isIn(['cpp', 'java', 'python', 'javascript'])
    .withMessage('Unsupported programming language'),
  body('code')
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Code must be between 10 and 10000 characters')
];

exports.userUpdateValidation = [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('country').optional().trim().isLength({ max: 50 }),
  body('institution').optional().trim().isLength({ max: 100 })
];

exports.contestValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Contest title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Contest description is required'),
  body('startTime')
    .isISO8601()
    .toDate()
    .withMessage('Start time must be a valid date')
    .custom((value, { req }) => {
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
      return true;
    }),
  body('problems')
    .isArray({ min: 1 })
    .withMessage('At least one problem is required')
    .custom((problems) => {
      // Validate that all problem IDs are valid MongoDB ObjectIds
      const ObjectId = require('mongoose').Types.ObjectId;
      const invalidIds = problems.filter(id => !ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        throw new Error('Invalid problem IDs provided');
      }
      return true;
    })
];

exports.contestUpdateValidation = [
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim(),
  body('startTime').optional().isISO8601().toDate().withMessage('Start time must be a valid date'),
  body('endTime').optional().isISO8601().toDate().withMessage('End time must be a valid date'),
  body('problems').optional().isArray({ min: 1 }).withMessage('At least one problem is required')
];

// VALIDATION MIDDLEWARE - VERY IMPORTANT!
exports.validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  };
};
