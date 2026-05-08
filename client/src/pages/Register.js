import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .reg-root {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    position: relative;
  }

  .reg-bg-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
  .orb1 { width: 500px; height: 500px; background: rgba(139,92,246,0.15); top: -100px; right: -100px; }
  .orb2 { width: 400px; height: 400px; background: rgba(245,158,11,0.1); bottom: -80px; left: -80px; }

  .reg-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .reg-card {
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

  .reg-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 36px;
  }

  .reg-logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 8px 24px rgba(139,92,246,0.4);
  }

  .reg-logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: #fff;
    letter-spacing: -0.5px;
  }

  .reg-logo-text span { color: #8b5cf6; }

  .reg-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 28px;
    color: #fff;
    margin-bottom: 6px;
    letter-spacing: -0.5px;
  }

  .reg-subtitle {
    font-size: 14px;
    color: rgba(255,255,255,0.4);
    margin-bottom: 32px;
  }

  .reg-error {
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

  .reg-input {
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

  .reg-input::placeholder { color: rgba(255,255,255,0.2); }

  .reg-input:focus {
    border-color: rgba(139,92,246,0.5);
    background: rgba(139,92,246,0.05);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
  }

  .reg-btn {
    width: 100%;
    padding: 15px;
    margin-top: 8px;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.3px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 8px 24px rgba(139,92,246,0.35);
  }

  .reg-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 32px rgba(139,92,246,0.5);
  }
  .reg-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .reg-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 14px;
    color: rgba(255,255,255,0.35);
  }

  .reg-footer a {
    color: #8b5cf6;
    text-decoration: none;
    font-weight: 500;
  }
  .reg-footer a:hover { color: #a78bfa; }
`;

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) { setError("All fields are required."); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed."); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="reg-root">
        <div className="reg-bg-orb orb1" />
        <div className="reg-bg-orb orb2" />
        <div className="reg-grid" />

        <div className="reg-card">
          <div className="reg-logo">
            <div className="reg-logo-icon">📋</div>
            <div className="reg-logo-text">Deadline<span>Desk</span></div>
          </div>

          <h1 className="reg-title">Create account</h1>
          <p className="reg-subtitle">Start tracking your internship applications</p>

          {error && <div className="reg-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input type="text" placeholder="Your name" className="reg-input"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" placeholder="you@example.com" className="reg-input"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" placeholder="••••••••" className="reg-input"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button disabled={loading} type="submit" className="reg-btn">
              {loading ? "Creating account..." : "Get Started →"}
            </button>
          </form>

          <p className="reg-footer">
            Already have an account?{" "}
            <Link to="/">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}