const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth");
const { getJwtInfo, getJwksInfo } = require("../controllers/jwt.controller");

/**
 * GET /api/jwt/info
 * Returns the decoded JWT payload (requires authentication).
 * Shows all claims including custom ones (email, role).
 */
router.get("/info", requireAuth(), getJwtInfo);

/**
 * GET /api/jwt/verify-info
 * Public endpoint — returns information about how to verify JWTs.
 * Other microservices can use this to learn how to validate tokens.
 */
router.get("/verify-info", getJwksInfo);

module.exports = router;
