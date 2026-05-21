export function sendSuccess(res, data = null, message = "Request successful", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function normalizeApiPayload(body, statusCode = 200) {
  if (body && typeof body === "object" && "success" in body) {
    return body;
  }

  return {
    success: statusCode < 400,
    message: statusCode < 400 ? "Request successful" : "Request failed",
    data: body ?? null,
  };
}
