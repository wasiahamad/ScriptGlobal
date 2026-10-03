import { thesisController } from "../controllers/thesis.controller.js";
import { createResourceRoutes } from "./resource.routes.js";
export default createResourceRoutes(thesisController, { singleton: true });
