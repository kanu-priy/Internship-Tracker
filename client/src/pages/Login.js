/* global chrome */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  .login-root {
    min-height: 100vh;
    background: #f5f3ef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', -apple-system, sans-serif;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    margin: 20px;
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(107, 39, 55, 0.04);
  }

  .login-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 28px;
    text-decoration: none;
  }

  .login-logo-icon {
    width: 36px;
    height: 36px;
    background: #6b2737;
    border-radius: 10px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(107, 39, 55, 0.25);
  }

  .login-logo-text {
    font-weight: 800;
    font-size: 24px;
    color: #2a2a2a;
    letter-spacing: -0.5px;
  }

  .login-logo-text span {
    color: #6b2737;
  }

  .login-title {
    font-weight: 800;
    font-size: 22px;
    color: #2a2a2a;
    margin-bottom: 4px;
    text-align: center;
    letter-spacing: -0.3px;
  }

  .login-subtitle {
    font-size: 13px;
    color: #8a857e;
    margin-bottom: 28px;
    text-align: center;
  }

  .login-error {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    color: #991b1b;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .input-group {
    margin-bottom: 16px;
  }

  .input-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #8a857e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  .login-input {
    width: 100%;
    padding: 11px 14px;
    background: #faf8f5;
    border: 1px solid #e4e0d9;
    border-radius: 10px;
    color: #2a2a2a;
    font-size: 13px;
    font-family: 'Outfit', -apple-system, sans-serif;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .login-input::placeholder { color: #b0aaa2; }
  .login-input:focus {
    border-color: #6b2737;
    background: #ffffff;
  }

  .login-btn {
    width: 100%;
    padding: 12px;
    margin-top: 10px;
    background: #6b2737;
    border: none;
    border-radius: 20px;
    color: #fff;
    font-family: 'Outfit', -apple-system, sans-serif;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    box-shadow: 0 4px 14px rgba(107, 39, 55, 0.25);
  }
  .login-btn:hover:not(:disabled) { background: #541e2b; transform: translateY(-1px); }
  .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .login-footer {
    text-align: center;
    margin-top: 24px;
    color: #8a857e;
    font-size: 13px;
  }

  .login-footer a {
    color: #6b2737;
    text-decoration: none;
    font-weight: 700;
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