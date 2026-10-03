import { publicationSupportController } from '../controllers/publicationSupport.controller.js';
import { createResourceRoutes } from './resource.routes.js';
export default createResourceRoutes(publicationSupportController, { singleton: true });
