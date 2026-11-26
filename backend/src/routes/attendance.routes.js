import { Router } from 'express';
import {
  getStudentAttendance,
  getAttendanceOverview,
  getMonthlyAttendance,
  getDayAttendance,
  markAttendance,
} from '../controllers/attendance.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

router.get('/student', getStudentAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.get('/overview', authorize(ROLES.WARDEN), getAttendanceOverview);
router.get('/monthly', authorize(ROLES.WARDEN), getMonthlyAttendance);
router.get('/day', authorize(ROLES.WARDEN), getDayAttendance);
router.post('/mark', authorize(ROLES.WARDEN), markAttendance);
router.post('/batch', authorize(ROLES.WARDEN), markAttendance);

export default router;
