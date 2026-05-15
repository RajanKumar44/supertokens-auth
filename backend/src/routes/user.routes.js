const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth");
const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/user.controller");

/**
 * GET /api/users/me
 * Get the current user's profile (from app database).
 */
router.get("/me", requireAuth(), getUserProfile);

/**
 * PUT /api/users/me
 * Update the current user's profile.
 */
router.put("/me", requireAuth(), updateUserProfile);

module.exports = router;
