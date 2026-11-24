import { Router } from 'express';
import {
  getRooms,
  createRoom,
  allocateRoom,
} from '../controllers/room.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(getRooms)
  .post(authorize(ROLES.WARDEN), createRoom);

router.post('/:roomNo/allocate', authorize(ROLES.WARDEN), allocateRoom);

export default router;
