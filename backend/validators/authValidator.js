import { body, validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return next();
};

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

export const forgotPasswordValidator = [
  body('email')
    .isString().withMessage('Valid email is required').bail()
    .trim().isEmail().withMessage('Valid email is required').toLowerCase(),
  validateRequest
];

export const resetPasswordValidator = [
  body('token')
    .isString().withMessage('A reset token is required').bail()
    .trim()
    .isLength({ min: 64, max: 64 }).withMessage('Invalid or expired reset token')
    .bail()
    .isHexadecimal().withMessage('Invalid or expired reset token'),
  body('password')
    .isString().withMessage('Password must be text').bail()
    .isLength({ min: 12 }).withMessage('Password must be at least 12 characters')
    .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must include a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must include a symbol')
    .custom((password) => Buffer.byteLength(password, 'utf8') <= 72)
    .withMessage('Password must be 72 UTF-8 bytes or fewer'),
  validateRequest
];
