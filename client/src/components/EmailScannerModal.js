import React, { useState } from "react";

const SAMPLES = {
  interview: `Subject: Interview Invitation: Software Engineering Intern at Google\nHi Kanupriya,\nThank you for applying to Google! We were very impressed with your background and would like to invite you for a 45-minute technical interview. Please choose your availability for next Tuesday, Sept 2.`,
  oa: `Subject: Amazon Online Assessment Invitation\nDear Candidate,\nCongratulations! You have been selected to take the Amazon Software Engineer Intern Online Assessment. Please complete the HackerRank test within 3 days (Deadline: Sept 4).`,
  rejection: `Subject: Update regarding your application at Meta\nHi Kanupriya,\nThank you for taking the time to interview for the Software Engineer Intern role at Meta. Unfortunately, we have decided not to move forward with your application at this time.`
};

export default function EmailScannerModal({ onClose, onUpdateSuccess }) {
  const [emailText, setEmailText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async (autoApply = true) => {
    if (!emailText.trim()) {
      setError("Please paste email text or select a sample below.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/me/parse-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emailText, autoApply })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to scan email");

      setResult(data);
      if (data.updatedInternship && onUpdateSuccess) {
        onUpdateSuccess(data.updatedInternship);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scanner-overlay">
      <style>{`
        .scanner-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
        }
        .scanner-modal {
          background: #ffffff; width: 90%; max-width: 580px;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          overflow: hidden; display: flex; flex-direction: column;
        }
        .scanner-header {
          padding: 16px 20px; border-bottom: 1px solid #eaeaea;
          display: flex; justify-content: space-between; align-items: center;
        }
        .scanner-title {
          font-weight: 700; font-size: 16px; color: #111827;
          display: flex; align-items: center; gap: 8px;
        }
        .scanner-close {
          background: none; border: none; cursor: pointer; color: #6b7280;
        }
        .scanner-body {
          padding: 20px; max-height: 520px; overflow-y: auto;
        }
        .sample-pills {
          display: flex; gap: 8px; margin-bottom: 12px; align-items: center;
        }
        .sample-btn {
          background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px;
          padding: 4px 10px; font-size: 12px; color: #475569; cursor: pointer;
        }
        .sample-btn:hover { background: #e2e8f0; color: #0f172a; }
        .scanner-textarea {
          width: 100%; height: 130px; border: 1px solid #eaeaea; border-radius: 8px;
          padding: 12px; font-family: inherit; font-size: 13px; outline: none;
          resize: none; background: #fafbfc; color: #111827; box-sizing: border-box;
        }
        .result-box {
          margin-top: 16px; background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 8px;
        }
        .result-badge {
          display: inline-block; padding: 4px 10px; border-radius: 6px;
          font-weight: 600; font-size: 12px; text-transform: uppercase;
        }
        .badge-Interview { background: #fef3c7; color: #b45309; }
        .badge-OA { background: #f3e8ff; color: #6b21a8; }
        .badge-Rejected { background: #fee2e2; color: #b91c1c; }
        .badge-Offer { background: #d1fae5; color: #047857; }
        .badge-Applied { background: #dbeafe; color: #1d4ed8; }

        .scanner-footer {
          padding: 16px 20px; border-top: 1px solid #eaeaea; background: #fafbfc;
          display: flex; justify-content: flex-end; gap: 12px;
        }
        .btn-scan {
          background: #0f172a; color: #fff; border: none; padding: 8px 18px;
          border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer;
        }
        .btn-scan:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="scanner-modal">
        <div className="scanner-header">
          <div className="scanner-title">📥 AI Email Inbox Scanner</div>
          <button className="scanner-close" onClick={onClose}>✕</button>
        </div>

        <div className="scanner-body">
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
            Paste any job email (Interview invite, OA link, rejection) to automatically detect and sync updates to your Dashboard:
          </div>

          <div className="sample-pills">
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Try sample:</span>
            <button className="sample-btn" onClick={() => setEmailText(SAMPLES.interview)}>Google Interview</button>
            <button className="sample-btn" onClick={() => setEmailText(SAMPLES.oa)}>Amazon OA</button>
            <button className="sample-btn" onClick={() => setEmailText(SAMPLES.rejection)}>Meta Rejection</button>
          </div>

          <textarea
            className="scanner-textarea"
            placeholder="Paste your job email text here..."
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
          />

          {error && <div style={{ color: "#ef4444", fontSize: "13px", marginTop: "8px" }}>{error}</div>}

          {result && result.parsed && (
            <div className="result-box">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={`result-badge badge-${result.parsed.status}`}>
                  {result.parsed.status}
                </span>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {result.parsed.extractedDate ? `📅 ${result.parsed.extractedDate}` : ""}
                </span>
              </div>
              <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>
                {result.parsed.company || "Unknown Company"}
              </div>
              <div style={{ fontSize: "13px", color: "#475569" }}>
                {result.parsed.summary}
              </div>

              {result.updatedInternship ? (
                <div style={{ fontSize: "12px", color: "#166534", background: "#dcfce7", padding: "6px 10px", borderRadius: "6px", fontWeight: "600", marginTop: "4px" }}>
                  ✅ Matched & Auto-Updated on Dashboard!
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#854d0e", background: "#fef9c3", padding: "6px 10px", borderRadius: "6px", marginTop: "4px" }}>
                  ℹ️ Parsed successfully. (No matching job named "{result.parsed.company}" found in your current list).
                </div>
              )}
            </div>
          )}
        </div>

        <div className="scanner-footer">
          <button className="btn-scan" onClick={() => handleScan(true)} disabled={loading}>
            {loading ? "Scanning..." : "✨ Scan & Auto-Sync"}
          </button>
        </div>
      </div>
    </div>
  );
}
