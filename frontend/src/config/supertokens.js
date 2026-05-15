import SuperTokens from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import EmailVerification from "supertokens-auth-react/recipe/emailverification";
import Session from "supertokens-auth-react/recipe/session";

/**
 * Frontend SuperTokens configuration.
 * Includes EmailVerification — after signup, users must verify their email.
 */
export function initSuperTokens() {
  SuperTokens.init({
    appInfo: {
      appName: "SuperTokens Auth App",
      apiDomain: "http://localhost:5000",
      websiteDomain: "http://localhost:3001",
      apiBasePath: "/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      EmailPassword.init(),
      EmailVerification.init({
        mode: "REQUIRED",
      }),
      Session.init(),
    ],
  });
}
