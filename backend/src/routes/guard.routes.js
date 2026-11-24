import { Router } from 'express';
import {
  getGuardDashboard,
  scanVerify,
  recordGateExit,
  recordGateReturn,
  getGateHistory,
} from '../controllers/guard.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);
router.use(authorize(ROLES.GUARD, ROLES.WARDEN));

router.get('/dashboard', getGuardDashboard);
router.post('/scan-verify', scanVerify);
router.post('/record-exit', recordGateExit);
router.post('/record-return', recordGateReturn);
router.get('/gate-history', getGateHistory);

export default router;
