const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const supertokens = require("supertokens-node");
const {
  middleware: stMiddleware,
} = require("supertokens-node/framework/express");
const { errorHandler: stErrorHandler } = require("supertokens-node/framework/express");

// Load env vars (for local dev; Docker injects them automatically)
require("dotenv").config();

// ─── Initialize SuperTokens ────────────────────────────────────
const { initSuperTokens } = require("./config/supertokens");
initSuperTokens();

// ─── Initialize Database Tables ────────────────────────────────
const { initDB } = require("./config/db");
initDB();

// ─── Initialize Express ────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Logging ────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for dev; enable in production
  })
);
app.use(morgan("dev"));

// ─── CORS (must come BEFORE SuperTokens middleware) ────────────
app.use(
  cors({
    origin: process.env.WEBSITE_DOMAIN || "http://localhost:3000",
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ─── Body Parsing ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── SuperTokens Middleware (exposes /auth/* endpoints) ────────
app.use(stMiddleware());

// ─── Custom Routes ─────────────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);

// ─── Health Check ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "supertokens-auth-backend",
    timestamp: new Date().toISOString(),
  });
});

// ─── SuperTokens Error Handler ─────────────────────────────────
app.use(stErrorHandler());

// ─── Global Error Handler ──────────────────────────────────────
const { globalErrorHandler } = require("./middlewares/errorHandler");
app.use(globalErrorHandler);

// ─── Start Server ──────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Backend server running on port ${PORT}`);
  console.log(`📡 SuperTokens Core: ${process.env.SUPERTOKENS_CONNECTION_URI}`);
  console.log(`🌐 Frontend Domain:  ${process.env.WEBSITE_DOMAIN}`);
  console.log(`💾 Database Host:    ${process.env.POSTGRES_HOST}\n`);
});
