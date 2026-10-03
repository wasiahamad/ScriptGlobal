import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

export function createResourceRoutes(controller, { singleton = false } = {}) {
  const publicRouter = Router();
  const adminRouter = Router();
  if (singleton) {
    publicRouter.get('/', asyncHandler(controller.publicSingleton));
    adminRouter.get('/', requireAuth, asyncHandler(controller.get));
    adminRouter.put('/', requireAuth, asyncHandler(controller.singleton));
  } else {
    publicRouter.get('/', asyncHandler(controller.publicList));
    publicRouter.get('/:key', asyncHandler(controller.publicGet));
    adminRouter.get('/', requireAuth, asyncHandler(controller.list));
    adminRouter.post('/', requireAuth, asyncHandler(controller.create));
    adminRouter.patch('/reorder', requireAuth, asyncHandler(controller.reorder));
    adminRouter.get('/:key', requireAuth, asyncHandler(controller.get));
    adminRouter.put('/:id', requireAuth, asyncHandler(controller.update));
    adminRouter.patch('/:id/status', requireAuth, asyncHandler(controller.status));
    adminRouter.delete('/:id', requireAuth, requireRole('super_admin', 'content_manager'), asyncHandler(controller.remove));
  }
  return { publicRouter, adminRouter };
}
