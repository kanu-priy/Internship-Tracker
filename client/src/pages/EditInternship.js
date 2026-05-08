import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .edit-root {
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

  .edit-bg-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
  }
  .e-orb1 { width: 500px; height: 500px; background: rgba(245,158,11,0.1); top: -120px; left: -120px; }
  .e-orb2 { width: 400px; height: 400px; background: rgba(139,92,246,0.09); bottom: -100px; right: -100px; }

  .edit-grid-bg {
    position: fixed;
    inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .edit-card {
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

  .edit-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    text-decoration: none;
    margin-bottom: 28px;
    transition: color 0.2s;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
  }
  .edit-back:hover { color: rgba(255,255,255,0.7); }

  .edit-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.2);
    border-radius: 20px;
    font-size: 12px;
    color: #fbbf24;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .edit-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 30px;
    color: #fff;
    letter-spacing: -1px;
    margin-bottom: 6px;
  }

  .edit-subtitle {
    font-size: 14px;
    color: rgba(255,255,255,0.35);
    margin-bottom: 36px;
  }

  .edit-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .input-group { display: flex; flex-direction: column; gap: 8px; }

  .edit-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
  }

  .edit-input {
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
  .edit-input::placeholder { color: rgba(255,255,255,0.2); }
  .edit-input:focus {
    border-color: rgba(245,158,11,0.5);
    background: rgba(245,158,11,0.04);
    box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
  }

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

  .edit-btn {
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
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 8px 24px rgba(245,158,11,0.3);
  }
  .edit-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(245,158,11,0.45); }

  .edit-error {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5;
    font-size: 13px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 20px;
  }
`;

export default function EditInternship() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Applied");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInternship() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/internships/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setCompany(data.company);
        setRole(data.role);
        setAppliedDate(data.appliedDate || "");
        setDeadline(data.deadline || "");
        setStatus(data.status || "Applied");
      } catch (err) {
        console.error("Edit page load failed:", err);
        setError("Failed to load internship data");
      }
    }
    loadInternship();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!company || !role || !appliedDate) { setError("Company, Role, and Applied Date are required"); return; }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/internships/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ company, role, appliedDate, deadline, status }),
      });
      if (!res.ok) throw new Error("Update failed");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to update internship");
    }
  };

  const statuses = ["Applied", "Interview", "OA", "Offer", "Rejected"];

  return (
    <>
      <style>{styles}</style>
      <div className="edit-root">
        <div className="edit-bg-orb e-orb1" />
        <div className="edit-bg-orb e-orb2" />
        <div className="edit-grid-bg" />

        <div className="edit-card">
          <button className="edit-back" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
          <div className="edit-badge">✏️ Editing</div>
          <h1 className="edit-title">Update Application</h1>
          <p className="edit-subtitle">Modify details for this internship entry</p>

          {error && <div className="edit-error">{error}</div>}

          <form onSubmit={handleUpdate}>
            <div className="edit-form-grid">
              <div className="input-group">
                <label className="edit-label">Company</label>
                <input type="text" placeholder="Company" value={company}
                  onChange={(e) => setCompany(e.target.value)} className="edit-input" />
              </div>
              <div className="input-group">
                <label className="edit-label">Role / Position</label>
                <input type="text" placeholder="Role" value={role}
                  onChange={(e) => setRole(e.target.value)} className="edit-input" />
              </div>
              <div className="input-group">
                <label className="edit-label">Applied Date</label>
                <input type="date" value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)} className="edit-input" />
              </div>
              <div className="input-group">
                <label className="edit-label">Deadline</label>
                <input type="date" value={deadline}
                  onChange={(e) => setDeadline(e.target.value)} className="edit-input" />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="edit-label">Status</label>
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

            <button type="submit" className="edit-btn">Save Changes →</button>
          </form>
        </div>
      </div>
    </>
  );
}