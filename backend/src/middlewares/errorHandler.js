/**
 * Global error handler middleware.
 * SuperTokens error handler is mounted separately in index.js via
 * stErrorHandler() — this catches everything else.
 */
function globalErrorHandler(err, req, res, next) {
  console.error("❌ Unhandled Error:", err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Something went wrong";

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = { globalErrorHandler };
