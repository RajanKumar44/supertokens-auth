const express = require("express");
const router = express.Router();
const Session = require("supertokens-node/recipe/session");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
const supertokens = require("supertokens-node");
const { requireAuth } = require("../middlewares/auth");

/**
 * GET /auth/user
 * Returns the currently authenticated user's info.
 * Protected — requires a valid session.
 */
router.get("/user", requireAuth(), async (req, res) => {
  try {
    const userId = req.session.getUserId();

    // Get user info from SuperTokens
    const userInfo = await supertokens.getUser(userId);

    if (!userInfo) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "ok",
      user: {
        id: userInfo.id,
        email: userInfo.emails[0],
        timeJoined: userInfo.timeJoined,
        loginMethods: userInfo.loginMethods.map((lm) => ({
          recipeId: lm.recipeId,
          verified: lm.verified,
        })),
      },
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user info",
    });
  }
});

/**
 * POST /auth/logout
 * Revokes the current session (logs out the user).
 * Protected — requires a valid session.
 */
router.post("/logout", requireAuth(), async (req, res) => {
  try {
    await req.session.revokeSession();
    res.json({
      status: "ok",
      message: "Successfully logged out",
    });
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to logout",
    });
  }
});

module.exports = router;
