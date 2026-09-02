import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  .add-root {
    min-height: 100vh;
    background: #f5f3ef;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', -apple-system, sans-serif;
    padding: 40px 20px;
    box-sizing: border-box;
  }

  .add-card {
    width: 100%;
    max-width: 800px;
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 4px 20px rgba(107, 39, 55, 0.04);
  }

  .add-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #8a857e;
    text-decoration: none;
    margin-bottom: 24px;
    transition: color 0.2s;
  }
  .add-back:hover { color: #6b2737; }

  .add-title {
    font-weight: 800;
    font-size: 28px;
    color: #2a2a2a;
    margin: 0 0 4px 0;
    letter-spacing: -0.5px;
  }

  .add-subtitle {
    font-size: 14px;
    color: #8a857e;
    margin: 0 0 28px 0;
  }

  .add-grid-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 28px;
  }
  
  .form-col {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .input-group { display: flex; flex-direction: column; gap: 6px; }

  .add-label {
    font-size: 11px;
    font-weight: 700;
    color: #8a857e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .add-input, .add-textarea {
    padding: 11px 14px;
    background: #faf8f5;
    border: 1px solid #e4e0d9;
    border-radius: 10px;
    color: #2a2a2a;
    font-size: 13px;
    font-family: 'Outfit', -apple-system, sans-serif;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  .add-input::placeholder, .add-textarea::placeholder { color: #b0aaa2; }
  .add-input:focus, .add-textarea:focus {
    border-color: #6b2737;
    background: #ffffff;
  }
  .add-textarea {
    resize: vertical;
    min-height: 90px;
  }

  .add-btn {
    width: 100%;
    padding: 12px;
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
  .add-btn:hover { background: #541e2b; transform: translateY(-1px); }

  /* Status selector pills */
  .status-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .status-pill {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    border: 1.5px solid #e4e0d9;
    background: #faf8f5;
    color: #8a857e;
    transition: all 0.2s;
    text-transform: uppercase;
  }
  .status-pill:hover { border-color: #6b2737; color: #6b2737; }
  
  .status-pill.active-Applied { background: #6b2737; border-color: #6b2737; color: #fff; }
  .status-pill.active-Interview { background: #c17817; border-color: #c17817; color: #fff; }
  .status-pill.active-OA { background: #8338ec; border-color: #8338ec; color: #fff; }
  .status-pill.active-Offer { background: #2d6a4f; border-color: #2d6a4f; color: #fff; }
  .status-pill.active-Rejected { background: #8a857e; border-color: #8a857e; color: #fff; }
  .status-pill.active-NoResponse { background: #b0aaa2; border-color: #b0aaa2; color: #fff; }
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