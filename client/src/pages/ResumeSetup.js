import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const API = "http://localhost:5000";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .resume-root {
    display: flex;
    min-height: 100vh;
    background: #fafbfc;
    font-family: 'Inter', -apple-system, sans-serif;
    color: #111827;
  }

  .resume-main-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .resume-main {
    flex: 1;
    padding: 36px 40px;
    background: #fafbfc;
    position: relative;
    overflow: hidden;
  }

  .resume-content { max-width: 820px; }

  .resume-header { margin-bottom: 32px; }

  .resume-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #6b7280;
    text-decoration: none;
    margin-bottom: 20px;
    transition: color 0.2s;
  }
  .resume-back:hover { color: #111827; }

  .resume-title {
    font-weight: 700;
    font-size: 32px;
    color: #111827;
    margin: 0 0 8px 0;
  }

  .resume-subtitle {
    font-size: 15px;
    color: #6b7280;
    line-height: 1.5;
  }

  .resume-textarea-container {
    margin-bottom: 24px;
  }
  
  .resume-textarea-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .resume-label {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }
  
  .resume-char-count {
    font-size: 13px;
    color: #9e9890;
  }

  .resume-textarea {
    width: 100%;
    min-height: 400px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 16px;
    color: #111827;
    font-size: 14px;
    font-family: 'Inter', -apple-system, sans-serif;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .resume-textarea::placeholder { color: #b5b0a8; }
  .resume-textarea:focus { border-color: #0f172a; }

  .resume-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 24px;
  }

  .resume-save-btn, .resume-match-all-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-family: 'Inter', -apple-system, sans-serif;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .resume-save-btn {
    background: #0f172a;
    color: #fff;
  }
  .resume-save-btn:hover:not(:disabled) { background: #1e293b; }
  .resume-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .resume-match-all-btn {
    background: #4a8c6a;
    color: #fff;
  }
  .resume-match-all-btn:hover:not(:disabled) { background: #3a7055; }
  .resume-match-all-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .resume-clear-btn {
    padding: 12px 20px;
    background: transparent;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    color: #6b7280;
    font-family: 'Inter', -apple-system, sans-serif;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .resume-clear-btn:hover { background: #fff; color: #111827; border-color: #b5b0a8; }

  .resume-toast {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    animation: toastIn 0.3s ease;
  }
  .resume-toast.success {
    background: #e8f5ee;
    border: 1px solid #4a8c6a;
    color: #4a8c6a;
  }
  .resume-toast.error {
    background: #fce8e6;
    border: 1px solid #b54d42;
    color: #b54d42;
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function ResumeSetup() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [savedText, setSavedText] = useState("");
  const [saving, setSaving] = useState(false);
  const [matching, setMatching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  const token = localStorage.getItem("token");

  // ── Load existing resume on mount ────────────────────────────────────────
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch(`${API}/api/me/resume`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setResumeText(d.resumeText || "");
        setSavedText(d.resumeText || "");
      })
      .catch(() => {});
  }, [navigate, token]);

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Upload Resume PDF ──────────────────────────────────────────────────────
  async function handleFileUpload(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      showToast("error", "Please upload a PDF file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      const res = await fetch(`${API}/api/me/resume/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setResumeText(data.resumeText);
        setSavedText(data.resumeText);
        showToast("success", "Resume uploaded and parsed successfully!");
      } else {
        showToast("error", data.message || "Failed to parse resume.");
      }
    } catch {
      showToast("error", "Network error.");
    }
    setUploading(false);
  }

  // ── Save resume ───────────────────────────────────────────────────────────
  async function handleSave() {
    if (!resumeText.trim()) {
      showToast("error", "Please paste your resume text first.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/me/resume`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeText }),
      });
      if (res.ok) {
        setSavedText(resumeText);
        showToast("success", "Resume saved! Match scores will now appear on your applications.");
      } else {
        showToast("error", "Failed to save. Please try again.");
      }
    } catch {
      showToast("error", "Network error. Is the server running?");
    }
    setSaving(false);
  }

  // ── Match all internships ─────────────────────────────────────────────────
  async function handleMatchAll() {
    if (!savedText) {
      showToast("error", "Save your resume first before computing match scores.");
      return;
    }
    setMatching(true);
    try {
      const res = await fetch(`${API}/api/me/match-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        showToast("success", `Match scores updated for ${data.updated} application(s). Go check your dashboard!`);
      } else {
        showToast("error", data.message || "Failed to compute matches.");
      }
    } catch {
      showToast("error", "Network error.");
    }
    setMatching(false);
  }

  const isDirty = resumeText !== savedText;
  const charCount = resumeText.length;

  return (
    <>
      <style>{styles}</style>
      <div className="resume-root">
        <Sidebar />
        <div className="resume-main-wrap">
          <main className="resume-main">
            <div className="resume-content">
              <div className="resume-header">
                <Link to="/dashboard" className="resume-back">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  &nbsp;Back to Dashboard
                </Link>
                <h1 className="resume-title">My Resume</h1>
                <p className="resume-subtitle">
                  Paste your resume once. DeadlineDesk will automatically score how well you match every saved internship.
                </p>
              </div>

              <div className="resume-textarea-container">
                <div className="resume-textarea-header">
                  <span className="resume-label">Resume Text</span>
                  <span className="resume-char-count">{charCount.toLocaleString()} characters</span>
                </div>
                
                <div style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                  <label className="resume-clear-btn" style={{ cursor: "pointer", background: "#f3f4f6", color: "#111827", padding: "8px 16px" }}>
                    {uploading ? "Uploading..." : "Upload PDF"}
                    <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>or paste your text below</span>
                </div>

                <textarea
                  className="resume-textarea"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder={`Paste your full resume text here...

Example:
Skills: React, Node.js, Python, MongoDB, SQL, Docker, Git

Education:
B.Tech Computer Science — XYZ University (2022–2026)

Experience:
Software Intern — ABC Corp (June 2025)
• Built REST APIs using Node.js and Express
• Worked with PostgreSQL and Redis

Projects:
Internship Tracker — React, Node.js, MongoDB
• Full-stack web app with Chrome extension integration`}
                />
              </div>

              <div className="resume-actions">
                <button
                  className="resume-save-btn"
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                >
                  {saving ? "Saving..." : savedText ? "Update Resume" : "Save Resume"}
                </button>

                <button
                  className="resume-match-all-btn"
                  onClick={handleMatchAll}
                  disabled={matching || !savedText}
                  title={!savedText ? "Save your resume first" : "Compute match score for all your applications"}
                >
                  {matching ? "Scoring..." : "Score All Applications"}
                </button>

                {resumeText && (
                  <button
                    className="resume-clear-btn"
                    onClick={() => setResumeText("")}
                  >
                    Clear
                  </button>
                )}

                {toast && (
                  <div className={`resume-toast ${toast.type}`}>
                    {toast.type === 'success' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    )}
                    {toast.msg}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

