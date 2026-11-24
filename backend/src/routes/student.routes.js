import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  reallocateRoom,
  deleteStudent,
} from '../controllers/student.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(authorize(ROLES.WARDEN, ROLES.GUARD), getStudents)
  .post(authorize(ROLES.WARDEN), createStudent);

router
  .route('/:id')
  .get(getStudentById)
  .delete(authorize(ROLES.WARDEN), deleteStudent);

router.post('/:id/reallocate', authorize(ROLES.WARDEN), reallocateRoom);

export default router;
