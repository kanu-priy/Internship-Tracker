/* global chrome */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .login-root {
    min-height: 100vh;
    background: #fafbfc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    margin: 20px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  }

  .login-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 32px;
    text-decoration: none;
  }

  .login-logo-icon {
    width: 32px;
    height: 32px;
    color: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-logo-text {
    font-weight: 700;
    font-size: 24px;
    color: #111827;
    letter-spacing: -0.5px;
  }

  .login-logo-text span {
    color: #0f172a;
  }

  .login-title {
    font-weight: 600;
    font-size: 20px;
    color: #111827;
    margin-bottom: 8px;
    text-align: center;
  }

  .login-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 32px;
    text-align: center;
  }

  .login-error {
    background: #fce8e6;
    border: 1px solid #b54d42;
    color: #b54d42;
    font-size: 14px;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 20px;
  }

  .input-group {
    margin-bottom: 16px;
  }

  .input-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #4b5563;
    margin-bottom: 6px;
  }

  .login-input {
    width: 100%;
    padding: 12px 14px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    color: #111827;
    font-size: 14px;
    font-family: 'Inter', -apple-system, sans-serif;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .login-input::placeholder { color: #9e9890; }

  .login-input:focus {
    border-color: #0f172a;
    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
  }

  .login-btn {
    width: 100%;
    padding: 12px;
    margin-top: 8px;
    background: #0f172a;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

    background: #1e293b;
  }

  .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .login-footer {
    text-align: center;
    margin-top: 24px;
    color: #4b5563;
  }

  .login-footer a {
    color: #0f172a;
    text-decoration: none;
    font-weight: 500;
  }
  .login-footer a:hover { text-decoration: underline; }
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter email and password"); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Invalid credentials"); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (window.chrome?.storage) { chrome.storage.local.set({ token: data.token }); }
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="login-card">
          <Link to="/" className="login-logo">
            <div className="login-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '100%', height: '100%'}}>
                <path d="M8 2h8l4 10H4L8 2Z"/>
                <path d="M12 12v6"/>
                <path d="M8 22v-2c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2H8Z"/>
              </svg>
            </div>
            <div className="login-logo-text">Deadline<span>Desk</span></div>
          </Link>

          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to track your internship journey</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className="login-input" />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="login-input" />
            </div>
            <button disabled={loading} className="login-btn" type="submit">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}