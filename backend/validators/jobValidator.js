import { body, validationResult } from 'express-validator';

const jobTypes = ['Internship', 'Full-time', 'Part-time'];
const jobStatuses = ['Active', 'Draft', 'Closed'];

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

const optionalJobFields = [
  body('requirements').optional({ values: 'falsy' }).isString().withMessage('Requirements must be text').bail().trim(),
  body('skillsRequired').optional().isArray().withMessage('Skills must be a list'),
  body('skillsRequired.*').optional().isString().withMessage('Each skill must be text').bail().trim().notEmpty().withMessage('Skills cannot be empty'),
  body('jobType').optional().isIn(jobTypes).withMessage('Invalid job type'),
  body('location').optional().isString().withMessage('Location must be text').bail().trim().notEmpty().withMessage('Location cannot be empty'),
  body('salary').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Salary must be zero or more').toFloat(),
  body('stipend').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Stipend must be zero or more').toFloat(),
  body('experience').optional({ values: 'falsy' }).isString().withMessage('Experience must be text').bail().trim(),
  body('applicationDeadline').optional({ values: 'falsy' }).isISO8601().withMessage('Application deadline must be a valid date'),
  body('status').optional().isIn(jobStatuses).withMessage('Invalid job status')
];

export const jobValidator = [
  body('title').isString().withMessage('Job title is required').bail().trim().notEmpty().withMessage('Job title is required'),
  body('description').isString().withMessage('Job description is required').bail().trim().notEmpty().withMessage('Job description is required'),
  body('location').isString().withMessage('Location is required').bail().trim().notEmpty().withMessage('Location is required'),
  ...optionalJobFields,
  body('vacancies').isInt({ min: 1 }).withMessage('Vacancies must be at least 1').toInt(),
  validateRequest
];

export const jobUpdateValidator = [
  body('title').optional().isString().withMessage('Job title must be text').bail().trim().notEmpty().withMessage('Job title cannot be empty'),
  body('description').optional().isString().withMessage('Job description must be text').bail().trim().notEmpty().withMessage('Job description cannot be empty'),
  ...optionalJobFields,
  body('vacancies').optional().isInt({ min: 1 }).withMessage('Vacancies must be at least 1').toInt(),
  validateRequest
];
