import ActivityLog from "../models/ActivityLog.model.js";

export function recordActivity({
    adminUser,
    action,
    entityType,
    entityId,
    description,
}) {
    return ActivityLog.create({
        adminUser,
        action,
        entityType,
        entityId,
        description,
    });
}
