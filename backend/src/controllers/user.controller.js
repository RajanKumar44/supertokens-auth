const { pool } = require("../config/db");
const supertokens = require("supertokens-node");

/**
 * GET /api/users/me
 * Fetches the user profile from the app database.
 * Creates a profile record if one doesn't exist yet.
 */
async function getUserProfile(req, res) {
  try {
    const userId = req.session.getUserId();

    // Get email from SuperTokens
    const userInfo = await supertokens.getUser(userId);
    const email = userInfo ? userInfo.emails[0] : null;

    // Check if profile exists in our app DB
    let result = await pool.query(
      "SELECT * FROM user_profiles WHERE supertokens_user_id = $1",
      [userId]
    );

    // Auto-create profile if it doesn't exist
    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO user_profiles (supertokens_user_id, display_name)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, email ? email.split("@")[0] : "User"]
      );
    }

    const profile = result.rows[0];

    res.json({
      status: "ok",
      profile: {
        id: profile.id,
        userId: profile.supertokens_user_id,
        email,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user profile",
    });
  }
}

/**
 * PUT /api/users/me
 * Updates the user profile in the app database.
 */
async function updateUserProfile(req, res) {
  try {
    const userId = req.session.getUserId();
    const { displayName, avatarUrl } = req.body;

    const result = await pool.query(
      `UPDATE user_profiles
       SET display_name = COALESCE($1, display_name),
           avatar_url = COALESCE($2, avatar_url),
           updated_at = NOW()
       WHERE supertokens_user_id = $3
       RETURNING *`,
      [displayName, avatarUrl, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found",
      });
    }

    const profile = result.rows[0];

    res.json({
      status: "ok",
      message: "Profile updated successfully",
      profile: {
        id: profile.id,
        userId: profile.supertokens_user_id,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        updatedAt: profile.updated_at,
      },
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to update user profile",
    });
  }
}

module.exports = { getUserProfile, updateUserProfile };
