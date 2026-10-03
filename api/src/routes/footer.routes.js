import { footerController } from '../controllers/footer.controller.js';
import { createResourceRoutes } from './resource.routes.js';
export default createResourceRoutes(footerController, { singleton: true });
