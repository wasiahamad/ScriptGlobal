import { peerReviewController } from '../controllers/peerReview.controller.js';
import { createResourceRoutes } from './resource.routes.js';
export default createResourceRoutes(peerReviewController, { singleton: true });
