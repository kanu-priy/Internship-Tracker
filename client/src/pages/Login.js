/* global chrome */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .login-root {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    position: relative;
  }

  .login-bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
  .orb1 { width: 500px; height: 500px; background: rgba(245,158,11,0.15); top: -100px; left: -100px; }
  .orb2 { width: 400px; height: 400px; background: rgba(139,92,246,0.12); bottom: -80px; right: -80px; }
  .orb3 { width: 300px; height: 300px; background: rgba(16,185,129,0.08); top: 50%; left: 50%; transform: translate(-50%,-50%); }

  .login-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .login-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 440px;
    margin: 20px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 48px 44px;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px rgba(0,0,0,0.5);
    animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .login-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 36px;
  }

  .login-logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 8px 24px rgba(245,158,11,0.4);
  }

  .login-logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: #fff;
    letter-spacing: -0.5px;
  }

  .login-logo-text span {
    color: #f59e0b;
  }

  .login-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 28px;
    color: #fff;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
  }

  .login-subtitle {
    font-size: 14px;
    color: rgba(255,255,255,0.4);
    margin-bottom: 32px;
  }

  .login-error {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5;
    font-size: 13px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .input-group {
    margin-bottom: 16px;
    position: relative;
  }

  .input-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .login-input {
    width: 100%;
    padding: 14px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .login-input::placeholder { color: rgba(255,255,255,0.2); }

  .login-input:focus {
    border-color: rgba(245,158,11,0.5);
    background: rgba(245,158,11,0.05);
    box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
  }

  .login-btn {
    width: 100%;
    padding: 15px;
    margin-top: 8px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border: none;
    border-radius: 12px;
    color: #000;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 8px 24px rgba(245,158,11,0.35);
    position: relative;
    overflow: hidden;
  }

  .login-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 32px rgba(245,158,11,0.5);
  }

  .login-btn:active:not(:disabled) { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 14px;
    color: rgba(255,255,255,0.35);
  }

  .login-footer a {
    color: #f59e0b;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  .login-footer a:hover { color: #fbbf24; }
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
        <div className="login-bg-orb orb1" />
        <div className="login-bg-orb orb2" />
        <div className="login-bg-orb orb3" />
        <div className="login-grid" />

        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">📋</div>
            <div className="login-logo-text">Deadline<span>Desk</span></div>
          </div>

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
              {loading ? "Signing in..." : "Sign In →"}
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