import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";

/**
 * ProtectedRoute wrapper — checks for an active SuperTokens session.
 * Redirects to /login if not authenticated.
 */
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const exists = await Session.doesSessionExist();
        if (exists) {
          setIsAuthenticated(true);
        } else {
          navigate("/login", { replace: true });
        }
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
