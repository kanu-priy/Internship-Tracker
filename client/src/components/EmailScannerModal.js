import React, { useState, useEffect } from "react";

const SAMPLES = [
  {
    label: "Google Interview",
    text: `Subject: Interview Invitation: Software Engineering Intern at Google\nHi Kanupriya,\nThank you for applying to Google! We were very impressed with your background and would like to invite you for a 45-minute technical interview. Please choose your availability for next Tuesday, Sept 2.`
  },
  {
    label: "Amazon OA",
    text: `Subject: Amazon Online Assessment Invitation\nDear Candidate,\nCongratulations! You have been selected to take the Amazon Software Engineer Intern Online Assessment. Please complete the HackerRank test within 3 days (Deadline: Sept 4).`
  },
  {
    label: "Meta Rejection",
    text: `Subject: Update regarding your application at Meta\nHi Kanupriya,\nThank you for taking the time to interview for the Software Engineer Intern role at Meta. Unfortunately, we have decided not to move forward with your application at this time.`
  }
];

export default function EmailScannerModal({ internships = [], onClose, onUpdateSuccess }) {
  const [emailText, setEmailText] = useState("");
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  // Editable overrides
  const [customDate, setCustomDate] = useState("");
  const [customStatus, setCustomStatus] = useState("");

  // REAL-TIME AUTO-SCAN (Debounced 300ms)
  useEffect(() => {
    if (!emailText.trim()) {
      setPreview(null);
      setError("");
      return;
    }

    const timer = setTimeout(() => {
      runRealTimeScan(emailText, targetId);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailText, targetId]);

  const runRealTimeScan = async (text, target) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/me/parse-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emailText: text, action: "PREVIEW", targetId: target || null })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to scan email");

      setPreview(data);
      if (data.parsed) {
        setCustomDate(data.parsed.extractedDate || "");
        setCustomStatus(data.parsed.status || "Applied");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // INSTANT CONFIRM & SAVE
  const handleConfirmUpdate = async () => {
    if (!preview || !preview.parsed) return;
    setConfirming(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/me/parse-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          emailText,
          action: "CONFIRM",
          targetId: targetId || (preview.possibleMatches?.[0]?._id) || null,
          company: preview.parsed.company,
          status: customStatus,
          extractedDate: customDate,
          summary: preview.parsed.summary
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update dashboard");

      if (data.updatedInternship && onUpdateSuccess) {
        onUpdateSuccess(data.updatedInternship);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="scanner-overlay">
      <style>{`
        .scanner-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
        }
        .scanner-modal {
          background: #ffffff; width: 90%; max-width: 580px;
          border-radius: 16px; border: 1px solid #e4e0d9;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          overflow: hidden; display: flex; flex-direction: column;
          font-family: 'Outfit', sans-serif;
        }
        .scanner-header {
          padding: 18px 24px; border-bottom: 1px solid #f0ede8;
          display: flex; justify-content: space-between; align-items: center;
        }
        .scanner-title {
          font-weight: 800; font-size: 16px; color: #2a2a2a;
          display: flex; align-items: center; gap: 8px; letter-spacing: -0.3px;
        }
        .scanner-close {
          background: #faf8f5; border: 1px solid #e4e0d9; cursor: pointer;
          color: #8a857e; width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; transition: all 0.2s;
        }
        .scanner-close:hover { background: #ffffff; color: #6b2737; border-color: #6b2737; }
        
        .scanner-body { padding: 24px; max-height: 520px; overflow-y: auto; }
        
        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block; font-size: 11px; font-weight: 700; color: #8a857e;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;
        }
        .form-select {
          width: 100%; padding: 9px 14px; border-radius: 10px;
          border: 1px solid #e4e0d9; background: #faf8f5; font-size: 13px;
          color: #2a2a2a; outline: none; font-family: inherit; font-weight: 500;
        }

        .sample-pills { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
        .sample-btn {
          background: #faf8f5; border: 1px solid #e4e0d9; border-radius: 20px;
          padding: 3px 10px; font-size: 11px; font-weight: 600; color: #6a655e; cursor: pointer;
          transition: all 0.2s;
        }
        .sample-btn:hover { background: #6b2737; color: #ffffff; border-color: #6b2737; }

        .scanner-textarea {
          width: 100%; height: 110px; border: 1px solid #e4e0d9; border-radius: 12px;
          padding: 12px; font-family: inherit; font-size: 13px; outline: none;
          resize: none; background: #faf8f5; color: #2a2a2a; box-sizing: border-box;
          line-height: 1.5;
        }

        .preview-card {
          margin-top: 16px; background: #faf8f5; border: 1px solid #e4e0d9;
          border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .confidence-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .conf-badge {
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px;
          background: #ffffff; color: #6b2737; border: 1px solid #e4e0d9; font-family: 'Space Mono', monospace;
        }

        .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 4px; }
        .edit-input {
          padding: 8px 10px; border: 1px solid #e4e0d9; border-radius: 8px; font-size: 12px; width: 100%; box-sizing: border-box; background: #ffffff;
        }

        .dup-warning {
          font-size: 12px; color: #854d0e; background: #fef9c3; border: 1px solid #fde68a;
          padding: 8px 12px; border-radius: 8px; font-weight: 500;
        }

        .match-option-btn {
          text-align: left; background: #ffffff; border: 1px solid #e4e0d9;
          border-radius: 8px; padding: 8px 12px; font-size: 12px; cursor: pointer; width: 100%;
          margin-bottom: 6px; transition: all 0.2s;
        }
        .match-option-btn:hover { border-color: #6b2737; background: #faf8f5; }
        .match-option-btn.selected { border-color: #6b2737; background: #faf8f5; font-weight: 700; }

        .scanner-footer {
          padding: 16px 24px; border-top: 1px solid #f0ede8; background: #faf8f5;
          display: flex; justify-content: flex-end; gap: 12px;
        }
        .btn-scan {
          background: #6b2737; color: #ffffff; border: none; padding: 9px 20px;
          border-radius: 20px; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 0.2s;
        }
        .btn-scan:hover { background: #541e2b; }
        .btn-confirm {
          background: #2d6a4f; color: #ffffff; border: none; padding: 9px 20px;
          border-radius: 20px; font-weight: 700; font-size: 12px; cursor: pointer; transition: background 0.2s;
        }
        .btn-confirm:hover { background: #1b4332; }
      `}</style>

      <div className="scanner-modal">
        <div className="scanner-header">
          <div className="scanner-title">📥 AI Email Scanner & Validator</div>
          <button className="scanner-close" onClick={onClose}>✕</button>
        </div>

        <div className="scanner-body">
          {/* TARGET SELECTOR */}
          <div className="form-group">
            <label className="form-label">Target Application (Optional)</label>
            <select
              className="form-select"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            >
              <option value="">✨ Auto-Detect Company with AI</option>
              {internships.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.company} — {app.role} ({app.status})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Email Content</label>
            <div className="sample-pills">
              {SAMPLES.map((s, i) => (
                <button key={i} className="sample-btn" onClick={() => { setEmailText(s.text); setError(""); }}>
                  Try {s.label}
                </button>
              ))}
            </div>
            <textarea
              className="scanner-textarea"
              placeholder="Paste email text here..."
              value={emailText}
              onChange={(e) => { setEmailText(e.target.value); setError(""); }}
            />
          </div>

          {error && <div style={{ color: "#ef4444", fontSize: "13px", fontWeight: "500", marginTop: "4px" }}>{error}</div>}

          {/* STEP 1 PREVIEW CARD */}
          {preview && preview.parsed && (
            <div className="preview-card">
              {preview.isDuplicate && (
                <div className="dup-warning">
                  ⚠️ Duplicate Notice: This email text was previously scanned on {preview.duplicateDate}.
                </div>
              )}

              <div className="confidence-row">
                <span className="conf-badge">🎯 Company Conf: {Math.round((preview.parsed.company_confidence || 0.9) * 100)}%</span>
                <span className="conf-badge">⚡ Status Conf: {Math.round((preview.parsed.status_confidence || 0.9) * 100)}%</span>
                <span className="conf-badge">📅 Date Conf: {Math.round((preview.parsed.date_confidence || 0.8) * 100)}%</span>
              </div>

              <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "16px" }}>
                {preview.parsed.company || "Company Detected"} — <span style={{ color: "#475569", fontWeight: "500" }}>{preview.parsed.role || "Role"}</span>
              </div>

              <div style={{ fontSize: "13px", color: "#475569" }}>
                {preview.parsed.summary}
              </div>

              {/* LOW CONFIDENCE MATCH PICKER */}
              {!targetId && preview.parsed.company_confidence < 0.85 && preview.possibleMatches?.length > 1 && (
                <div style={{ marginTop: "4px" }}>
                  <label className="form-label">Multiple Matches Found — Select Target:</label>
                  {preview.possibleMatches.map((m) => (
                    <button
                      key={m._id}
                      className={`match-option-btn ${targetId === m._id ? "selected" : ""}`}
                      onClick={() => setTargetId(m._id)}
                    >
                      🟢 {m.company} ({m.role}) • Current: {m.status}
                    </button>
                  ))}
                </div>
              )}

              {/* EDITABLE OVERRIDES BEFORE CONFIRMATION */}
              <div className="edit-grid">
                <div>
                  <label className="form-label">Status Override</label>
                  <select
                    className="edit-input"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                  >
                    {["Applied", "Interview", "OA", "Offer", "Rejected", "No Response"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Event / Deadline Date</label>
                  <input
                    type="date"
                    className="edit-input"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="scanner-footer">
          {loading ? (
            <button className="btn-scan" disabled style={{ opacity: 0.8, cursor: "wait" }}>
              ⚡ Scanning in Real Time...
            </button>
          ) : preview ? (
            <button className="btn-confirm" onClick={handleConfirmUpdate} disabled={confirming}>
              {confirming ? "Updating..." : `✅ Confirm & Update ${preview.parsed?.company || "Dashboard"} to "${customStatus}"`}
            </button>
          ) : (
            <button className="btn-scan" onClick={() => runRealTimeScan(emailText, targetId)} disabled={!emailText.trim()}>
              ✨ Scan Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
