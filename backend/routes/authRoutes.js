import { Router } from 'express';
import {
  getLoggedInUser,
  loginUser,
  registerUser
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { loginValidator, registerValidator } from '../validators/authValidator.js';

const router = Router();

router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.get('/me', authMiddleware, getLoggedInUser);

export default router;
