import { contactController } from '../controllers/contact.controller.js';
import { createResourceRoutes } from './resource.routes.js';
export default createResourceRoutes(contactController, { singleton: true });
