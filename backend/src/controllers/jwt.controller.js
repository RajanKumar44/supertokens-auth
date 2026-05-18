const Session = require("supertokens-node/recipe/session");

/**
 * GET /api/jwt/info
 * Returns the decoded JWT payload from the current session.
 * This shows all the claims embedded in the access token.
 *
 * The access token IS a JWT — SuperTokens creates it automatically.
 * We added custom claims (email, role) in supertokens.js config.
 */
async function getJwtInfo(req, res) {
  try {
    const session = req.session;
    const userId = session.getUserId();
    const accessTokenPayload = session.getAccessTokenPayload();

    res.json({
      status: "ok",
      jwt: {
        // Standard JWT claims
        sub: userId, // Subject (user ID)
        iss: accessTokenPayload.iss || "SuperTokens Auth App", // Issuer
        iat: accessTokenPayload.iat, // Issued At (Unix timestamp)
        exp: accessTokenPayload.exp, // Expires At (Unix timestamp)

        // Custom claims we added
        email: accessTokenPayload.email || null,
        role: accessTokenPayload.role || "user",

        // SuperTokens internal claims
        sessionHandle: session.getHandle(),
        antiCsrfToken: accessTokenPayload.antiCsrfToken || null,

        // Full raw payload (everything in the JWT)
        _rawPayload: accessTokenPayload,
      },
    });
  } catch (err) {
    console.error("Error reading JWT info:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to read JWT information",
    });
  }
}

/**
 * GET /api/jwt/verify
 * A public-style endpoint that other microservices can use to understand
 * how to verify tokens. Returns the JWKS (JSON Web Key Set) URL.
 *
 * External services can fetch the public keys from this URL
 * and verify JWTs without calling our backend.
 */
async function getJwksInfo(req, res) {
  const coreDomain =
    process.env.SUPERTOKENS_CONNECTION_URI || "http://localhost:3567";
  const apiDomain = process.env.API_DOMAIN || "http://localhost:5000";

  res.json({
    status: "ok",
    info: {
      description:
        "Use the JWKS URL to get public keys for verifying JWT signatures.",
      jwksUrl: `${coreDomain}/.well-known/jwks.json`,
      issuer: process.env.APP_NAME || "SuperTokens Auth App",
      algorithm: "RS256",
      howToVerify: {
        step1: "Fetch the public key from the JWKS URL above",
        step2: "Use any JWT library (jsonwebtoken, jose, etc.) to verify",
        step3: "Check the 'sub' claim for the user ID",
        step4: "Check custom claims like 'email' and 'role'",
      },
      exampleWithNodeJs: `
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({ jwksUri: '${apiDomain}/.well-known/jwks.json' });
// Then verify the token using the fetched public key
      `.trim(),
    },
  });
}

module.exports = { getJwtInfo, getJwksInfo };
