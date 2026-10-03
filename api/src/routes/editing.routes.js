import { editingController } from '../controllers/editing.controller.js';
import { createResourceRoutes } from './resource.routes.js';
export default createResourceRoutes(editingController, { singleton: true });
