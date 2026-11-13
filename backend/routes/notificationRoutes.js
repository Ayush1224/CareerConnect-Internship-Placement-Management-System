import { Router } from 'express';
import { listNotifications, markNotificationRead } from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { param, validationResult } from 'express-validator';

const router = Router();

const validateId = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  return next();
};

router.use(authMiddleware);
router.get('/', listNotifications);
router.patch(
  '/:id/read',
  param('id').isMongoId().withMessage('A valid notification ID is required'),
  validateId,
  markNotificationRead
);

export default router;
