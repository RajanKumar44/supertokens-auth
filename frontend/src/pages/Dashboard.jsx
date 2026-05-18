import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Session from "supertokens-auth-react/recipe/session";
import { signOut } from "supertokens-auth-react/recipe/session";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jwtInfo, setJwtInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      // Fetch user info from backend
      const userRes = await fetch("http://localhost:5000/auth/user", {
        credentials: "include",
      });
      const userData = await userRes.json();

      if (userData.status === "ok") {
        setUser(userData.user);
      }

      // Fetch user profile
      const profileRes = await fetch("http://localhost:5000/api/users/me", {
        credentials: "include",
      });
      const profileData = await profileRes.json();

      if (profileData.status === "ok") {
        setProfile(profileData.profile);
      }

      // Fetch JWT info
      const jwtRes = await fetch("http://localhost:5000/api/jwt/info", {
        credentials: "include",
      });
      const jwtData = await jwtRes.json();

      if (jwtData.status === "ok") {
        setJwtInfo(jwtData.jwt);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  }

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="header-logo">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="url(#dashGrad)" />
              <path d="M16 24C16 19.5817 19.5817 16 24 16C28.4183 16 32 19.5817 32 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="24" cy="24" r="2" fill="white" />
              <path d="M24 26V33" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="dashGrad" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="header-title">SecureAuth</h2>
        </div>
        <button className="logout-btn" onClick={handleLogout} disabled={loggingOut} id="logout-button">
          {loggingOut ? (
            <span className="btn-loading">Logging out...</span>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome back{profile?.displayName ? `, ${profile.displayName}` : ""}! 👋
          </h1>
          <p className="welcome-subtitle">
            You are securely authenticated. Your session is managed by SuperTokens with JWT access tokens.
          </p>
        </div>

        <div className="dashboard-grid">
          {/* User Info Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>User Information</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email || "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">User ID</span>
                <span className="info-value info-mono">{user?.id?.substring(0, 16) || "—"}...</span>
              </div>
              <div className="info-row">
                <span className="info-label">Joined</span>
                <span className="info-value">
                  {user?.timeJoined ? new Date(user.timeJoined).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-icon card-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Security Status</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="info-label">Auth Method</span>
                <span className="info-value"><span className="badge badge-blue">Email & Password</span></span>
              </div>
              <div className="info-row">
                <span className="info-label">Password</span>
                <span className="info-value"><span className="badge badge-green">BCrypt Hashed</span></span>
              </div>
              <div className="info-row">
                <span className="info-label">Session</span>
                <span className="info-value"><span className="badge badge-green">Active</span></span>
              </div>
              <div className="info-row">
                <span className="info-label">Token Type</span>
                <span className="info-value"><span className="badge badge-blue">JWT (RS256)</span></span>
              </div>
            </div>
          </div>

          {/* JWT Token Card */}
          {jwtInfo && (
            <div className="dashboard-card dashboard-card-full">
              <div className="card-header">
                <div className="card-icon card-icon-amber">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3>JWT Access Token (Decoded)</h3>
              </div>
              <div className="card-body">
                <div className="jwt-section">
                  <h4 className="jwt-section-title">Standard Claims</h4>
                  <div className="info-row">
                    <span className="info-label">sub (User ID)</span>
                    <span className="info-value info-mono">{jwtInfo.sub}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">iss (Issuer)</span>
                    <span className="info-value">{jwtInfo.iss}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">iat (Issued At)</span>
                    <span className="info-value">{jwtInfo.iat ? new Date(jwtInfo.iat * 1000).toLocaleString() : "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">exp (Expires)</span>
                    <span className="info-value">{jwtInfo.exp ? new Date(jwtInfo.exp * 1000).toLocaleString() : "—"}</span>
                  </div>
                </div>
                <div className="jwt-section">
                  <h4 className="jwt-section-title">Custom Claims</h4>
                  <div className="info-row">
                    <span className="info-label">email</span>
                    <span className="info-value">{jwtInfo.email || "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">role</span>
                    <span className="info-value"><span className="badge badge-purple">{jwtInfo.role}</span></span>
                  </div>
                </div>
                <div className="jwt-section">
                  <h4 className="jwt-section-title">Session Info</h4>
                  <div className="info-row">
                    <span className="info-label">Session Handle</span>
                    <span className="info-value info-mono">{jwtInfo.sessionHandle?.substring(0, 20) || "—"}...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tech Stack Card */}
          <div className="dashboard-card dashboard-card-full">
            <div className="card-header">
              <div className="card-icon card-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <h3>Technology Stack</h3>
            </div>
            <div className="card-body">
              <div className="tech-stack">
                <div className="tech-item">
                  <span className="tech-emoji">⚛️</span>
                  <span className="tech-name">React</span>
                  <span className="tech-desc">Frontend</span>
                </div>
                <div className="tech-item">
                  <span className="tech-emoji">🟢</span>
                  <span className="tech-name">Express.js</span>
                  <span className="tech-desc">Backend API</span>
                </div>
                <div className="tech-item">
                  <span className="tech-emoji">🔐</span>
                  <span className="tech-name">SuperTokens</span>
                  <span className="tech-desc">Auth Core</span>
                </div>
                <div className="tech-item">
                  <span className="tech-emoji">🐘</span>
                  <span className="tech-name">PostgreSQL</span>
                  <span className="tech-desc">Database</span>
                </div>
                <div className="tech-item">
                  <span className="tech-emoji">🐳</span>
                  <span className="tech-name">Docker</span>
                  <span className="tech-desc">Containers</span>
                </div>
                <div className="tech-item">
                  <span className="tech-emoji">🔑</span>
                  <span className="tech-name">JWT</span>
                  <span className="tech-desc">Access Token</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
