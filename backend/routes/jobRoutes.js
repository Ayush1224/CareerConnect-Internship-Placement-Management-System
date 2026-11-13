import { Router } from 'express';
import {
  closeJob,
  createJob,
  getPublicJob,
  listCompanyJobs,
  listPublicJobs,
  updateJob
} from '../controllers/jobController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import { jobUpdateValidator, jobValidator } from '../validators/jobValidator.js';

const router = Router();

router.get('/', listPublicJobs);
router.get('/mine', authMiddleware, roleMiddleware('company'), listCompanyJobs);
router.get('/:id', getPublicJob);
router.post('/', authMiddleware, roleMiddleware('company'), jobValidator, createJob);
router.patch('/:id/close', authMiddleware, roleMiddleware('company'), closeJob);
router.patch('/:id', authMiddleware, roleMiddleware('company'), jobUpdateValidator, updateJob);

export default router;
