import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import AuthForm from "../components/AuthForm";
import "../styles/auth.css";

function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const exists = await Session.doesSessionExist();
      if (exists) {
        navigate("/dashboard", { replace: true });
      }
      setIsLoading(false);
    }
    checkSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#38bdf8" />
            <path d="M24 14V18M24 30V34M16 24H12M36 24H32" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="24" r="4" stroke="#fff" strokeWidth="2.5"/>
          </svg>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">A verification email will be sent to confirm your address</p>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}

export default Signup;
