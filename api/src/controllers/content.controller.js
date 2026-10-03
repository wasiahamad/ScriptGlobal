import { failure, success } from "../utils/apiResponse.js";
import {
  getContent,
  listContent,
  reorderContent,
  saveContent,
  softDeleteContent,
  updateContentStatus,
} from "../services/content.service.js";

export function contentController(type) {
  return {
    list: async (req, res) => {
      const result = await listContent(type, req.query, false);
      return success(
        res,
        result.data,
        `${type} fetched successfully`,
        result.pagination,
      );
    },
    publicList: async (req, res) => {
      const result = await listContent(type, req.query, true);
      return success(
        res,
        result.data,
        `${type} fetched successfully`,
        result.pagination,
      );
    },
    get: async (req, res) => {
      const item = await getContent(type, req.params.key, false);
      return item
        ? success(res, item, `${type} fetched successfully`)
        : failure(res, "Content not found", [], 404);
    },
    publicGet: async (req, res) => {
      const item = await getContent(type, req.params.key, true);
      return item
        ? success(res, item, `${type} fetched successfully`)
        : failure(res, "Content not found", [], 404);
    },
    create: async (req, res) =>
      success(
        res,
        await saveContent(type, req.body, req.adminUser._id),
        `${type} created successfully`,
        null,
        201,
      ),
    update: async (req, res) => {
      const item = await saveContent(
        type,
        req.body,
        req.adminUser._id,
        req.params.id,
      );
      return item
        ? success(res, item, `${type} updated successfully`)
        : failure(res, "Content not found", [], 404);
    },
    remove: async (req, res) => {
      const item = await softDeleteContent(
        type,
        req.params.id,
        req.adminUser._id,
      );
      return item
        ? success(res, item, `${type} deleted successfully`)
        : failure(res, "Content not found", [], 404);
    },
    status: async (req, res) => {
      const item = await updateContentStatus(
        type,
        req.params.id,
        req.body.status,
        req.adminUser._id,
      );
      return item
        ? success(res, item, `${type} status updated successfully`)
        : failure(res, "Content not found", [], 404);
    },
    reorder: async (req, res) =>
      success(
        res,
        (await reorderContent(type, req.body.items || [], req.adminUser._id))
          .data,
        `${type} reordered successfully`,
      ),
    singleton: async (req, res) =>
      success(
        res,
        await saveContent(type, req.body, req.adminUser._id),
        `${type} updated successfully`,
      ),
    publicSingleton: async (req, res) => {
      const item = await getContent(type, type, true);
      return item
        ? success(res, item, `${type} fetched successfully`)
        : failure(res, "Content not found", [], 404);
    },
  };
}
