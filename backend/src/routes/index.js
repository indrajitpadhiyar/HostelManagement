import { Router } from 'express';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import leaveRoutes from './leave.routes.js';
import guardRoutes from './guard.routes.js';
import wardenRoutes from './warden.routes.js';
import roomRoutes from './room.routes.js';
import notificationRoutes from './notification.routes.js';
import attendanceRoutes from './attendance.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/leaves', leaveRoutes);
router.use('/guard', guardRoutes);
router.use('/warden', wardenRoutes);
router.use('/rooms', roomRoutes);
router.use('/notifications', notificationRoutes);
router.use('/attendance', attendanceRoutes);

export default router;
