import { body, validationResult } from 'express-validator';

export const registerValidator = [
  body('name')
    .isString().withMessage('Name is required').bail()
    .trim().notEmpty().withMessage('Name is required'),
  body('email')
    .isString().withMessage('Valid email is required').bail()
    .trim().isEmail().withMessage('Valid email is required').toLowerCase(),
  body('password')
    .isString().withMessage('Password must be at least 6 characters').bail()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'company']).withMessage('Role must be student or company'),
  body('phone').optional()
    .isString().withMessage('Phone must be a string').bail()
    .trim().isLength({ max: 30 }).withMessage('Phone must be 30 characters or fewer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
  }
];

export const loginValidator = [
  body('email')
    .isString().withMessage('Valid email is required').bail()
    .trim().isEmail().withMessage('Valid email is required').toLowerCase(),
  body('password')
    .isString().withMessage('Password is required').bail()
    .notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
  }
];
