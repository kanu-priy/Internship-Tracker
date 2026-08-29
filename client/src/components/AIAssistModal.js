import React, { useState, useEffect } from "react";

export default function AIAssistModal({ internship, onClose }) {
  const [activeTab, setActiveTab] = useState("email"); // 'email' or 'interview'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ email: "", interview: "" });
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch data when tab changes if not already fetched
    if (!data[activeTab]) {
      fetchAIContent(activeTab);
    }
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
          skills: internship.skills
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

  const handleCopy = () => {
    navigator.clipboard.writeText(data[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ai-modal-overlay">
      <style>{`
        .ai-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
        }
        .ai-modal {
          background: #ffffff;
          width: 90%; max-width: 600px;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          display: flex; flex-direction: column;
        }
        .ai-header {
          padding: 16px 20px;
          border-bottom: 1px solid #eaeaea;
          display: flex; justify-content: space-between; align-items: center;
        }
        .ai-title {
          font-weight: 600; font-size: 16px; color: #111827;
          display: flex; align-items: center; gap: 8px;
        }
        .ai-close {
          background: none; border: none; cursor: pointer; color: #6b7280;
        }
        .ai-tabs {
          display: flex; border-bottom: 1px solid #eaeaea; background: #fafbfc;
        }
        .ai-tab {
          flex: 1; padding: 12px; text-align: center; cursor: pointer;
          font-size: 14px; font-weight: 500; color: #6b7280;
          border-bottom: 2px solid transparent; transition: all 0.2s;
        }
        .ai-tab.active {
          color: #0f172a; border-bottom-color: #0f172a; background: #ffffff;
        }
        .ai-body {
          padding: 20px; min-height: 250px; max-height: 500px; overflow-y: auto;
        }
        .ai-content-box {
          background: #f9fafb; border: 1px solid #eaeaea; border-radius: 8px;
          padding: 16px; font-size: 14px; color: #374151; white-space: pre-wrap;
          font-family: inherit; line-height: 1.5;
        }
        .ai-loading {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 200px; color: #6b7280; gap: 12px; font-size: 14px;
        }
        .spinner {
          width: 24px; height: 24px; border: 3px solid #eaeaea; border-top-color: #0f172a;
          border-radius: 50%; animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .ai-footer {
          padding: 16px 20px; border-top: 1px solid #eaeaea; background: #fafbfc;
          display: flex; justify-content: flex-end;
        }
        .ai-btn-primary {
          background: #0f172a; color: #fff; border: none; padding: 8px 16px;
          border-radius: 6px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;
        }
        .ai-btn-primary:hover { background: #1e293b; }
      `}</style>
      <div className="ai-modal">
        <div className="ai-header">
          <div className="ai-title">✨ AI Assistant for {internship.company}</div>
          <button className="ai-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="ai-tabs">
          <div className={`ai-tab ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>
            ✉️ Cold Email
          </div>
          <div className={`ai-tab ${activeTab === 'interview' ? 'active' : ''}`} onClick={() => setActiveTab('interview')}>
            🎯 Interview Prep
          </div>
        </div>
        <div className="ai-body">
          {loading ? (
            <div className="ai-loading">
              <div className="spinner"></div>
              Generating {activeTab === 'email' ? 'highly personalized email' : 'likely interview questions'}...
            </div>
          ) : error ? (
            <div style={{ color: "#ef4444", textAlign: "center", padding: "20px" }}>{error}</div>
          ) : data[activeTab] ? (
            <div className="ai-content-box">{data[activeTab]}</div>
          ) : null}
        </div>
        {!loading && !error && data[activeTab] && (
          <div className="ai-footer">
            <button className="ai-btn-primary" onClick={handleCopy}>
              {copied ? "✅ Copied!" : "📋 Copy to Clipboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
