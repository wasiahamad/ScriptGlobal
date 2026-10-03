import { failure } from "../utils/apiResponse.js";

export function notFound(req, res) {
    return failure(
        res,
        `Route not found: ${req.method} ${req.originalUrl}`,
        [],
        404,
    );
}

export function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error);
    const status =
        error.statusCode || (error.name === "ValidationError" ? 422 : 500);
    const errors =
        error.name === "ValidationError"
            ? Object.values(error.errors).map((item) => item.message)
            : [];
    if (status >= 500) console.error(error);
    return failure(
        res,
        status >= 500 ? "Internal server error" : error.message,
        errors,
        status,
    );
}
