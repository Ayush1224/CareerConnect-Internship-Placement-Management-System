import { body, validationResult } from 'express-validator';

const allowedFields = new Set([
  'name',
  'phone',
  'college',
  'degree',
  'branch',
  'graduationYear',
  'skills',
  'github',
  'linkedin',
  'portfolio',
  'bio',
  'location'
]);

const validateProfileBody = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ success: false, message: 'A profile object is required' });
  }

  const fields = Object.keys(req.body);
  if (!fields.length) {
    return res.status(400).json({ success: false, message: 'At least one profile field is required' });
  }

  if (fields.some((field) => !allowedFields.has(field))) {
    return res.status(400).json({ success: false, message: 'Unknown or unsupported profile field' });
  }

  return next();
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return next();
};

export const studentProfileValidator = [
  validateProfileBody,
  body('name')
    .optional()
    .isString().withMessage('Name must be text').bail()
    .trim()
    .notEmpty().withMessage('Name is required')
    .bail()
    .isLength({ max: 120 }).withMessage('Name must be 120 characters or fewer'),
  body('phone')
    .optional()
    .isString().withMessage('Phone must be text').bail()
    .trim()
    .isLength({ max: 40 }).withMessage('Phone must be 40 characters or fewer'),
  ...['profileImage', 'resume', 'github', 'linkedin', 'portfolio'].map((field) => (
    body(field)
      .optional()
      .isString().withMessage(`${field} must be text`).bail()
      .trim()
      .isLength({ max: 2048 }).withMessage(`${field} must be 2,048 characters or fewer`)
  )),
  ...['college', 'degree', 'branch', 'location'].map((field) => (
    body(field)
      .optional()
      .isString().withMessage(`${field} must be text`).bail()
      .trim()
      .isLength({ max: 120 }).withMessage(`${field} must be 120 characters or fewer`)
  )),
  body('graduationYear')
    .optional({ values: 'null' })
    .isInt({ min: 1900, max: 2200 }).withMessage('Graduation year must be between 1900 and 2200')
    .toInt(),
  body('skills')
    .optional()
    .isArray({ max: 50 }).withMessage('Skills must be an array of at most 50 items'),
  body('skills.*')
    .isString().withMessage('Each skill must be text').bail()
    .trim()
    .notEmpty().withMessage('Skills cannot be empty')
    .bail()
    .isLength({ max: 50 }).withMessage('Each skill must be 50 characters or fewer'),
  body('bio')
    .optional()
    .isString().withMessage('Bio must be text').bail()
    .trim()
    .isLength({ max: 2000 }).withMessage('Bio must be 2,000 characters or fewer'),
  validateRequest
];
