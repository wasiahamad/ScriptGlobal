import { createContentModel, objectIdRef } from "./_createContentModel.js";
export default createContentModel("Navigation", "navigation", {
    label: String,
    type: { type: String, enum: ["link", "dropdown"] },
    url: String,
    target: String,
    parentId: objectIdRef("Navigation"),
    children: [Object],
});
