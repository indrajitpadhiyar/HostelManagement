import { Router } from 'express';
import {
  getLeaves,
  getLeaveById,
  applyLeave,
  parentDecision,
  wardenDecision,
  requestExtension,
} from '../controllers/leave.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(getLeaves)
  .post(authorize(ROLES.STUDENT), applyLeave);

router.route('/:id').get(getLeaveById);

router.patch(
  '/:id/parent-decision',
  authorize(ROLES.PARENT),
  parentDecision
);

router.patch(
  '/:id/warden-decision',
  authorize(ROLES.WARDEN),
  wardenDecision
);

router.post(
  '/:id/extend',
  authorize(ROLES.STUDENT),
  requestExtension
);

export default router;
