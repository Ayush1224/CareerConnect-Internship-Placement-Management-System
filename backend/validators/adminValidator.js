import { body, param, query, validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return next();
};

export const companyListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('verified').optional().isIn(['true', 'false']).withMessage('Verified must be true or false'),
  validateRequest
];

export const companyVerificationValidator = [
  param('id').isMongoId().withMessage('A valid company ID is required'),
  body('verified').isBoolean().withMessage('Verified must be a boolean').toBoolean(),
  validateRequest
];
