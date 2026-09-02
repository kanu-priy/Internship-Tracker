import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const styles = `
  .reg-root {
    min-height: 100vh;
    background: #f5f3ef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', -apple-system, sans-serif;
  }

  .reg-card {
    width: 100%;
    max-width: 420px;
    margin: 20px;
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(107, 39, 55, 0.04);
  }

  .reg-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 28px;
    text-decoration: none;
  }

  .reg-logo-icon {
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

  .reg-logo-text {
    font-weight: 800;
    font-size: 24px;
    color: #2a2a2a;
    letter-spacing: -0.5px;
  }

  .reg-logo-text span { color: #6b2737; }

  .reg-title {
    font-weight: 800;
    font-size: 22px;
    color: #2a2a2a;
    margin-bottom: 4px;
    text-align: center;
    letter-spacing: -0.3px;
  }

  .reg-subtitle {
    font-size: 13px;
    color: #8a857e;
    margin-bottom: 28px;
    text-align: center;
  }

  .reg-error {
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

  .reg-input {
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
  .reg-input::placeholder { color: #b0aaa2; }
  .reg-input:focus {
    border-color: #6b2737;
    background: #ffffff;
  }

  .reg-btn {
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

  .reg-btn:hover:not(:disabled) {
    background: #541e2b;
    transform: translateY(-1px);
  }
  .reg-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .reg-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 13px;
    color: #8a857e;
  }

  .reg-footer a {
    color: #6b2737;
    text-decoration: none;
    font-weight: 700;
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