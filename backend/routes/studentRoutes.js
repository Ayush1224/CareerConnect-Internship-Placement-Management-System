import { Router } from 'express';
import {
  getStudentProfile,
  updateStudentProfile
} from '../controllers/studentProfileController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { uploadFields } from '../middleware/uploadMiddleware.js';
import { studentProfileValidator } from '../validators/studentProfileValidator.js';
import {
  uploadStudentProfileImage,
  uploadStudentResume
} from '../controllers/studentProfileController.js';

const router = Router();

router.use(authMiddleware, roleMiddleware('student'));
router.get('/profile', getStudentProfile);
router.patch('/profile', studentProfileValidator, updateStudentProfile);
router.post(
  '/profile/resume',
  uploadFields({ fieldName: 'file', allowedMimeTypes: ['application/pdf'], maxSizeMb: 10 }),
  uploadStudentResume
);
router.post(
  '/profile/image',
  uploadFields({
    fieldName: 'file',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMb: 5
  }),
  uploadStudentProfileImage
);

export default router;
