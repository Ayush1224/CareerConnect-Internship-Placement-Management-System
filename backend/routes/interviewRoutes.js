import { Router } from 'express';
import {
  cancelInterview,
  completeInterview,
  getInterview,
  listCompanyInterviews,
  listStudentInterviews,
  rescheduleInterview,
  scheduleInterview
} from '../controllers/interviewController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  applicationInterviewsValidator,
  cancelInterviewValidator,
  interviewIdValidator,
  rescheduleInterviewValidator,
  scheduleInterviewValidator
} from '../validators/interviewValidator.js';

const router = Router();

router.use(authMiddleware);
router.get('/mine', roleMiddleware('student'), listStudentInterviews);
router.get(
  '/application/:applicationId',
  roleMiddleware('company'),
  applicationInterviewsValidator,
  listCompanyInterviews
);
router.post('/', roleMiddleware('company'), scheduleInterviewValidator, scheduleInterview);
router.patch(
  '/:id/reschedule',
  roleMiddleware('company'),
  rescheduleInterviewValidator,
  rescheduleInterview
);
router.patch('/:id/cancel', roleMiddleware('company'), cancelInterviewValidator, cancelInterview);
router.patch('/:id/complete', roleMiddleware('company'), interviewIdValidator, completeInterview);
router.get('/:id', roleMiddleware('student', 'company'), interviewIdValidator, getInterview);

export default router;
