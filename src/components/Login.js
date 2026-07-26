"use client";
import React, { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-glass-card">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-accent">Tally</span>Prime
          </div>
          <p className="login-subtitle">GST Invoice Billing Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error-alert">{error}</div>}

          <div className="login-input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. prem or sridevi"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="login-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              "Login to Dashboard"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo Accounts:</p>
          <div className="demo-accounts-grid">
            <div className="demo-badge">
              <span>Username:</span> <code>prem</code>
            </div>
            <div className="demo-badge">
              <span>Username:</span> <code>sridevi</code>
            </div>
            <div className="demo-badge" style={{ gridColumn: "span 2", textAlign: "center" }}>
              <span>Password:</span> <code>password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
