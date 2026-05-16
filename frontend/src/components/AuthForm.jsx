import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn, signUp } from "supertokens-auth-react/recipe/emailpassword";

/**
 * Reusable authentication form component.
 * Supports both "login" and "signup" modes.
 */
function AuthForm({ mode = "login" }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      let response;

      if (isLogin) {
        response = await signIn({
          formFields: [
            { id: "email", value: email },
            { id: "password", value: password },
          ],
        });
      } else {
        response = await signUp({
          formFields: [
            { id: "email", value: email },
            { id: "password", value: password },
          ],
        });
      }

      if (response.status === "FIELD_ERROR") {
        const fieldErrors = response.formFields
          .map((f) => f.error)
          .join(". ");
        setError(fieldErrors);
      } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
        setError("Invalid email or password.");
      } else if (response.status === "SIGN_UP_NOT_ALLOWED") {
        setError("Sign up is not allowed. Please contact support.");
      } else if (response.status === "OK") {
        if (isLogin) {
          // Check if email is verified before going to dashboard
          const { isEmailVerified } = await import("supertokens-auth-react/recipe/emailverification");
          const verificationResponse = await isEmailVerified();
          if (verificationResponse.isVerified) {
            navigate("/dashboard", { replace: true });
          } else {
            // Email not verified — send them to verify
            window.location.href = "/auth/verify-email";
          }
        } else {
          // After signup, always go to email verification page
          // SuperTokens will automatically send the verification email
          window.location.href = "/auth/verify-email";
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Error message */}
      {error && (
        <div className="form-error" role="alert" id="auth-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="form-success" role="status" id="auth-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="auth-form" id="auth-form">
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email-input" className="form-label">Email</label>
          <div className="input-wrapper">
            <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="form-input"
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password-input" className="form-label">Password</label>
          <div className="input-wrapper">
            <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="form-input"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {!isLogin && (
            <p className="form-hint">Min 8 characters. Stored as BCrypt hash.</p>
          )}
          {isLogin && (
            <div className="forgot-password-wrapper">
              <Link to="/forgot-password" className="forgot-password-link" id="forgot-password-link">
                Forgot password?
              </Link>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" className="submit-btn" disabled={isSubmitting} id="auth-submit">
          {isSubmitting ? (
            <span className="btn-loading">
              <div className="spinner-small"></div>
              {isLogin ? "Signing in..." : "Creating account..."}
            </span>
          ) : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      {/* Footer */}
      <div className="form-footer">
        <p>
          {isLogin ? "No account?" : "Have an account?"}{" "}
          <Link to={isLogin ? "/signup" : "/login"} className="form-link" id={isLogin ? "signup-link" : "login-link"}>
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </>
  );
}

export default AuthForm;
