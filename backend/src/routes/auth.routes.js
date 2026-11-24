import { Router } from 'express';
import {
  login,
  getMe,
  switchDemoRole,
  logout,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

router.post('/login', authRateLimiter, login);
router.post('/switch-demo', switchDemoRole);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
