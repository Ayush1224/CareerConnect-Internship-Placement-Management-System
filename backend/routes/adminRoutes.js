import { Router } from 'express';
import {
  getAdminDashboard,
  listCompanies,
  setCompanyVerification
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  companyListValidator,
  companyVerificationValidator
} from '../validators/adminValidator.js';

const router = Router();

router.use(authMiddleware, roleMiddleware('admin'));
router.get('/dashboard', getAdminDashboard);
router.get('/companies', companyListValidator, listCompanies);
router.patch('/companies/:id/verification', companyVerificationValidator, setCompanyVerification);

export default router;
