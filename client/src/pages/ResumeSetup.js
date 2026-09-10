import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { API_BASE as API } from "../apiConfig";

const styles = `
  .resume-root {
    display: flex;
    min-height: 100vh;
    background: #f5f3ef;
    font-family: 'Outfit', -apple-system, sans-serif;
    color: #2a2a2a;
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
    background: #f5f3ef;
    position: relative;
    overflow: hidden;
  }

  .resume-content { max-width: 820px; }

  .resume-header { margin-bottom: 32px; }

  .resume-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #8a857e;
    text-decoration: none;
    margin-bottom: 20px;
    transition: color 0.2s;
  }
  .resume-back:hover { color: #6b2737; }

  .resume-title {
    font-weight: 800;
    font-size: 32px;
    color: #2a2a2a;
    margin: 0 0 6px 0;
    letter-spacing: -0.5px;
  }

  .resume-subtitle {
    font-size: 14px;
    color: #8a857e;
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
    font-size: 12px;
    font-weight: 700;
    color: #8a857e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .resume-char-count {
    font-size: 12px;
    color: #b0aaa2;
    font-family: 'Space Mono', monospace;
  }

  .resume-textarea {
    width: 100%;
    min-height: 380px;
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 12px;
    padding: 18px;
    color: #2a2a2a;
    font-size: 13px;
    font-family: 'Space Mono', monospace;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .resume-textarea::placeholder { color: #b0aaa2; }
  .resume-textarea:focus { border-color: #6b2737; }

  .resume-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 24px;
  }

  .btn-save-resume {
    padding: 10px 22px;
    background: #6b2737;
    border: none;
    border-radius: 20px;
    color: #fff;
    font-family: 'Outfit', -apple-system, sans-serif;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    box-shadow: 0 4px 14px rgba(107, 39, 55, 0.25);
  }
  .btn-save-resume:hover { background: #541e2b; transform: translateY(-1px); }

  .btn-score-all {
    padding: 10px 22px;
    background: #2d6a4f;
    border: none;
    border-radius: 20px;
    color: #fff;
    font-family: 'Outfit', -apple-system, sans-serif;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    box-shadow: 0 4px 14px rgba(45, 106, 79, 0.25);
  }
  .btn-score-all:hover { background: #1b4332; transform: translateY(-1px); }
  .resume-save-btn, .resume-match-all-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border: none;
    border-radius: 20px;
    font-family: 'Outfit', -apple-system, sans-serif;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    box-shadow: 0 4px 12px rgba(107, 39, 55, 0.2);
  }

  .resume-save-btn {
    background: #6b2737;
    color: #fff;
  }
  .resume-save-btn:hover:not(:disabled) { background: #541e2b; transform: translateY(-1px); }
  .resume-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .resume-match-all-btn {
    background: #2d6a4f;
    color: #fff;
    box-shadow: 0 4px 12px rgba(45, 106, 79, 0.2);
  }
  .resume-match-all-btn:hover:not(:disabled) { background: #1b4332; transform: translateY(-1px); }
  .resume-match-all-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .resume-clear-btn {
    padding: 9px 18px;
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 20px;
    color: #8a857e;
    font-family: 'Outfit', -apple-system, sans-serif;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .resume-clear-btn:hover { background: #faf8f5; color: #2a2a2a; border-color: #6b2737; }

  .resume-toast {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    animation: toastIn 0.3s ease;
  }
  .resume-toast.success {
    background: #dcfce7;
    border: 1px solid #86efac;
    color: #166534;
  }
  .resume-toast.error {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    color: #991b1b;
  }

  /* 1-Click Bullet Improver Styles */
  .bullet-card {
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 16px;
    padding: 24px;
    margin-top: 36px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  }
  .bullet-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .bullet-title {
    font-size: 16px;
    font-weight: 800;
    color: #2a2a2a;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .bullet-tag {
    background: #fdf2f4;
    color: #6b2737;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid #f9d8de;
  }
  .bullet-input-box {
    width: 100%;
    background: #faf8f5;
    border: 1px solid #e4e0d9;
    border-radius: 10px;
    padding: 12px;
    font-size: 13px;
    font-family: inherit;
    line-height: 1.5;
    outline: none;
    box-sizing: border-box;
    margin-bottom: 12px;
  }
  .bullet-input-box:focus {
    border-color: #6b2737;
  }
  .bullet-result-card {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 12px;
    padding: 16px;
    margin-top: 14px;
  }
  .bullet-result-text {
    font-size: 14px;
    font-weight: 600;
    color: #166534;
    line-height: 1.6;
    margin-bottom: 12px;
  }
  .bullet-changes-note {
    font-size: 12px;
    color: #4b5563;
    background: #ffffff;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #dcfce7;
    margin-bottom: 12px;
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

  // 1-Click Bullet Improver State
  const [inputBullet, setInputBullet] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer Intern");
  const [improvingBullet, setImprovingBullet] = useState(false);
  const [bulletResult, setBulletResult] = useState(null);

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

  const handleImproveBullet = async () => {
    if (!inputBullet.trim()) return;
    setImprovingBullet(true);
    setBulletResult(null);
    try {
      const res = await fetch(`${API}/api/me/ai-actions/improve-bullet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bullet: inputBullet,
          targetRole: targetRole || "Software Engineer Intern"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBulletResult(data);
      } else {
        showToast("error", data.message || "Failed to improve bullet");
      }
    } catch (err) {
      showToast("error", "Error contacting AI bullet improver service");
    } finally {
      setImprovingBullet(false);
    }
  };

  const handleAcceptBullet = () => {
    const text = bulletResult?.improvedBullet || bulletResult?.improved;
    if (!text) return;
    setResumeText(prev => prev ? `${prev}\n• ${text}` : `• ${text}`);
    showToast("success", "Added improved bullet to your resume text!");
  };

  const handleCopyBullet = () => {
    const text = bulletResult?.improvedBullet || bulletResult?.improved;
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("success", "Copied improved bullet to clipboard!");
  };

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
              <Link to="/dashboard" className="resume-back">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back to Dashboard
              </Link>

              <div className="resume-header">
                <h1 className="resume-title">My Resume</h1>
                <p className="resume-subtitle">
                  Paste your resume plain text below. DeadlineDesk matches this against each
                  internship's requirements to calculate your match score and highlight missing skills.
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

              {/* 1-Click Bullet Improver */}
              <div className="bullet-card">
                <div className="bullet-header">
                  <div className="bullet-title">
                    <span>⚡ 1-Click Resume Bullet Improver</span>
                    <span className="bullet-tag">AI Powered</span>
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 14px 0" }}>
                  Turn weak task descriptions into high-impact, quantified resume bullets with strong action verbs and keyword alignment.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    className="bullet-input-box"
                    placeholder="Enter a bullet point: e.g. Worked on the backend APIs and helped with MongoDB database queries."
                    value={inputBullet}
                    onChange={(e) => setInputBullet(e.target.value)}
                  />
                  <input
                    type="text"
                    className="bullet-input-box"
                    placeholder="Target Role: e.g. Backend Intern"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>

                <button
                  className="resume-save-btn"
                  style={{ padding: "8px 18px", fontSize: "12px" }}
                  onClick={handleImproveBullet}
                  disabled={improvingBullet || !inputBullet.trim()}
                >
                  {improvingBullet ? "Optimizing..." : "Improve Bullet"}
                </button>

                {bulletResult && (
                  <div className="bullet-result-card">
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", textTransform: "uppercase", marginBottom: "6px" }}>
                      ✨ Improved Bullet:
                    </div>
                    <div className="bullet-result-text">
                      • {bulletResult.improvedBullet || bulletResult.improved}
                    </div>
                    {(bulletResult.changesMade || bulletResult.metricsAdded || bulletResult.feedback) && (
                      <div className="bullet-changes-note">
                        <strong>Improvements:</strong> {bulletResult.changesMade || bulletResult.metricsAdded || bulletResult.feedback}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="resume-save-btn" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={handleAcceptBullet}>
                        ✓ Insert into Resume
                      </button>
                      <button className="resume-clear-btn" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={handleCopyBullet}>
                        Copy to Clipboard
                      </button>
                    </div>
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

