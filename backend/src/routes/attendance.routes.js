import { Router } from 'express';
import {
  getStudentAttendance,
  getAttendanceOverview,
  markAttendance,
} from '../controllers/attendance.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

router.get('/student', getStudentAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.get('/overview', authorize(ROLES.WARDEN), getAttendanceOverview);
router.post('/mark', authorize(ROLES.WARDEN), markAttendance);

export default router;
