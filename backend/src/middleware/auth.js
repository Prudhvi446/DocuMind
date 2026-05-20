const jwt = require("jsonwebtoken");
const { env } = require("../config/env.js");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized", code: "AUTH_REQUIRED" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.tenantId = payload.tenantId;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized", code: "AUTH_REQUIRED" });
  }
}

module.exports = { authMiddleware };
