import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .add-root {
    min-height: 100vh;
    background: #fafbfc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', -apple-system, sans-serif;
    padding: 40px 20px;
    box-sizing: border-box;
  }

  .add-card {
    width: 100%;
    max-width: 800px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .add-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #6b7280;
    text-decoration: none;
    margin-bottom: 24px;
    transition: color 0.2s;
  }
  .add-back:hover { color: #111827; }

  .add-title {
    font-weight: 700;
    font-size: 28px;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .add-subtitle {
    font-size: 15px;
    color: #6b7280;
    margin: 0 0 32px 0;
  }

  .add-grid-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 32px;
  }
  
  .form-col {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .input-group { display: flex; flex-direction: column; gap: 8px; }

  .add-label {
    font-size: 13px;
    font-weight: 600;
    color: #111827;
  }

  .add-input, .add-textarea {
    padding: 12px 14px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    color: #111827;
    font-size: 14px;
    font-family: 'Inter', -apple-system, sans-serif;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  .add-input::placeholder, .add-textarea::placeholder { color: #b5b0a8; }
  .add-input:focus, .add-textarea:focus {
    border-color: #0f172a;
  }
  .add-textarea {
    resize: vertical;
    min-height: 100px;
  }

  .add-btn {
    width: 100%;
    padding: 14px;
    background: #0f172a;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-family: 'Inter', -apple-system, sans-serif;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 12px;
  }
  .add-btn:hover { background: #1e293b; }

  /* Status selector pills */
  .status-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .status-pill {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid #eaeaea;
    background: #fafbfc;
    color: #6b7280;
    transition: all 0.2s;
  }
  .status-pill:hover { border-color: #b5b0a8; color: #111827; }
  
  .status-pill.active-Applied { background: #0f172a; border-color: #0f172a; color: #fff; }
  .status-pill.active-Interview { background: #b5763b; border-color: #b5763b; color: #fff; }
  .status-pill.active-OA { background: #7b5ea7; border-color: #7b5ea7; color: #fff; }
  .status-pill.active-Offer { background: #4a8c6a; border-color: #4a8c6a; color: #fff; }
  .status-pill.active-Rejected { background: #b54d42; border-color: #b54d42; color: #fff; }
  .status-pill.active-NoResponse { background: #9e9890; border-color: #9e9890; color: #fff; }
`;

export default function AddInternship() {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [resumeUsed, setResumeUsed] = useState("");
  const [status, setStatus] = useState("Applied");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company || !role || !appliedDate) { setError("Company, role, and applied date are required"); return; }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ company, role, status, appliedDate, deadline, notes, resumeUsed }),
      });
      if (!res.ok) throw new Error("Save failed");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to add internship");
    }
  };

  const statuses = ["Applied", "Interview", "OA", "Offer", "Rejected", "No Response"];

  return (
    <>
      <style>{styles}</style>
      <div className="add-root">
        <div className="add-card">
          <Link to="/dashboard" className="add-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            &nbsp;Back to Dashboard
          </Link>
          <h1 className="add-title">Add Application</h1>
          <p className="add-subtitle">Log a new internship you've applied to</p>

          {error && (
            <div style={{ background: "#fce8e6", border: "1px solid #b54d42", color: "#b54d42", fontSize: 14, padding: "12px 16px", borderRadius: 6, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="add-grid-form">
              {/* LEFT COLUMN */}
              <div className="form-col">
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
                  <label className="add-label">Status</label>
                  <div className="status-pills">
                    {statuses.map((s) => (
                      <button type="button" key={s}
                        className={`status-pill ${status === s ? `active-${s.replace(/\s+/g, '')}` : ""}`}
                        onClick={() => setStatus(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="form-col">
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
                <div className="input-group">
                  <label className="add-label">Resume Used (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend_v2.pdf"
                    value={resumeUsed}
                    onChange={(e) => setResumeUsed(e.target.value)}
                    className="add-input"
                  />
                </div>
                <div className="input-group">
                  <label className="add-label">Notes</label>
                  <textarea
                    placeholder="Any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="add-textarea"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="add-btn">Add Internship</button>
          </form>
        </div>
      </div>
    </>
  );
}