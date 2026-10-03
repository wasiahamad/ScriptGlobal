import { settingsController } from "../controllers/settings.controller.js";
import { createResourceRoutes } from "./resource.routes.js";
export default createResourceRoutes(settingsController, { singleton: true });
