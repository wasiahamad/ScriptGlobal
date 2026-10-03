export function success(
    res,
    data,
    message = "Request successful",
    pagination = null,
    status = 200,
) {
    return res.status(status).json({ success: true, message, data, pagination });
}

export function failure(res, message, errors = [], status = 400) {
    return res.status(status).json({ success: false, message, errors });
}
