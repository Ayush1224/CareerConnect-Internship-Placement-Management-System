import { body, header, param, validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return next();
};

const futureTimestamp = (value) => {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  return hasTimezone && Number.isFinite(Date.parse(value)) && new Date(value) > new Date();
};

const secureMeetingLink = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
};

const idempotencyHeader = header('Idempotency-Key')
  .trim()
  .isLength({ min: 8, max: 128 })
  .matches(/^[A-Za-z0-9._:-]+$/)
  .withMessage('A valid Idempotency-Key header is required');

const scheduledAtField = body('scheduledAt')
  .isString()
  .withMessage('Scheduled time must be an ISO timestamp with a timezone')
  .bail()
  .isISO8601({ strict: true, strictSeparator: true })
  .withMessage('Scheduled time must be an ISO timestamp with a timezone')
  .bail()
  .custom(futureTimestamp)
  .withMessage('Scheduled time must be in the future and include a timezone');

const meetingLinkField = body('meetingLink')
  .optional({ checkFalsy: true })
  .isString()
  .withMessage('Meeting link must be text')
  .bail()
  .trim()
  .isLength({ max: 2048 })
  .withMessage('Meeting link must be 2,048 characters or fewer')
  .bail()
  .custom(secureMeetingLink)
  .withMessage('Meeting link must be a valid HTTPS URL');

const notesField = body('notes')
  .optional()
  .isString()
  .withMessage('Interview notes must be text')
  .bail()
  .trim()
  .isLength({ max: 2000 })
  .withMessage('Interview notes must be 2,000 characters or fewer');

export const applicationInterviewsValidator = [
  param('applicationId').isMongoId().withMessage('A valid application ID is required'),
  validateRequest
];

export const scheduleInterviewValidator = [
  idempotencyHeader,
  body('applicationId').isMongoId().withMessage('A valid application ID is required'),
  scheduledAtField,
  meetingLinkField,
  notesField,
  validateRequest
];

export const interviewIdValidator = [
  param('id').isMongoId().withMessage('A valid interview ID is required'),
  validateRequest
];

export const rescheduleInterviewValidator = [
  param('id').isMongoId().withMessage('A valid interview ID is required'),
  idempotencyHeader,
  scheduledAtField,
  meetingLinkField,
  notesField,
  validateRequest
];

export const cancelInterviewValidator = [
  param('id').isMongoId().withMessage('A valid interview ID is required'),
  idempotencyHeader,
  validateRequest
];
