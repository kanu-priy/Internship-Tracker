/* global chrome */
import React, { useEffect, useState, useCallback, useRef} from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import KanbanBoard from "../components/KanbanBoard";
import AIAssistModal from "../components/AIAssistModal";
import EmailScannerModal from "../components/EmailScannerModal";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";

const EXTENSION_ID = "hlbpahiogcemdholecbgommhgdppcfdj";
const STATUSES = ["Applied", "Interview", "OA", "Offer", "Rejected"];

const statusDotColors = {
  Applied: "#60a5fa",
  Interview: "#fbbf24",
  OA: "#a78bfa",
  Offer: "#34d399",
  Rejected: "#f87171",
};
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  .main { flex: 1; padding: 32px 40px; overflow-y: auto; background: var(--bg); color: var(--text); font-family: 'Inter', -apple-system, sans-serif; }
  
  .top-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .top-left { display: flex; flex-direction: column; gap: 4px; }
  .header-date { font-size: 13px; color: #6b7280; font-weight: 500; }
  .header-greeting { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px; }
  
  .top-right { display: flex; gap: 16px; align-items: center; }
  .metric-box { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 10px 16px; display: flex; flex-direction: column; }
  .metric-label { font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
  .metric-value { font-size: 18px; font-weight: 700; color: var(--text); }
  
  .add-btn { background: var(--primary); color: #ffffff; padding: 10px 20px; border-radius: 12px; font-weight: 500; font-size: 14px; text-decoration: none; border: none; cursor: pointer; transition: background 0.2s; }
  .add-btn:hover { background: #1e293b; }
  
  .row-1 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
  .card-title { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  
  .nba-msg { font-size: 14px; color: #4b5563; margin-bottom: 16px; line-height: 1.5; }
  .nba-link { display: inline-block; background: #f3f4f6; color: var(--text); padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; }
  
  .stale-list { display: flex; flex-direction: column; gap: 12px; }
  .stale-item { display: flex; justify-content: space-between; align-items: center; font-size: 14px; padding: 8px 0; border-bottom: 1px solid #f9fafb; }
  .stale-item:last-child { border-bottom: none; padding-bottom: 0; }
  .stale-info { display: flex; align-items: center; gap: 10px; color: #4b5563; }
  .stale-dot { width: 8px; height: 8px; border-radius: 50%; }
  .stale-days { font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 12px; }
  
  .row-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
  .status-blocks { display: flex; gap: 12px; }
  .status-block { flex: 1; background: #f9fafb; border: 1px solid var(--border); border-radius: 12px; padding: 16px; text-align: center; }
  .status-val { font-size: 24px; font-weight: 700; margin-bottom: 4px; color: var(--text); }
  .status-lbl { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
  
  .closing-list { display: flex; flex-direction: column; gap: 8px; }
  .closing-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f9fafb; border-radius: 8px; }
  .closing-company { font-size: 13px; font-weight: 600; color: var(--text); }
  .closing-days { font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 12px; }
  .badge-urgent { background: #fee2e2; color: #b91c1c; }
  .badge-soon { background: #fef3c7; color: #b45309; }
  .badge-ok { background: #dbeafe; color: #1d4ed8; }
  
  .row-3 { display: flex; flex-direction: column; gap: 16px; }
  .filters { display: flex; gap: 12px; }
  .filter-input { flex: 1; padding: 10px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; font-size: 14px; color: var(--text); outline: none; }
  .filter-select { padding: 10px 14px; border: 1px solid var(--border); border-radius: 12px; font-size: 14px; color: var(--text); outline: none; background: var(--surface); }
  
  .table-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; text-align: left; }
  th { padding: 14px 20px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 1px solid var(--border); background: #f9fafb; }
  td { padding: 16px 20px; font-size: 14px; color: #4b5563; border-bottom: 1px solid #f9fafb; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  .td-company { font-weight: 600; color: var(--text); }
  
  .match-badge { font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 8px; }
  .match-high { background: #d1fae5; color: #059669; }
  .match-mid { background: #fef3c7; color: #d97706; }
  .match-low { background: #fee2e2; color: #dc2626; }
  
  .btn-text { padding: 6px 12px; font-size: 13px; font-weight: 500; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: #4b5563; cursor: pointer; transition: all 0.2s; margin-right: 8px; }
  .btn-text:hover { background: #f9fafb; color: var(--text); }
  .btn-delete { padding: 6px 12px; font-size: 13px; font-weight: 500; border: none; background: transparent; color: #9ca3af; cursor: pointer; }
  .btn-delete:hover { color: #dc2626; }
  
  .notes-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .notes-modal { background: var(--surface); border: 1px solid var(--border); box-shadow: 0 20px 40px rgba(0,0,0,0.1); border-radius: 12px; padding: 24px; width: 400px; max-width: 90vw; }
  .notes-modal h3 { color: var(--text); font-family: 'Inter', sans-serif; margin-bottom: 16px; font-size: 18px; }
  .notes-modal textarea { background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 12px; width: 100%; height: 150px; padding: 12px; font-family: 'Inter', sans-serif; resize: none; outline: none; margin-bottom: 16px; }
  .notes-actions { display: flex; gap: 12px; justify-content: flex-end; }
  .notes-save-btn { background: var(--primary); color: #ffffff; border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-weight: 500; }
  .notes-close-btn { background: var(--surface); border: 1px solid var(--border); color: #4b5563; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-weight: 500; }
  
  .timeline-drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.4); z-index: 1000; display: flex; justify-content: flex-end; }
  .timeline-drawer { background: var(--surface); border-left: 1px solid var(--border); width: 350px; height: 100vh; display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.1); }
  .timeline-drawer-header { border-bottom: 1px solid var(--border); padding: 20px; display: flex; justify-content: space-between; align-items: center; }
  .timeline-drawer-title { color: var(--text); font-size: 18px; font-weight: 600; margin-bottom: 4px; }
  .timeline-drawer-sub { color: #6b7280; font-size: 13px; }
  .timeline-drawer-close { color: #4b5563; background: #f9fafb; border: 1px solid var(--border); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .timeline-body { padding: 24px; overflow-y: auto; flex: 1; }
  .timeline-empty { color: #6b7280; font-size: 14px; text-align: center; padding-top: 40px; }
  .timeline-list { display: flex; flex-direction: column; gap: 24px; position: relative; }
  .timeline-list::before { content: ''; position: absolute; left: 5px; top: 10px; bottom: 10px; width: 2px; background: #eaeaea; }
  .timeline-entry { position: relative; padding-left: 24px; }
  .timeline-dot { position: absolute; left: 0; top: 4px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; }
  .timeline-entry-status { color: var(--text); font-weight: 600; font-size: 15px; margin-bottom: 2px; }
  .timeline-entry-date { color: #6b7280; font-size: 12px; margin-bottom: 8px; }
  .timeline-entry-note { color: #4b5563; font-size: 13px; background: #f9fafb; padding: 10px; border-radius: 8px; border: 1px solid #eaeaea; }
  
  .status-dropdown { background: var(--surface); border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 12px; position: absolute; top: 100%; left: 0; width: 150px; z-index: 100; margin-top: 4px; padding: 8px; }
  .status-option { color: var(--text); padding: 8px 12px; font-size: 13px; cursor: pointer; border-radius: 6px; display: flex; align-items: center; }
  .status-option:hover { background: #f9fafb; }

  /* Base classes for dots and texts */
  .status-text { font-size: 12px; font-weight: 600; }
  .s-applied { color: #3b82f6; }
  .s-interview { color: #f59e0b; }
  .s-oa { color: #8b5cf6; }
  .s-offer { color: #10b981; }
  .s-rejected { color: #ef4444; }
`;

const statConfig = {
  Applied:  { color: "#3b82f6", glow: "rgba(59,130,246,0.4)" },
  Interview:{ color: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  OA:       { color: "#8b5cf6", glow: "rgba(139,92,246,0.4)" },
  Offer:    { color: "#10b981", glow: "rgba(16,185,129,0.4)" },
  Rejected: { color: "#ef4444", glow: "rgba(239,68,68,0.4)" },
};


function StatusCell({ item, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function pick(status) {
    if (status === item.status) {
      setOpen(false);
      return;
    }

    setSaving(true);
    setOpen(false);

    await onStatusChange(item._id, status);

    setSaving(false);
  }

  const sClass = `s-${item.status.toLowerCase().replace(" ", "")}`;

  return (
    <div
      ref={ref}
      className="status-select-wrap"
      style={{
        zIndex: open ? 99999 : 1,
        marginBottom: open ? "180px" : "0px",
      }}
    >
      <span
        className={`status-text ${sClass}`}
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", display: "inline-block" }}
      >
        {saving ? "..." : item.status}
      </span>

      {open && (
        <div className="status-dropdown">
          {STATUSES.map((status) => (
            <div
              key={status}
              className="status-option"
              onClick={() => pick(status)}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: statusDotColors[status],
                  display: "inline-block",
                  marginRight: "10px",
                }}
              />
              {status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
//------------------NOTESMODEL---------------------------//
function NotesModal({ item, onSave, onClose }) {
  const [text, setText] = useState(item.notes || "");

  async function handleSave() {
  console.log("modal text:", text);
  await onSave(item._id, text);
  onClose();
}

  return (
    <div className="notes-modal-overlay">
      <div className="notes-modal">
        <h3>Notes</h3>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="notes-actions">
  <button className="notes-save-btn" onClick={handleSave}>
    Save
  </button>

  <button className="notes-close-btn" onClick={onClose}>
    Close
  </button>
</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]                 = useState({});
  const [internships, setInternships]   = useState([]);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder]       = useState("newest");
  const [loading, setLoading]           = useState(true);
  const [syncMsg, setSyncMsg]           = useState("");
  const [notesTarget, setNotesTarget] = useState(null);
  const [timelineTarget, setTimelineTarget] = useState(null); // V2.0
  const [matchingId, setMatchingId] = useState(null);         // V2.0
  const [hasResume, setHasResume] = useState(false);          // V2.0
  const [viewMode, setViewMode] = useState("list");           // 'list' or 'board'
  const [aiTarget, setAiTarget] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const isSyncing = React.useRef(false);

  // --------------------------------------------------
  // AUTH CHECK → fetch → sync extension queue
  // --------------------------------------------------


  // --------------------------------------------------
  // LOAD USER
  // --------------------------------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch { localStorage.removeItem("user"); }
    }
  }, []);

  // V2.0: Check if user has a resume saved (drives match score column UI)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:5000/api/me/resume", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setHasResume(!!(d.resumeText && d.resumeText.length > 0)))
      .catch(() => {});
  }, []);


  // --------------------------------------------------
  // FETCH INTERNSHIPS
  // ✅ ONE function only — fetches DB + syncs to extension
  // --------------------------------------------------
 const fetchInternships = useCallback(async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/internships", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      localStorage.clear();
      navigate("/login");
      return;
    }

    if (!res.ok) throw new Error("Fetch failed");

    const data = await res.json();
    setInternships(data);

    window.postMessage(
      {
        type: "DD_SYNC_SAVED",
        items: data.map((i) => ({
          company: i.company,
          role: i.role,
          status: i.status,
          appliedDate: i.appliedDate,
          deadline: i.deadline || "",
          savedAt: i.createdAt || new Date().toISOString(),
        })),
      },
      "*"
    );
  } catch (err) {
    console.error("❌ Fetch internships failed", err);
  } finally {
    setLoading(false);
  }
}, [navigate]);

  // --------------------------------------------------
  // AUTO SYNC FROM EXTENSION — safe, no data loss
  // --------------------------------------------------
  const autoSyncFromExtension = useCallback(async () => {
    if (isSyncing.current) return;
    
    isSyncing.current = true;

    const getPending = () => new Promise(resolve => {
      const handler = (e) => {
        if (e.data && e.data.type === "DD_PENDING_RESPONSE") {
          window.removeEventListener("message", handler);
          resolve(e.data.data);
        }
      };
      window.addEventListener("message", handler);
      window.postMessage({ type: "DD_GET_PENDING" }, "*");
      setTimeout(() => {
        window.removeEventListener("message", handler);
        resolve(null);
      }, 1000);
    });

    const items = await getPending();
    if (!items || items.length === 0) {
      isSyncing.current = false;
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      isSyncing.current = false;
      return;
    }

    let existing = [];
    try {
      const res = await fetch("http://localhost:5000/api/internships", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        isSyncing.current = false;
        return;
      }

      if (res.ok) existing = await res.json();
    } catch (_) {}

    const existingKeys = new Set(
      existing.map(
        (e) => `${e.company.toLowerCase().trim()}|${e.role.toLowerCase().trim()}|${String(e.appliedDate || "").slice(0, 10)}`
      )
    );

    const savedIndexes = [];
    const failedIndexes = [];

    for (let i = 0; i < items.length; i++) {
      const internship = items[i];

      if (!internship.company?.trim() || !internship.role?.trim()) {
        continue;
      }

      const key = `${internship.company.toLowerCase().trim()}|${internship.role.toLowerCase().trim()}|${String(internship.appliedDate || "").slice(0, 10)}`;

      if (existingKeys.has(key)) {
        savedIndexes.push(i);
        continue;
      }

      try {
        const res = await fetch("http://localhost:5000/api/internships", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(internship),
        });

        if (res.ok || res.status === 409) {
          savedIndexes.push(i);
        } else {
          failedIndexes.push(i);
        }
      } catch (_) {
        failedIndexes.push(i);
      }
    }

    if (failedIndexes.length === 0) {
      window.postMessage({ type: "DD_CLEAR_PENDING" }, "*");
      isSyncing.current = false;
      if (savedIndexes.length > 0) {
        setSyncMsg(`✅ ${savedIndexes.length} internship(s) synced from extension`);
        setTimeout(() => setSyncMsg(""), 4000);
        fetchInternships();
      }
    } else {
      isSyncing.current = false;
    }
  }, [navigate, fetchInternships]);

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  fetchInternships().then(() => autoSyncFromExtension());
}, [navigate, fetchInternships, autoSyncFromExtension]);

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this internship?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/internships/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (res.ok) {
        setInternships((prev) => prev.filter((item) => item._id !== id));
        fetchInternships(); // re-sync extension after delete
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------
  const handleEdit = (id) => { navigate(`/edit/${id}`); };
  const handleStatusChange = async (id, status) => {
  try {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/internships/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    fetchInternships();
  } catch (err) {
    console.error(err);
  }
};

const handleSaveNotes = async (id, notes) => {
  console.log("sending notes:", notes);

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/internships/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });

    const data = await res.json();
    console.log("response:", data);

    fetchInternships();
  } catch (err) {
    console.error(err);
  }
};
  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------
  const summary = internships.reduce(
    (acc, item) => { acc[item.status] = (acc[item.status] || 0) + 1; return acc; },
    { Applied: 0, Interview: 0, OA: 0, Offer: 0, Rejected: 0 }
  );

  // --------------------------------------------------
  // V2.0: Match Score — compute for single internship
  // --------------------------------------------------
  const handleMatchScore = async (internship) => {
    if (!hasResume) return;
    setMatchingId(internship._id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/internships/${internship._id}/match`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) fetchInternships();
    } catch (err) {
      console.error("Match error", err);
    }
    setMatchingId(null);
  };

  // --------------------------------------------------
  // V2.0: Career Score
  // --------------------------------------------------
  const careerScore = Math.min(100, Math.max(0,
    (summary.Applied   || 0) * 2  +
    (summary.OA        || 0) * 10 +
    (summary.Interview || 0) * 20 +
    (summary.Offer     || 0) * 40 -
    (summary.Rejected  || 0) * 3
  ));

  // --------------------------------------------------
  // V2.0: Closing Soon (top 3 by nearest deadline)
  // --------------------------------------------------
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const closingSoon = internships
    .filter((i) => i.deadline)
    .map((i) => {
      const due = new Date(i.deadline);
      due.setHours(0, 0, 0, 0);
      return { ...i, daysLeft: Math.round((due - todayDate) / 86400000) };
    })
    .filter((i) => i.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  // --------------------------------------------------
  // V2.0: Next Best Action
  // --------------------------------------------------
  function getNextBestAction() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 1. OA deadline ≤ 3 days
    const urgentOA = internships
      .filter((i) => i.status === "OA" && i.deadline)
      .map((i) => ({ ...i, daysLeft: Math.round((new Date(i.deadline) - now) / 86400000) }))
      .filter((i) => i.daysLeft >= 0 && i.daysLeft <= 3)
      .sort((a, b) => a.daysLeft - b.daysLeft)[0];
    if (urgentOA) return {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
      msg: `Prepare for your ${urgentOA.company} OA — ${urgentOA.daysLeft === 0 ? "it's today!" : urgentOA.daysLeft === 1 ? "it's tomorrow!" : `${urgentOA.daysLeft} days left.`} Review DSA: Arrays, Graphs, DP.`,
      action: null, link: null,
    };

    // 2. Interview ≤ 5 days
    const urgentInterview = internships
      .filter((i) => i.status === "Interview" && i.deadline)
      .map((i) => ({ ...i, daysLeft: Math.round((new Date(i.deadline) - now) / 86400000) }))
      .filter((i) => i.daysLeft >= 0 && i.daysLeft <= 5)
      .sort((a, b) => a.daysLeft - b.daysLeft)[0];
    if (urgentInterview) return {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      msg: `Interview at ${urgentInterview.company} in ${urgentInterview.daysLeft === 0 ? "today" : urgentInterview.daysLeft === 1 ? "tomorrow" : `${urgentInterview.daysLeft} days`}. Review your projects and prepare your intro.`,
      action: null, link: null,
    };

    // 3. Applied deadline tomorrow
    const deadlineTomorrow = internships
      .filter((i) => i.status === "Applied" && i.deadline)
      .map((i) => ({ ...i, daysLeft: Math.round((new Date(i.deadline) - now) / 86400000) }))
      .filter((i) => i.daysLeft === 1)[0];
    if (deadlineTomorrow) return {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      msg: `${deadlineTomorrow.company} deadline is tomorrow. Make sure your application is submitted!`,
      action: null, link: null,
    };

    // 4. Low match score
    const lowMatch = internships.find(
      (i) => i.matchScore !== null && i.matchScore !== undefined && i.matchScore < 60
    );
    if (lowMatch) return {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
      msg: `Your resume match for ${lowMatch.company} is only ${lowMatch.matchScore}%. Update your resume to highlight missing skills.`,
      action: "Update Resume", link: "/resume",
    };

    // 5. No apps in 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentApps = internships.filter((i) => new Date(i.createdAt) >= sevenDaysAgo);
    if (internships.length > 0 && recentApps.length === 0) return {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l3-3a22 22 0 0 1-3.95 12 22 22 0 0 1 12-3.95 22 22 0 0 0-3.95-12z"/><path d="M12 15l-3-3a22 22 0 0 1 3.95-12 22 22 0 0 1 12 3.95c-1.5 1.5-3 3-5 5"/></svg>,
      msg: "You haven't added any applications this week. Keep the momentum going!",
      action: "Browse LinkedIn", link: "https://www.linkedin.com/jobs/",
    };

    // 6. Empty state
    if (internships.length === 0) return {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      msg: "Welcome! Add your first internship or use the DeadlineDesk extension on LinkedIn to save jobs instantly.",
      action: "Add Internship", link: "/add",
    };

    // 7. Default — doing great
    return {
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
      msg: `Great work! You have ${internships.length} application${internships.length !== 1 ? "s" : ""} tracked. Keep applying!`,
      action: null, link: null,
    };
  }
  const nba = getNextBestAction();

  const today = new Date();
  today.setHours(0,0,0,0);
  const staleApps = internships.map(app => {
    let lastUpdateDate = app.updatedAt || app.createdAt || app.appliedDate;
    if (app.timeline && app.timeline.length > 0) {
      const lastEntry = app.timeline[app.timeline.length - 1].date;
      if (lastEntry) lastUpdateDate = lastEntry;
    }
    const staleDays = Math.round((today - new Date(lastUpdateDate)) / 86400000);
    return { ...app, staleDays };
  }).filter(app => app.staleDays >= 7 && app.status !== "Rejected" && app.status !== "Offer")
    .sort((a, b) => b.staleDays - a.staleDays);

  // --------------------------------------------------
  // FILTER + SORT
  // --------------------------------------------------
  const filteredInternships = internships
    .map(app => {
      let lastUpdateDate = app.updatedAt || app.createdAt || app.appliedDate;
      if (app.timeline && app.timeline.length > 0) {
        const lastEntry = app.timeline[app.timeline.length - 1].date;
        if (lastEntry) lastUpdateDate = lastEntry;
      }
      const staleDays = Math.round((today - new Date(lastUpdateDate)) / 86400000);
      return { ...app, staleDays };
    })
    .filter((item) => {
      if (filterStatus !== "All" && item.status !== filterStatus) return false;
      if (search &&
        !item.company.toLowerCase().includes(search.toLowerCase()) &&
        !item.role.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.appliedDate), db = new Date(b.appliedDate);
      return sortOrder === "newest" ? db - da : da - db;
    });

  return (
    <>
      <style>{styles}</style>

      {/* Original Notes modal — unchanged */}
      {notesTarget && (
        <NotesModal
          item={notesTarget}
          onSave={handleSaveNotes}
          onClose={() => setNotesTarget(null)}
        />
      )}

      {/* V2.0: Timeline Drawer */}
      {timelineTarget && (
        <div
          className="timeline-drawer-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setTimelineTarget(null); }}
        >
          <div className="timeline-drawer">
            <div className="timeline-drawer-header">
              <div>
                <div className="timeline-drawer-title">{timelineTarget.company}</div>
                <div className="timeline-drawer-sub">{timelineTarget.role} · Status History</div>
              </div>
              <button className="timeline-drawer-close" onClick={() => setTimelineTarget(null)}>✕</button>
            </div>
            <div className="timeline-body">
              {(!timelineTarget.timeline || timelineTarget.timeline.length === 0) ? (
                <div className="timeline-empty">
                  No status history yet.<br />Status changes will appear here automatically.
                </div>
              ) : (
                <div className="timeline-list">
                  {timelineTarget.timeline.map((entry, idx) => {
                    const dotColor = {
                      Applied: "#60a5fa", Interview: "#fbbf24", OA: "#a78bfa",
                      Offer: "#34d399", Rejected: "#f87171",
                    }[entry.status] || "#888";
                    return (
                      <div key={idx} className="timeline-entry">
                        <div className="timeline-dot" style={{ background: dotColor }} />
                        <div className="timeline-entry-status">{entry.status}</div>
                        <div className="timeline-entry-date">{entry.date}</div>
                        {entry.note && <div className="timeline-entry-note">{entry.note}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <Sidebar />
        <div className="main" style={{ display: 'flex', flexDirection: 'column' }}>
          
          <div className="top-row">
            <div className="top-left">
              <div className="header-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
              <div className="header-greeting">Good morning, {user.name || "User"}</div>
            </div>
            <div className="top-right">
              <div className="metric-box">
                <span className="metric-label">Career Score</span>
                <span className="metric-value">{careerScore}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Total Applications</span>
                <span className="metric-value">{internships.length}</span>
              </div>
              <button className="add-btn" style={{ background: '#3b82f6' }} onClick={() => setShowScanner(true)}>
                📥 Scan Email
              </button>
              <a href="/add" className="add-btn">+ Add Internship</a>
            </div>
          </div>

          {syncMsg && <div style={{ background: '#d1fae5', color: '#059669', padding: '10px 16px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px' }}>{syncMsg}</div>}

          {!loading && (
            <div className="row-1">
              <div className="card">
                <div className="card-title">{nba.icon} Next Best Action</div>
                <div className="nba-msg">{nba.msg}</div>
                {nba.action && (
                  <a href={nba.link || "#"} className="nba-link" target={nba.link?.startsWith('http') ? '_blank' : '_self'}>
                    {nba.action} →
                  </a>
                )}
              </div>
              
              <div className="card">
                <div className="card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Needs Attention</div>
                {staleApps.length === 0 ? (
                  <div style={{ color: '#6b7280', fontSize: '14px' }}>All caught up!</div>
                ) : (
                  <div className="stale-list">
                    {staleApps.slice(0, 4).map(app => (
                      <div key={app._id} className="stale-item">
                        <div className="stale-info">
                          <div className="stale-dot" style={{ background: app.staleDays >= 14 ? '#ef4444' : app.staleDays >= 10 ? '#f59e0b' : '#3b82f6' }}></div>
                          <span><strong>{app.company}</strong> — {app.status}</span>
                        </div>
                        <span className="stale-days">{app.staleDays}d ago</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="row-2">
            <div className="card">
              <div className="card-title">Status Summary</div>
              <div className="status-blocks">
                {['Applied', 'Interview', 'OA', 'Offer', 'Rejected'].map(status => (
                  <div className="status-block" key={status} onClick={() => setFilterStatus(filterStatus === status ? "All" : status)} style={{ cursor: 'pointer' }}>
                    <div className="status-val">{summary[status] || 0}</div>
                    <div className="status-lbl">{status}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card">
              <div className="card-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Closing Soon</div>
              {closingSoon.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#6b7280', padding: '16px 0' }}>No upcoming deadlines</div>
              ) : (
                <div className="closing-list">
                  {closingSoon.map((item) => (
                    <div key={item._id} className="closing-item">
                      <span className="closing-company" title={`${item.company} — ${item.role}`}>{item.company}</span>
                      <span className={`closing-days ${item.daysLeft === 0 ? 'badge-urgent' : item.daysLeft <= 3 ? 'badge-soon' : 'badge-ok'}`}>
                        {item.daysLeft === 0 ? 'Today!' : item.daysLeft === 1 ? 'Tomorrow' : `${item.daysLeft}d`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="row-3">
            <div className="filters">
              <input type="text" className="filter-input" placeholder="Search company or role..." value={search} onChange={e => setSearch(e.target.value)} />
              <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Status</option>
                {Object.keys(summary).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="filter-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
                <button 
                  onClick={() => setViewMode('list')} 
                  style={{ background: viewMode === 'list' ? '#fff' : 'transparent', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: viewMode === 'list' ? 600 : 400, boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
                  List
                </button>
                <button 
                  onClick={() => setViewMode('board')} 
                  style={{ background: viewMode === 'board' ? '#fff' : 'transparent', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: viewMode === 'board' ? 600 : 400, boxShadow: viewMode === 'board' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}>
                  Board
                </button>
              </div>
            </div>

            <div className="table-card" style={viewMode === 'board' ? { border: 'none', background: 'transparent' } : {}}>
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>Loading your applications...</div>
              ) : filteredInternships.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
                  <div style={{ marginBottom: '16px', color: '#9ca3af' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>No internships yet</div>
                  <div style={{ fontSize: '13px' }}>Start tracking your applications and stay organized.</div>
                </div>
              ) : viewMode === 'board' ? (
                <KanbanBoard 
                  internships={filteredInternships} 
                  onStatusChange={handleStatusChange} 
                  onActionClick={(action, item) => {
                    if (action === 'timeline') setTimelineTarget(item);
                    if (action === 'notes') setNotesTarget(item);
                    if (action === 'ai') setAiTarget(item);
                  }}
                />
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Applied</th>
                      <th>Match</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInternships.map(item => (
                      <tr key={item._id}>
                        <td className="td-company">{item.company}</td>
                        <td className="td-role">
                          {item.role}
                          {item.resumeUsed && (
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>📄 {item.resumeUsed}</div>
                          )}
                        </td>
                        <td><StatusCell item={item} onStatusChange={handleStatusChange} /></td>
                        <td className="td-date">{item.appliedDate}</td>
                        <td>
                          {item.matchScore != null ? (
                            <span className={`match-badge ${item.matchScore >= 80 ? 'match-high' : item.matchScore >= 50 ? 'match-mid' : 'match-low'}`}>{item.matchScore}%</span>
                          ) : hasResume ? (
                            <button className="btn-text" disabled={matchingId === item._id} onClick={() => handleMatchScore(item)}>{matchingId === item._id ? '...' : 'Check'}</button>
                          ) : (
                            <a href="/resume" style={{fontSize: '12px', color: '#6b7280', textDecoration: 'none'}}>+ Resume</a>
                          )}
                        </td>
                        <td className="td-actions">
                          <button className="btn-text" style={{ color: '#b5763b' }} onClick={() => setAiTarget(item)}>✨ AI Assist</button>
                          <button className="btn-text" onClick={() => setTimelineTarget(item)}>Timeline</button>
                          <button className="btn-text" onClick={() => setNotesTarget(item)}>Notes</button>
                          <button className="btn-text" onClick={() => handleEdit(item._id)}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDelete(item._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {aiTarget && (
        <AIAssistModal
          internship={aiTarget}
          onClose={() => setAiTarget(null)}
        />
      )}

      {showScanner && (
        <EmailScannerModal
          onClose={() => setShowScanner(false)}
          onUpdateSuccess={(updatedItem) => {
            fetchInternships();
            setToast({
              message: `Updated ${updatedItem.company} status to "${updatedItem.status}"!`,
              type: "success"
            });
          }}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </>
  );
}