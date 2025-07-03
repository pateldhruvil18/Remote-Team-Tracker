import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "team_member",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [managerExists, setManagerExists] = useState(false);
  const [managerInfo, setManagerInfo] = useState(null);

  const { login, register } = useAuth();

  // Check if manager exists when component mounts
  useEffect(() => {
    const checkManagerExists = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/check-manager`
        );
        const data = await response.json();

        if (data.success) {
          setManagerExists(data.data.managerExists);
          setManagerInfo(data.data.manager);
        }
      } catch (error) {
        console.error("Error checking manager existence:", error);
      }
    };

    checkManagerExists();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        // Redirect to dashboard after successful login/registration
        window.location.hash = "dashboard";
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (mode) => {
    setIsLogin(mode);
    setError("");
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "team_member",
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="back-to-home">
              <button
                type="button"
                className="back-btn"
                onClick={() => window.location.hash = "landing"}
              >
                ← Back to Home
              </button>
            </div>
            <div className="logo-section">
              <div className="logo-icon">🚀</div>
              <h1>Team Tracker</h1>
              <p>Track your team's productivity, achieve your goals</p>
            </div>
          </div>

          <div className="auth-content">
            <div className="auth-tabs">
              <button
                type="button"
                className={`tab-btn ${isLogin ? "active" : ""}`}
                onClick={() => toggleMode(true)}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`tab-btn ${!isLogin ? "active" : ""}`}
                onClick={() => toggleMode(false)}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="signup-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">
                        <span className="label-icon">👤</span>
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required={!isLogin}
                        placeholder="John"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">
                        <span className="label-icon">👤</span>
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required={!isLogin}
                        placeholder="Doe"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">
                      <span className="label-icon">🎯</span>
                      Role
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="team_member">Team Member</option>
                        <option value="manager" disabled={managerExists}>
                          Manager {managerExists ? "(Already exists)" : ""}
                        </option>
                      </select>
                    </div>
                    {managerExists && (
                      <div className="manager-exists-notice">
                        <span className="notice-icon">ℹ️</span>
                        Manager already exists:{" "}
                        <strong>{managerInfo?.name}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="form-group">
                  <label htmlFor="loginRole">
                    <span className="label-icon">🎯</span>
                    Sign in as
                  </label>
                  <div className="select-wrapper">
                    <select
                      id="loginRole"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="team_member">Team Member</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  minLength={6}
                  className="form-input"
                />
                {!isLogin && (
                  <div className="password-hint">
                    <span className="hint-icon">💡</span>
                    Password must be at least 6 characters with uppercase,
                    lowercase, and number
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`submit-btn ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Please wait...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">{isLogin ? "🚀" : "✨"}</span>
                    {isLogin ? "Sign In" : "Create Account"}
                  </>
                )}
              </button>

              {isLogin && (
                <div className="demo-section">
                  <div className="demo-divider">
                    <span>or try demo</span>
                  </div>

                  {/* Team Member Demo */}
                  <div className="demo-info">
                    <div className="demo-header">
                      <span className="demo-icon">👤</span>
                      <strong>Team Member Demo</strong>
                    </div>
                    <div className="demo-credentials">
                      <div className="demo-item">
                        <span className="demo-label">Email:</span>
                        <span className="demo-value">demo@example.com</span>
                      </div>
                      <div className="demo-item">
                        <span className="demo-label">Password:</span>
                        <span className="demo-value">Password123</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="demo-btn"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          email: "demo@example.com",
                          password: "Password123",
                          role: "team_member",
                        });
                      }}
                    >
                      <span className="btn-icon">⚡</span>
                      Fill Team Member Demo
                    </button>
                  </div>

                  {/* Manager Demo */}
                  <div className="demo-info manager-demo">
                    <div className="demo-header">
                      <span className="demo-icon">👑</span>
                      <strong>Manager Account</strong>
                    </div>
                    <div className="demo-credentials">
                      <div className="demo-item">
                        <span className="demo-label">Email:</span>
                        <span className="demo-value">
                          dhchaudhary973@gmail.com
                        </span>
                      </div>
                      <div className="demo-item">
                        <span className="demo-label">Password:</span>
                        <span className="demo-value">dhp@973</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="demo-btn manager-btn"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          email: "dhchaudhary973@gmail.com",
                          password: "dhp@973",
                          role: "manager",
                        });
                      }}
                    >
                      <span className="btn-icon">👑</span>
                      Fill Manager Credentials
                    </button>
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="signup-benefits">
                  <h4>🌟 What you'll get:</h4>
                  <ul className="benefits-list">
                    <li>
                      <span className="benefit-icon">📊</span> Real-time
                      productivity analytics
                    </li>
                    <li>
                      <span className="benefit-icon">⏰</span> Advanced time
                      tracking
                    </li>
                    <li>
                      <span className="benefit-icon">📋</span> Task management
                      system
                    </li>
                    <li>
                      <span className="benefit-icon">📸</span> Automated
                      screenshot monitoring
                    </li>
                  </ul>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
