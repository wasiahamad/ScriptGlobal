import { failure } from '../utils/apiResponse.js';

export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return failure(res, 'Validation failed', result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })), 422);
    req.body = result.data;
    return next();
  };
}
