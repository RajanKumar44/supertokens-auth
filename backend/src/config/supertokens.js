const supertokens = require("supertokens-node");
const Session = require("supertokens-node/recipe/session");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
const EmailVerification = require("supertokens-node/recipe/emailverification");
const Dashboard = require("supertokens-node/recipe/dashboard");
const { SMTPService: EmailVerificationSMTPService } = require("supertokens-node/recipe/emailverification/emaildelivery");
const { SMTPService: EmailPasswordSMTPService } = require("supertokens-node/recipe/emailpassword/emaildelivery");

/**
 * Initialize SuperTokens with EmailPassword + EmailVerification recipes.
 *
 * Password Hashing:
 *   SuperTokens uses BCrypt by default with automatic salting.
 *   Passwords are NEVER stored in plaintext.
 *
 * Email Verification:
 *   After signup, the user receives a REAL verification email via SMTP.
 *   The "REQUIRED" mode blocks access until the email is verified.
 *
 * SMTP Configuration:
 *   Uses Gmail SMTP (or any SMTP provider) to send real emails.
 *   Credentials are read from environment variables.
 */

// ─── SMTP Settings (shared by EmailVerification & EmailPassword) ───
function getSmtpSettings() {
  return {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    authUsername: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: {
      name: process.env.APP_NAME || "SuperTokens Auth App",
      email: process.env.SMTP_USER,
    },
  };
}

function initSuperTokens() {
  const smtpSettings = getSmtpSettings();
  const hasSmtp = smtpSettings.authUsername && smtpSettings.password;

  if (hasSmtp) {
    console.log(`📧 SMTP configured — real emails will be sent via ${smtpSettings.host}`);
  } else {
    console.log("⚠️  SMTP not configured — verification emails will be logged to console only");
  }

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
        // If SMTP is configured, use it for password reset emails too
        ...(hasSmtp && {
          emailDelivery: {
            service: new EmailPasswordSMTPService({
              smtpSettings,
            }),
            override: (originalImplementation) => {
              return {
                ...originalImplementation,
                sendEmail: async function (input) {
                  if (input.type === "PASSWORD_RESET") {
                    // Replace the default SuperTokens reset URL with our custom page
                    const websiteDomain = process.env.WEBSITE_DOMAIN || "http://localhost:3001";
                    input.passwordResetLink = input.passwordResetLink.replace(
                      /http[s]?:\/\/[^/]*\/auth\/reset-password/,
                      `${websiteDomain}/reset-password`
                    );
                    console.log(`🔑 Password reset email sent to: ${input.user.email}`);
                  }
                  return originalImplementation.sendEmail(input);
                },
              };
            },
          },
        }),
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
      // Uses SMTP to send real verification emails to the user's inbox.
      EmailVerification.init({
        mode: "REQUIRED",
        ...(hasSmtp && {
          emailDelivery: {
            service: new EmailVerificationSMTPService({
              smtpSettings,
            }),
          },
        }),
      }),

      Session.init({
        cookieDomain: undefined,
        cookieSecure: false,
        // Expose the access token (JWT) to the frontend via response headers
        // This allows other microservices to verify the token
        exposeAccessTokenToFrontendInCookieBasedAuth: true,
        override: {
          functions: (originalImplementation) => {
            return {
              ...originalImplementation,
              // Add custom claims to every new JWT session
              createNewSession: async function (input) {
                // Attach user's email to the JWT payload
                // This way, any microservice that reads the JWT
                // can know the user's email without calling the database
                let userInfo = await supertokens.getUser(input.userId);
                if (userInfo) {
                  input.accessTokenPayload = {
                    ...input.accessTokenPayload,
                    email: userInfo.emails[0],
                    role: "user", // Default role
                    iss: process.env.APP_NAME || "SuperTokens Auth App",
                  };
                }
                return originalImplementation.createNewSession(input);
              },
            };
          },
        },
      }),

      Dashboard.init(),
    ],
  });
}

module.exports = { initSuperTokens };
