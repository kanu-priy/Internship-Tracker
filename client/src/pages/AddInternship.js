import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .add-root {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 40px 20px;
    box-sizing: border-box;
  }

  .add-bg-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
  }
  .a-orb1 { width: 500px; height: 500px; background: rgba(16,185,129,0.1); top: -120px; right: -120px; }
  .a-orb2 { width: 400px; height: 400px; background: rgba(245,158,11,0.08); bottom: -100px; left: -100px; }

  .add-grid {
    position: fixed;
    inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .add-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 520px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 48px 44px;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.6);
    animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1);
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .add-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    text-decoration: none;
    margin-bottom: 28px;
    transition: color 0.2s;
  }
  .add-back:hover { color: rgba(255,255,255,0.7); }

  .add-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 30px;
    color: #fff;
    letter-spacing: -1px;
    margin-bottom: 6px;
  }

  .add-subtitle {
    font-size: 14px;
    color: rgba(255,255,255,0.35);
    margin-bottom: 36px;
  }

  .add-grid-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .add-full { grid-column: 1 / -1; }

  .input-group { display: flex; flex-direction: column; gap: 8px; }

  .add-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
  }

  .add-input, .add-select {
    padding: 13px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: all 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  .add-input::placeholder { color: rgba(255,255,255,0.2); }
  .add-input:focus, .add-select:focus {
    border-color: rgba(16,185,129,0.5);
    background: rgba(16,185,129,0.04);
    box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
  }
  .add-select option { background: #1a1a2e; }

  .add-btn {
    width: 100%;
    padding: 15px;
    margin-top: 8px;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 8px 24px rgba(16,185,129,0.3);
  }
  .add-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(16,185,129,0.45); }

  /* Status selector pills */
  .status-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .status-pill {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.5);
    transition: all 0.2s;
  }
  .status-pill:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
  .status-pill.active-Applied { background: rgba(59,130,246,0.2); border-color: rgba(59,130,246,0.4); color: #93c5fd; }
  .status-pill.active-Interview { background: rgba(245,158,11,0.2); border-color: rgba(245,158,11,0.4); color: #fcd34d; }
  .status-pill.active-OA { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.4); color: #c4b5fd; }
  .status-pill.active-Offer { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.4); color: #6ee7b7; }
  .status-pill.active-Rejected { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.35); color: #fca5a5; }
`;

export default function AddInternship() {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Applied");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company || !role || !appliedDate) { setError("Company, role, and applied date are required"); return; }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ company, role, status, appliedDate, deadline }),
      });
      if (!res.ok) throw new Error("Save failed");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to add internship");
    }
  };

  const statuses = ["Applied", "Interview", "OA", "Offer", "Rejected"];

  return (
    <>
      <style>{styles}</style>
      <div className="add-root">
        <div className="add-bg-orb a-orb1" />
        <div className="add-bg-orb a-orb2" />
        <div className="add-grid" />

        <div className="add-card">
          <Link to="/dashboard" className="add-back">← Back to Dashboard</Link>
          <h1 className="add-title">Add Application</h1>
          <p className="add-subtitle">Log a new internship you've applied to</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13, padding: "12px 16px", borderRadius: 12, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="add-grid-form">
              <div className="input-group">
                <label className="add-label">Company</label>
                <input type="text" placeholder="Google, Meta, etc." value={company}
                  onChange={(e) => { setCompany(e.target.value); setError(""); }} className="add-input" />
              </div>
              <div className="input-group">
                <label className="add-label">Role / Position</label>
                <input type="text" placeholder="SWE Intern" value={role}
                  onChange={(e) => { setRole(e.target.value); setError(""); }} className="add-input" />
              </div>
              <div className="input-group">
                <label className="add-label">Applied Date</label>
                <input
                  type={appliedDate ? "date" : "text"}
                  placeholder="Applied Date"
                  value={appliedDate}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => { if (!appliedDate) e.target.type = "text"; }}
                  onChange={(e) => { setAppliedDate(e.target.value); setError(""); }}
                  className="add-input"
                />
              </div>
              <div className="input-group">
                <label className="add-label">Deadline / OA / Interview</label>
                <input
                  type={deadline ? "date" : "text"}
                  placeholder="Optional"
                  value={deadline}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => { if (!deadline) e.target.type = "text"; }}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="add-input"
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="add-label">Status</label>
              <div className="status-pills">
                {statuses.map((s) => (
                  <button type="button" key={s}
                    className={`status-pill ${status === s ? `active-${s}` : ""}`}
                    onClick={() => setStatus(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="add-btn">Add Internship →</button>
          </form>
        </div>
      </div>
    </>
  );
}