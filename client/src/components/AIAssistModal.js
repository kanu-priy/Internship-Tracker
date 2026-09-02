import React, { useState, useEffect } from "react";

export default function AIAssistModal({ internship, onClose, initialTab = "email" }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'email', 'interview', 'followup', 'ats'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ email: "", interview: "", followup: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeTab !== "ats" && !data[activeTab]) {
      fetchAIContent(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchAIContent = async (type) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/me/ai-actions/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          company: internship.company,
          role: internship.role,
          jobDescription: internship.jobDescription,
          skills: internship.skills,
          status: internship.status,
          daysStale: 7
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to generate");

      setData(prev => ({ ...prev, [type]: json.result }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text || data[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGmail = () => {
    const text = data[activeTab] || "";
    const subjectMatch = text.match(/Subject:\s*(.+)/i);
    const subject = subjectMatch ? encodeURIComponent(subjectMatch[1].trim()) : encodeURIComponent(`Following up on ${internship.role} Application`);
    const body = encodeURIComponent(text.replace(/Subject:.+\n/i, "").trim());
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="ai-modal-overlay">
      <style>{`
        .ai-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
        }
        .ai-modal {
          background: #ffffff;
          width: 90%; max-width: 620px;
          border-radius: 16px;
          border: 1px solid #e4e0d9;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          display: flex; flex-direction: column;
          font-family: 'Outfit', sans-serif;
        }
        .ai-header {
          padding: 18px 24px;
          border-bottom: 1px solid #f0ede8;
          display: flex; justify-content: space-between; align-items: center;
        }
        .ai-title {
          font-weight: 800; font-size: 16px; color: #2a2a2a;
          display: flex; align-items: center; gap: 8px; letter-spacing: -0.3px;
        }
        .ai-close {
          background: #faf8f5; border: 1px solid #e4e0d9;
          cursor: pointer; color: #8a857e; width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-size: 13px;
        }
        .ai-close:hover { background: #ffffff; color: #6b2737; border-color: #6b2737; }
        
        .ai-tabs {
          display: flex; border-bottom: 1px solid #e4e0d9; background: #faf8f5;
          overflow-x: auto;
        }
        .ai-tab {
          flex: 1; padding: 12px 10px; text-align: center; cursor: pointer;
          font-size: 12px; font-weight: 700; color: #8a857e;
          border-bottom: 2px solid transparent; transition: all 0.2s;
          white-space: nowrap;
        }
        .ai-tab.active {
          color: #6b2737; border-bottom-color: #6b2737; background: #ffffff;
        }
        .ai-body {
          padding: 24px; min-height: 240px; max-height: 480px; overflow-y: auto;
        }
        .ai-content-box {
          background: #faf8f5; border: 1px solid #e4e0d9; border-radius: 12px;
          padding: 16px; font-size: 13px; color: #2a2a2a; white-space: pre-wrap;
          font-family: 'Space Mono', monospace; line-height: 1.6;
        }
        .ai-loading {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 200px; color: #8a857e; gap: 12px; font-size: 13px; font-weight: 600;
        }
        .spinner {
          width: 24px; height: 24px; border: 3px solid #e4e0d9; border-top-color: #6b2737;
          border-radius: 50%; animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .ai-footer {
          padding: 16px 24px; border-top: 1px solid #f0ede8; background: #faf8f5;
          display: flex; justify-content: flex-end; gap: 10px;
        }
        .ai-btn-primary {
          background: #6b2737; color: #fff; border: none; padding: 9px 20px;
          border-radius: 20px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: background 0.2s; box-shadow: 0 4px 12px rgba(107, 39, 55, 0.25);
        }
        .ai-btn-primary:hover { background: #541e2b; }
        .ai-btn-gmail {
          background: #ea4335; color: #fff; border: none; padding: 9px 16px;
          border-radius: 20px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: background 0.2s; box-shadow: 0 4px 12px rgba(234, 67, 53, 0.25);
        }
        .ai-btn-gmail:hover { background: #c5221f; }
        
        .ats-tag {
          display: inline-block; padding: 3px 8px; border-radius: 6px;
          font-size: 11px; font-weight: 700; margin: 3px;
        }
        .ats-matched { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .ats-missing { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
      `}</style>
      <div className="ai-modal">
        <div className="ai-header">
          <div className="ai-title">✨ AI Career Tools ({internship.company})</div>
          <button className="ai-close" onClick={onClose}>✕</button>
        </div>

        <div className="ai-tabs">
          <div className={`ai-tab ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>
            ✉️ Outreach
          </div>
          <div className={`ai-tab ${activeTab === 'followup' ? 'active' : ''}`} onClick={() => setActiveTab('followup')}>
            👻 Follow-Up
          </div>
          <div className={`ai-tab ${activeTab === 'interview' ? 'active' : ''}`} onClick={() => setActiveTab('interview')}>
            🎯 Interview Prep
          </div>
          <div className={`ai-tab ${activeTab === 'ats' ? 'active' : ''}`} onClick={() => setActiveTab('ats')}>
            🔍 ATS Keywords
          </div>
        </div>

        <div className="ai-body">
          {activeTab === "ats" ? (
            <div>
              <div style={{ marginBottom: "16px", padding: "12px", background: "#faf8f5", borderRadius: "10px", border: "1px solid #e4e0d9" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#6a655e", textTransform: "uppercase" }}>
                  ATS Match Score: <span style={{ color: "#6b2737", fontSize: "16px" }}>{internship.matchScore !== undefined ? `${internship.matchScore}%` : "Not Scored Yet"}</span>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#166534", marginBottom: "6px" }}>
                  ✅ Matched Skills in your Resume:
                </div>
                <div>
                  {internship.matchedSkills && internship.matchedSkills.length > 0 ? (
                    internship.matchedSkills.map(s => <span key={s} className="ats-tag ats-matched">{s}</span>)
                  ) : (
                    <span style={{ fontSize: "12px", color: "#8a857e" }}>None detected yet. Score in "My Resume".</span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#92400e", marginBottom: "6px" }}>
                  ⚠️ Missing Keywords from Job Description:
                </div>
                <div>
                  {internship.missingSkills && internship.missingSkills.length > 0 ? (
                    internship.missingSkills.map(s => <span key={s} className="ats-tag ats-missing">{s}</span>)
                  ) : (
                    <span style={{ fontSize: "12px", color: "#8a857e" }}>No missing skills found. Great match!</span>
                  )}
                </div>
              </div>

              {internship.missingSkills && internship.missingSkills.length > 0 && (
                <div style={{ background: "#faf8f5", border: "1px solid #e4e0d9", borderRadius: "10px", padding: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b2737", marginBottom: "4px" }}>
                    💡 Suggested Resume Bullet to Add:
                  </div>
                  <div style={{ fontSize: "12px", color: "#2a2a2a", fontStyle: "italic", lineHeight: 1.5 }}>
                    "Utilized {internship.missingSkills.slice(0, 3).join(" and ")} to optimize performance and deliver scalable system solutions."
                  </div>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="ai-loading">
              <div className="spinner"></div>
              Generating {activeTab === 'email' ? 'outreach email' : activeTab === 'followup' ? 'Ghost Buster follow-up email' : 'interview questions'}...
            </div>
          ) : error ? (
            <div style={{ color: "#c1121f", textAlign: "center", padding: "20px", fontSize: "13px" }}>{error}</div>
          ) : data[activeTab] ? (
            <div className="ai-content-box">{data[activeTab]}</div>
          ) : null}
        </div>

        {activeTab !== "ats" && !loading && !error && data[activeTab] && (
          <div className="ai-footer">
            <button className="ai-btn-gmail" onClick={handleOpenGmail}>
              ✉️ Open in Gmail
            </button>
            <button className="ai-btn-primary" onClick={() => handleCopy(data[activeTab])}>
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
