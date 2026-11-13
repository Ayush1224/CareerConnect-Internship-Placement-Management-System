import { Router } from 'express';
import {
  applyToJob,
  getStudentApplication,
  listCompanyApplicants,
  listStudentApplications,
  updateApplicationStatus
} from '../controllers/applicationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  applicationStatusValidator,
  applicationSubmissionValidator
} from '../validators/applicationValidator.js';

const router = Router();

router.use(authMiddleware);
router.post('/', roleMiddleware('student'), applicationSubmissionValidator, applyToJob);
router.get('/', roleMiddleware('student'), listStudentApplications);
router.get('/jobs/:jobId', roleMiddleware('company'), listCompanyApplicants);
router.patch('/:id/status', roleMiddleware('company'), applicationStatusValidator, updateApplicationStatus);
router.get('/:id', roleMiddleware('student'), getStudentApplication);

export default router;
