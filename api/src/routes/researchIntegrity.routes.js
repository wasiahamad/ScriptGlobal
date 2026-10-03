import { researchIntegrityController } from '../controllers/researchIntegrity.controller.js';
import { createResourceRoutes } from './resource.routes.js';
export default createResourceRoutes(researchIntegrityController, { singleton: true });
