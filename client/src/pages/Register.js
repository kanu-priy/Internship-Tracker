import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .reg-root {
    min-height: 100vh;
    background: #fafbfc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  .reg-card {
    width: 100%;
    max-width: 400px;
    margin: 20px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  }

  .reg-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 32px;
    text-decoration: none;
  }

  .reg-logo-icon {
    width: 32px;
    height: 32px;
    color: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .reg-logo-text {
    font-weight: 700;
    font-size: 24px;
    color: #111827;
    letter-spacing: -0.5px;
  }

  .reg-logo-text span { color: #0f172a; }

  .reg-title {
    font-weight: 600;
    font-size: 20px;
    color: #111827;
    margin-bottom: 8px;
    text-align: center;
  }

  .reg-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 32px;
    text-align: center;
  }

  .reg-error {
    background: #fce8e6;
    border: 1px solid #b54d42;
    color: #b54d42;
    font-size: 14px;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .input-group {
    margin-bottom: 16px;
  }

  .input-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
    margin-bottom: 6px;
  }

  .reg-input {
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

  .reg-input::placeholder { color: #9e9890; }

  .reg-input:focus {
    border-color: #0f172a;
    box-shadow: 0 0 0 3px rgba(59, 111, 181, 0.1);
  }

  .reg-btn {
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

  .reg-btn:hover:not(:disabled) {
    background: #1e293b;
  }
  .reg-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .reg-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 14px;
    color: #6b7280;
  }

  .reg-footer a {
    color: #0f172a;
    text-decoration: none;
    font-weight: 500;
  }
  .reg-footer a:hover { text-decoration: underline; }
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
        <div className="reg-card">
          <Link to="/" className="reg-logo">
            <div className="reg-logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '100%', height: '100%'}}>
                <path d="M8 2h8l4 10H4L8 2Z"/>
                <path d="M12 12v6"/>
                <path d="M8 22v-2c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2H8Z"/>
              </svg>
            </div>
            <div className="reg-logo-text">Deadline<span>Desk</span></div>
          </Link>

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
              {loading ? "Creating account..." : "Get Started"}
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