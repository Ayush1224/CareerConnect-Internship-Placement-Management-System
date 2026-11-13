import { Router } from 'express';
import {
  getMyCompanyProfile,
  saveMyCompanyProfile
} from '../controllers/companyController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { companyProfileValidator } from '../validators/companyValidator.js';

const router = Router();

router.use(authMiddleware, roleMiddleware('company'));
router.get('/me', getMyCompanyProfile);
router.put('/me', companyProfileValidator, saveMyCompanyProfile);

export default router;
