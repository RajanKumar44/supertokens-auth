const supertokens = require("supertokens-node");
const Session = require("supertokens-node/recipe/session");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
const EmailVerification = require("supertokens-node/recipe/emailverification");
const Dashboard = require("supertokens-node/recipe/dashboard");

/**
 * Initialize SuperTokens with EmailPassword + EmailVerification recipes.
 *
 * Password Hashing:
 *   SuperTokens uses BCrypt by default with automatic salting.
 *   Passwords are NEVER stored in plaintext.
 *
 * Email Verification:
 *   After signup, the user receives a verification email.
 *   The "REQUIRED" mode blocks access until the email is verified.
 */
function initSuperTokens() {
  supertokens.init({
    framework: "express",
    supertokens: {
      connectionURI:
        process.env.SUPERTOKENS_CONNECTION_URI || "http://localhost:3567",
      apiKey: process.env.SUPERTOKENS_API_KEY || undefined,
    },
    appInfo: {
      appName: process.env.APP_NAME || "SuperTokens Auth App",
      apiDomain: process.env.API_DOMAIN || "http://localhost:5000",
      websiteDomain: process.env.WEBSITE_DOMAIN || "http://localhost:3001",
      apiBasePath: "/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      EmailPassword.init({
        override: {
          apis: (originalImplementation) => {
            return {
              ...originalImplementation,

              signUpPOST: async function (input) {
                if (originalImplementation.signUpPOST === undefined) {
                  throw Error("Should never come here");
                }
                const response =
                  await originalImplementation.signUpPOST(input);

                if (response.status === "OK") {
                  const { id, emails } = response.user;
                  console.log(
                    `✅ New user signed up: ${emails[0]} (ID: ${id})`
                  );
                  console.log(
                    `📧 Verification email sent to: ${emails[0]}`
                  );
                }
                return response;
              },

              signInPOST: async function (input) {
                if (originalImplementation.signInPOST === undefined) {
                  throw Error("Should never come here");
                }
                const response =
                  await originalImplementation.signInPOST(input);

                if (response.status === "OK") {
                  const { id, emails } = response.user;
                  console.log(`🔓 User signed in: ${emails[0]} (ID: ${id})`);
                }
                return response;
              },
            };
          },
        },
      }),

      // Email Verification — users must verify their email after signup.
      // Mode "REQUIRED" = user cannot access protected routes until verified.
      // Mode "OPTIONAL" = user can access routes but you can check verification status.
      EmailVerification.init({
        mode: "REQUIRED",
      }),

      Session.init({
        cookieDomain: undefined,
        cookieSecure: false,
      }),

      Dashboard.init(),
    ],
  });
}

module.exports = { initSuperTokens };
