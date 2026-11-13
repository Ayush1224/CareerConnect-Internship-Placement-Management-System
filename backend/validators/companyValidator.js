import { body, validationResult } from 'express-validator';

export const companyProfileValidator = [
  body('companyName')
    .isString().withMessage('Company name is required').bail()
    .trim().notEmpty().withMessage('Company name is required'),
  body('website')
    .optional({ values: 'falsy' })
    .isString().withMessage('Website must be text').bail()
    .trim(),
  body('industry')
    .optional({ values: 'falsy' })
    .isString().withMessage('Industry must be text').bail()
    .trim(),
  body('location')
    .optional({ values: 'falsy' })
    .isString().withMessage('Location must be text').bail()
    .trim(),
  body('description')
    .optional({ values: 'falsy' })
    .isString().withMessage('Description must be text').bail()
    .trim(),
  body('contactEmail')
    .optional({ values: 'falsy' })
    .isEmail().withMessage('Please provide a valid contact email address')
    .normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    next();
  }
];
