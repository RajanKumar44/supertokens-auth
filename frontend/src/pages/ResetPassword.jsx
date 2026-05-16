import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { submitNewPassword } from "supertokens-auth-react/recipe/emailpassword";
import "../styles/auth.css";

/**
 * Reset Password page — user lands here from the email link.
 * Reads the reset token from the URL and lets the user set a new password.
 */
function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If there's no token in the URL, show an error
  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Invalid Reset Link</h1>
          <p className="auth-subtitle">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <div className="form-footer">
            <p>
              <Link to="/forgot-password" className="form-link">
                Request a new link
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitNewPassword({
        formFields: [{ id: "password", value: password }],
      });

      if (response.status === "FIELD_ERROR") {
        const fieldErrors = response.formFields
          .map((f) => f.error)
          .join(". ");
        setError(fieldErrors);
      } else if (response.status === "RESET_PASSWORD_INVALID_TOKEN_ERROR") {
        setError("This reset link has expired. Please request a new one.");
      } else if (response.status === "OK") {
        setSuccess(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#38bdf8" />
            <path d="M16 24C16 19.58 19.58 16 24 16C28.42 16 32 19.58 32 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="24" r="2" fill="#fff"/>
            <path d="M24 26V33" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">
          Enter your new password below. It will be securely hashed with BCrypt.
        </p>

        {success ? (
          <>
            <div className="form-success" role="status" id="password-reset-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Your password has been reset successfully!</span>
            </div>
            <div className="form-footer" style={{ marginTop: "16px" }}>
              <p>
                <Link to="/login" className="form-link" id="go-to-login">
                  ← Go to Sign in
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            {error && (
              <div className="form-error" role="alert" id="reset-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" id="reset-password-form">
              {/* New Password */}
              <div className="form-group">
                <label htmlFor="password-input" className="form-label">New Password</label>
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
                    autoComplete="new-password"
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
                <p className="form-hint">Min 8 characters. Stored as BCrypt hash.</p>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirm-password-input" className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="confirm-password-input"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="form-input"
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting} id="set-password-submit">
                {isSubmitting ? (
                  <span className="btn-loading">
                    <div className="spinner-small"></div>
                    Resetting password...
                  </span>
                ) : "Set new password"}
              </button>
            </form>

            <div className="form-footer">
              <p>
                <Link to="/login" className="form-link" id="back-to-login-link">
                  ← Back to Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
