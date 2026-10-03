import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { createAdminUser, deleteAdminUser, getAdminUser, listAdminUsers, updateAdminUser } from '../controllers/adminUser.controller.js';

const router = Router();
const superAdmin = [requireAuth, requireRole('super_admin')];
router.get('/', ...superAdmin, asyncHandler(listAdminUsers));
router.post('/', ...superAdmin, asyncHandler(createAdminUser));
router.get('/:id', ...superAdmin, asyncHandler(getAdminUser));
router.put('/:id', ...superAdmin, asyncHandler(updateAdminUser));
router.delete('/:id', ...superAdmin, asyncHandler(deleteAdminUser));
export default router;
