const { Pool } = require("pg");

/**
 * PostgreSQL connection pool for custom application queries.
 * SuperTokens manages its own tables automatically — this pool
 * is for any additional app-level data (user profiles, etc.).
 */
const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || "supertokens_user",
  password: process.env.POSTGRES_PASSWORD || "supertokens_secret_2024",
  database: process.env.POSTGRES_DB || "supertokens_auth",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on("connect", () => {
  console.log("💾 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err.message);
});

/**
 * Initialize the user_profiles table if it doesn't exist.
 * This is for app-level user data beyond what SuperTokens stores.
 */
async function initDB() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS user_profiles (
      id SERIAL PRIMARY KEY,
      supertokens_user_id VARCHAR(255) UNIQUE NOT NULL,
      display_name VARCHAR(255),
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log("📋 user_profiles table ready");
  } catch (err) {
    console.error("❌ Failed to initialize database tables:", err.message);
  }
}

module.exports = { pool, initDB };
