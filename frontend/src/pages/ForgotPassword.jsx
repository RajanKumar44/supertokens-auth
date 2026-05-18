import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "supertokens-auth-react/recipe/emailpassword";
import "../styles/auth.css";

/**
 * Forgot Password page — user enters their email to receive a password reset link.
 */
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await sendPasswordResetEmail({
        formFields: [{ id: "email", value: email }],
      });

      if (response.status === "FIELD_ERROR") {
        const fieldErrors = response.formFields
          .map((f) => f.error)
          .join(". ");
        setError(fieldErrors);
      } else if (response.status === "OK") {
        // Always show success even if email doesn't exist (prevent email enumeration)
        setSuccess(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      if (err?.status === 429 || err?.message?.includes("429")) {
        setError("⏳ Too many attempts! You have exceeded the limit of 5 password reset requests. Please wait 15 minutes before trying again.");
      } else {
        setError("Network error. Please check your connection.");
      }
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
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {success ? (
          <>
            <div className="form-success" role="status" id="reset-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>If an account exists with that email, a password reset link has been sent. Check your inbox.</span>
            </div>
            <div className="form-footer">
              <p>
                <Link to="/login" className="form-link" id="back-to-login">
                  ← Back to Sign in
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

            <form onSubmit={handleSubmit} className="auth-form" id="forgot-password-form">
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

              <button type="submit" className="submit-btn" disabled={isSubmitting} id="reset-submit">
                {isSubmitting ? (
                  <span className="btn-loading">
                    <div className="spinner-small"></div>
                    Sending reset link...
                  </span>
                ) : "Send reset link"}
              </button>
            </form>

            <div className="form-footer">
              <p>
                Remember your password?{" "}
                <Link to="/login" className="form-link" id="back-to-login-link">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
