import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import { isEmailVerified } from "supertokens-auth-react/recipe/emailverification";

/**
 * ProtectedRoute wrapper — checks for an active SuperTokens session
 * AND verified email. Redirects to /login if not authenticated,
 * or to /auth/verify-email if email is not verified.
 */
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const exists = await Session.doesSessionExist();
        if (!exists) {
          navigate("/login", { replace: true });
          return;
        }

        // Session exists — now check if email is verified
        const verificationResponse = await isEmailVerified();
        if (!verificationResponse.isVerified) {
          // Email not verified — redirect to verification page
          window.location.href = "/auth/verify-email";
          return;
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error("Session check failed:", err);
        navigate("/login", { replace: true });
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#94a3b8",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
          <p>Verifying session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}

export default ProtectedRoute;

