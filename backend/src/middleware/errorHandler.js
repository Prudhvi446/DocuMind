const { env } = require("../config/env.js");

function errorHandler(err, req, res, _next) {
  console.error(err.message);

  const status = err.status || err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Internal server error";

  const body = { error: message, code };

  if (env.NODE_ENV === "development" && err.stack) {
    body.stack = err.stack;
  }

  res.status(status).json(body);
}

module.exports = { errorHandler };
