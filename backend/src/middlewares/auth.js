const {
  verifySession,
} = require("supertokens-node/recipe/session/framework/express");

/**
 * Authentication middleware using SuperTokens session verification.
 *
 * Usage:
 *   app.get("/protected", requireAuth(), (req, res) => {
 *     const userId = req.session.getUserId();
 *   });
 *
 * Options:
 *   - requireAuth()          → session required (401 if missing)
 *   - requireAuth(false)     → session optional (req.session may be undefined)
 */
function requireAuth(sessionRequired = true) {
  return verifySession({ sessionRequired });
}

module.exports = { requireAuth, verifySession };
