import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";

const styles = `
  .integrations-root {
    display: flex;
    min-height: 100vh;
    background: #f5f3ef;
    font-family: 'Outfit', -apple-system, sans-serif;
    color: #2a2a2a;
  }

  .integrations-main {
    flex: 1;
    padding: 32px 40px;
    overflow-y: auto;
  }

  .header-title {
    font-size: 28px;
    font-weight: 800;
    color: #2a2a2a;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
  }

  .header-sub {
    font-size: 14px;
    color: #8a857e;
    margin-bottom: 32px;
  }

  .integrations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }

  .card {
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(107, 39, 55, 0.08);
  }

  .card-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #faf8f5;
    border: 1px solid #e4e0d9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 20px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 800;
    color: #2a2a2a;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .badge-active {
    font-size: 10px;
    font-weight: 700;
    background: #dcfce7;
    color: #166534;
    padding: 2px 8px;
    border-radius: 20px;
    font-family: 'Space Mono', monospace;
    text-transform: uppercase;
  }

  .card-desc {
    font-size: 13px;
    color: #5a5650;
    line-height: 1.5;
    margin-bottom: 20px;
    flex: 1;
  }

  .btn-primary {
    background: #6b2737;
    color: #ffffff;
    border: none;
    border-radius: 20px;
    padding: 10px 18px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    font-family: inherit;
    box-shadow: 0 4px 12px rgba(107, 39, 55, 0.25);
    display: inline-block;
    text-align: center;
    text-decoration: none;
  }
  .btn-primary:hover {
    background: #541e2b;
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: #faf8f5;
    color: #2a2a2a;
    border: 1px solid #e4e0d9;
    border-radius: 20px;
    padding: 10px 18px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    display: inline-block;
  }
  .btn-secondary:hover {
    background: #eae7e2;
    border-color: #d4cfc7;
  }

  .import-area {
    width: 100%;
    min-height: 110px;
    border: 1px dashed #d4cfc7;
    background: #faf8f5;
    border-radius: 12px;
    padding: 12px;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #2a2a2a;
    margin-bottom: 12px;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
  }
  .import-area:focus {
    border-color: #6b2737;
    background: #ffffff;
  }

  .preview-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f0ede8;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    color: #6a655e;
    margin-bottom: 14px;
  }
`;

export default function Integrations() {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [parsedPreviewCount, setParsedPreviewCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Calendar Export
  const handleExportCalendar = () => {
    const token = localStorage.getItem("token");
    window.open(`http://localhost:5000/api/me/calendar.ics?token=${token}`, "_blank");
    setToast({ message: "Calendar .ics feed downloaded!", type: "success" });
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/internships", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch applications");
      const items = await res.json();

      if (!items.length) {
        setToast({ message: "No applications found to export.", type: "error" });
        return;
      }

      const headers = ["Company", "Role", "Status", "Applied Date", "Deadline", "Match Score", "Notes"];
      const rows = items.map(item => [
        `"${(item.company || "").replace(/"/g, '""')}"`,
        `"${(item.role || "").replace(/"/g, '""')}"`,
        `"${item.status || "Applied"}"`,
        `"${item.appliedDate || ""}"`,
        `"${item.deadline || ""}"`,
        `"${item.matchScore !== undefined ? item.matchScore + "%" : ""}"`,
        `"${(item.notes || "").replace(/"/g, '""')}"`
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `deadlinedesk_applications_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast({ message: `Exported ${items.length} applications to CSV!`, type: "success" });
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  // Live CSV Parsing
  const parseCSVLines = (text) => {
    if (!text.trim()) return [];
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length <= 1 && (lines[0].includes("Company") || lines[0].includes("company"))) return [];

    const startIdx = lines[0].toLowerCase().includes("company") ? 1 : 0;
    const apps = [];

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");
      if (parts.length >= 2) {
        const company = parts[0]?.replace(/^"|"$/g, "").trim();
        const role = parts[1]?.replace(/^"|"$/g, "").trim();
        const status = parts[2]?.replace(/^"|"$/g, "").trim() || "Applied";
        const appliedDate = parts[3]?.replace(/^"|"$/g, "").trim() || new Date().toISOString().slice(0,10);
        const deadline = parts[4]?.replace(/^"|"$/g, "").trim() || "";
        const notes = parts[5]?.replace(/^"|"$/g, "").trim() || "";

        if (company && role) {
          apps.push({ company, role, status, appliedDate, deadline, notes });
        }
      }
    }
    return apps;
  };

  const handleCsvChange = (e) => {
    const val = e.target.value;
    setCsvText(val);
    const parsed = parseCSVLines(val);
    setParsedPreviewCount(parsed.length);
  };

  // Bulk Import
  const handleBulkImport = async () => {
    const applications = parseCSVLines(csvText);
    if (!applications.length) {
      setToast({ message: "Please enter at least 1 valid row (Company, Role)", type: "error" });
      return;
    }

    setImporting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/internships/bulk-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ applications })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to import");

      setToast({
        message: `🎉 Imported ${data.importedCount} application(s)! (${data.skippedCount} duplicates skipped)`,
        type: "success"
      });
      setCsvText("");
      setParsedPreviewCount(0);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="integrations-root">
        <Sidebar />
        <div className="integrations-main">
          <div className="header-title">Data & Workflow Tools</div>
          <div className="header-sub">Import your existing spreadsheets, export your tracker, and sync calendar deadlines</div>

          <div className="integrations-grid">
            {/* SPREADSHEET / CSV IMPORTER */}
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <div className="card-icon-wrap">📑</div>
              <div className="card-title">
                Import from Google Sheets or Excel (CSV)
                <span className="badge-active">Instant Onboarding</span>
              </div>
              <div className="card-desc">
                Already tracking applications in a spreadsheet? Paste your rows below (or CSV text), and DeadlineDesk will populate your board in seconds.
                <br />
                <span style={{ fontSize: "11px", color: "#8a857e", marginTop: "4px", display: "inline-block" }}>
                  Expected format: <strong>Company, Role, Status, Applied Date, Deadline, Notes</strong> (Comma or Tab separated)
                </span>
              </div>

              <textarea
                className="import-area"
                placeholder={`Google, Software Engineer Intern, Applied, 2026-09-01, 2026-09-20\nStripe, Backend Intern, Interview, 2026-09-02, 2026-09-25\nAmazon, Frontend Intern, OA, 2026-09-03, 2026-09-15`}
                value={csvText}
                onChange={handleCsvChange}
              />

              {parsedPreviewCount > 0 && (
                <div className="preview-pill">
                  ✅ Detected {parsedPreviewCount} valid application row(s) ready to import
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  className="btn-primary"
                  onClick={handleBulkImport}
                  disabled={importing || parsedPreviewCount === 0}
                  style={{ opacity: parsedPreviewCount === 0 ? 0.6 : 1 }}
                >
                  {importing ? "Importing..." : `Import ${parsedPreviewCount} Applications`}
                </button>
                {csvText && (
                  <button className="btn-secondary" onClick={() => { setCsvText(""); setParsedPreviewCount(0); }}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* EXCEL / CSV EXPORTER */}
            <div className="card">
              <div className="card-icon-wrap">📤</div>
              <div className="card-title">
                Export to Excel / CSV
                <span className="badge-active">Zero Lock-in</span>
              </div>
              <div className="card-desc">
                Download your complete application dataset including companies, roles, status, deadlines, and resume match scores into a clean `.csv` file anytime.
              </div>
              <button className="btn-secondary" onClick={handleExportCSV}>
                Download Applications (.csv)
              </button>
            </div>

            {/* GOOGLE CALENDAR CARD */}
            <div className="card">
              <div className="card-icon-wrap">📅</div>
              <div className="card-title">
                Google & Apple Calendar
                <span className="badge-active">Ready</span>
              </div>
              <div className="card-desc">
                Export your interview dates and OA deadlines directly into your Google Calendar or Apple Calendar feed.
              </div>
              <button className="btn-primary" onClick={handleExportCalendar}>
                Export Calendar (.ics)
              </button>
            </div>

            {/* GMAIL & EMAIL SYNC CARD */}
            <div className="card">
              <div className="card-icon-wrap">📥</div>
              <div className="card-title">
                AI Email Scanner
                <span className="badge-active">Active</span>
              </div>
              <div className="card-desc">
                Parse job updates (OAs, interview invites, rejections) automatically using Gemini AI and sync them to your dashboard in 1 click.
              </div>
              <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
                Go to Dashboard Scanner
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />}
    </>
  );
}
