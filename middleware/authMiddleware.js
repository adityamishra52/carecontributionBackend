export function requireAdmin(req, res, next) {
  const expectedToken = process.env.ADMIN_TOKEN || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";

  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  const password = req.get("x-admin-password") || "";

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev && !expectedToken && !expectedPassword) {
    return next();
  }

  if (expectedToken && token === expectedToken) {
    return next();
  }

  if (expectedPassword && password === expectedPassword) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Admin authorization required",
  });
}