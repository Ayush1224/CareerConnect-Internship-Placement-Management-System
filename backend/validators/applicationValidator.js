import { body, validationResult } from 'express-validator';
import { APPLICATION_STATUSES } from '../models/Application.js';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return next();
};

export const applicationSubmissionValidator = [
  body('jobId').isMongoId().withMessage('A valid job ID is required'),
  body('coverLetter')
    .optional()
    .isString().withMessage('Cover letter must be text')
    .bail()
    .trim()
    .isLength({ max: 10000 }).withMessage('Cover letter must be 10,000 characters or fewer'),
  validateRequest
];

export const applicationStatusValidator = [
  body('status').isIn(APPLICATION_STATUSES).withMessage('Invalid application status'),
  validateRequest
];
