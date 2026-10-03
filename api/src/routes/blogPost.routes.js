import { contentController } from '../controllers/content.controller.js';
import { createResourceRoutes } from './resource.routes.js';

export default createResourceRoutes(contentController('blog-posts'));
