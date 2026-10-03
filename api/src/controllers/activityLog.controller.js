import ActivityLog from '../models/ActivityLog.model.js';
import { success } from '../utils/apiResponse.js';

export async function listActivityLogs(req, res) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const [data, total] = await Promise.all([
    ActivityLog.find().populate('adminUser', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ActivityLog.countDocuments(),
  ]);
  return success(res, data, 'Activity logs fetched successfully', { page, limit, total, totalPages: Math.ceil(total / limit) });
}
