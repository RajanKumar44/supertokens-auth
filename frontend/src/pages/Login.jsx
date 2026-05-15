import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import AuthForm from "../components/AuthForm";
import "../styles/auth.css";

function Login() {
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
            <path d="M16 24C16 19.58 19.58 16 24 16C28.42 16 32 19.58 32 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="24" r="2" fill="#fff"/>
            <path d="M24 26V33" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="auth-title">Sign in to SecureAuth</h1>
        <p className="auth-subtitle">Enter your email and password to continue</p>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}

export default Login;
