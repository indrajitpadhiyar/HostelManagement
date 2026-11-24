import { Router } from 'express';
import {
  getWardenDashboard,
  getReports,
  getActivities,
  getGuards,
  addGuard,
  toggleGuardDuty,
} from '../controllers/warden.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);
router.use(authorize(ROLES.WARDEN));

router.get('/dashboard', getWardenDashboard);
router.get('/reports', getReports);
router.get('/activities', getActivities);
router.route('/guards').get(getGuards).post(addGuard);
router.patch('/guards/:id/toggle-duty', toggleGuardDuty);

export default router;
