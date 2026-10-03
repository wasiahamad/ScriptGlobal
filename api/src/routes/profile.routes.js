import { profileController } from '../controllers/profile.controller.js';
import { createResourceRoutes } from './resource.routes.js';
export default createResourceRoutes(profileController, { singleton: true });
