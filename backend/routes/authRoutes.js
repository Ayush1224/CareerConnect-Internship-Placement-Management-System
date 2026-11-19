import { Router } from 'express';
import {
  forgotPassword,
  getLoggedInUser,
  loginUser,
  registerUser,
  resetPassword
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator
} from '../validators/authValidator.js';

const router = Router();

router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.get('/me', authMiddleware, getLoggedInUser);

export default router;
