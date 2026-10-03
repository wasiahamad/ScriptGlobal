import { homeController } from '../controllers/home.controller.js';
import { createResourceRoutes } from './resource.routes.js';
export default createResourceRoutes(homeController, { singleton: true });
