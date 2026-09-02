import React, { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "../components/Sidebar";
import KanbanBoard from "../components/KanbanBoard";
import AIAssistModal from "../components/AIAssistModal";
import EmailScannerModal from "../components/EmailScannerModal";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";

const STATUSES = ["Applied", "Interview", "OA", "Offer", "Rejected"];

const statusDotColors = {
  Applied: "#60a5fa",
  Interview: "#fbbf24",
  OA: "#a78bfa",
  Offer: "#34d399",
  Rejected: "#f87171",
};
const styles = `
  .main { flex: 1; padding: 28px 36px; overflow-y: auto; background: #f5f3ef; color: #2a2a2a; font-family: 'Outfit', -apple-system, sans-serif; }
  
  .top-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; }
  .top-left { display: flex; flex-direction: column; gap: 4px; }
  .header-date { font-size: 11px; color: #8a857e; font-weight: 700; font-family: 'Space Mono', monospace; text-transform: uppercase; letter-spacing: 1px; }
  .header-greeting { font-size: 32px; font-weight: 800; color: #2a2a2a; letter-spacing: -0.6px; line-height: 1.1; }
  .header-sub { font-size: 13px; color: #8a857e; margin-top: 2px; }
  
  .top-right { display: flex; gap: 14px; align-items: center; }
  
  .score-widget {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid #e4e0d9;
    border-radius: 16px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .score-circle-svg { width: 48px; height: 48px; transform: rotate(-90deg); }
  
  .add-btn { background: #6b2737; color: #ffffff; padding: 9px 18px; border-radius: 20px; font-weight: 700; font-size: 12px; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(107, 39, 55, 0.25); display: flex; align-items: center; gap: 6px; }
  .add-btn:hover { background: #541e2b; transform: translateY(-1px); }
  
  .scan-btn { background: #ffffff; color: #5a5650; border: 1px solid #d5d0c9; padding: 9px 16px; border-radius: 20px; font-weight: 600; font-size: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .scan-btn:hover { border-color: #6b2737; color: #6b2737; background: #ffffff; }
  
  .priority-stack { margin-bottom: 28px; }
  .priority-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 11px; font-weight: 700; color: #6b2737; text-transform: uppercase; letter-spacing: 0.8px; }
  
  .priority-card {
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 14px;
    padding: 16px 20px;
    position: relative;
    overflow: hidden;
    margin-bottom: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .priority-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(107, 39, 55, 0.08);
  }
  .priority-stripe-urgent { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #c1121f; }
  .priority-stripe-soon { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #c17817; }
  .priority-stripe-stale { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: #b0aaa2; }
  
  .row-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
  .card { background: #ffffff; border: 1px solid #e4e0d9; border-radius: 16px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
  .card-title { font-size: 11px; font-weight: 700; color: #8a857e; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  
  .status-blocks { display: flex; gap: 10px; }
  .status-block { flex: 1; background: #faf8f5; border: 1px solid #e4e0d9; border-radius: 12px; padding: 14px 8px; text-align: center; transition: all 0.2s; cursor: pointer; }
  .status-block:hover { border-color: #6b2737; transform: translateY(-2px); background: #ffffff; }
  .status-block.active { border-color: #6b2737; background: #ffffff; box-shadow: 0 4px 12px rgba(107,39,55,0.12); }
  .status-val { font-size: 24px; font-weight: 800; margin-bottom: 2px; }
  .status-lbl { font-size: 10px; font-weight: 700; color: #8a857e; text-transform: uppercase; letter-spacing: 0.5px; }
  
  .closing-list { display: flex; flex-direction: column; gap: 8px; }
  .closing-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #faf8f5; border: 1px solid #e4e0d9; border-radius: 10px; }
  .closing-company { font-size: 13px; font-weight: 700; color: #2a2a2a; }
  .closing-days { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; font-family: 'Space Mono', monospace; }
  .badge-urgent { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
  .badge-soon { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
  .badge-ok { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
  
  .row-3 { display: flex; flex-direction: column; gap: 16px; }
  .filters { display: flex; gap: 10px; align-items: center; }
  .filter-input { flex: 1; padding: 9px 16px; background: #ffffff; border: 1px solid #e4e0d9; border-radius: 20px; font-size: 12px; color: #2a2a2a; outline: none; transition: border 0.2s; font-family: inherit; }
  .filter-input:focus { border-color: #6b2737; }
  .filter-select { padding: 9px 14px; border: 1px solid #e4e0d9; border-radius: 20px; font-size: 12px; color: #2a2a2a; outline: none; background: #ffffff; font-weight: 600; font-family: inherit; }
  
  .view-toggle { display: flex; background: #eae7e2; border-radius: 20px; padding: 3px; }
  .view-toggle-btn { border: none; padding: 5px 14px; border-radius: 16px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: transparent; color: #8a857e; font-family: inherit; }
  .view-toggle-btn.active { background: #2a2a2a; color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  
  .table-card { background: #ffffff; border: 1px solid #e4e0d9; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
  table { width: 100%; border-collapse: collapse; text-align: left; }
  th { padding: 12px 18px; font-size: 10px; font-weight: 700; color: #8a857e; text-transform: uppercase; border-bottom: 1px solid #e4e0d9; background: #faf8f5; font-family: 'Space Mono', monospace; letter-spacing: 0.5px; }
  td { padding: 14px 18px; font-size: 13px; color: #5a5650; border-bottom: 1px solid #f0ede8; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #faf8f5; }
  .td-company { font-weight: 700; color: #2a2a2a; }
  
  .match-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; font-family: 'Space Mono', monospace; }
  .match-high { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .match-mid { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  .match-low { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
  
  .btn-text { padding: 5px 12px; font-size: 11px; font-weight: 600; border: 1px solid #e4e0d9; border-radius: 20px; background: #ffffff; color: #5a5650; cursor: pointer; transition: all 0.2s; margin-right: 6px; }
  .btn-text:hover { border-color: #6b2737; color: #6b2737; }
  .btn-delete { padding: 5px 10px; font-size: 11px; font-weight: 600; border: none; background: transparent; color: #b0aaa2; cursor: pointer; transition: color 0.2s; }
  .btn-delete:hover { color: #c1121f; }
  
  .notes-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .notes-modal { background: #ffffff; border: 1px solid #e4e0d9; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); border-radius: 16px; padding: 24px; width: 420px; max-width: 90vw; font-family: 'Outfit', sans-serif; }
  .notes-modal h3 { color: #2a2a2a; margin-bottom: 14px; font-size: 17px; font-weight: 800; }
  .notes-modal textarea { background: #faf8f5; border: 1px solid #e4e0d9; color: #2a2a2a; border-radius: 12px; width: 100%; height: 140px; padding: 12px; font-family: inherit; font-size: 13px; resize: none; outline: none; margin-bottom: 16px; }
  .notes-actions { display: flex; gap: 10px; justify-content: flex-end; }
  .notes-save-btn { background: #6b2737; color: #ffffff; border: none; border-radius: 20px; padding: 8px 18px; cursor: pointer; font-weight: 700; font-size: 12px; }
  .notes-close-btn { background: #ffffff; border: 1px solid #e4e0d9; color: #5a5650; border-radius: 20px; padding: 8px 16px; cursor: pointer; font-weight: 600; font-size: 12px; }
  
  .timeline-drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); z-index: 1000; display: flex; justify-content: flex-end; }
  .timeline-drawer { background: #ffffff; border-left: 1px solid #e4e0d9; width: 380px; height: 100vh; display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.1); font-family: 'Outfit', sans-serif; }
  .timeline-drawer-header { border-bottom: 1px solid #e4e0d9; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
  .timeline-drawer-title { color: #2a2a2a; font-size: 17px; font-weight: 800; margin-bottom: 2px; }
  .timeline-drawer-sub { color: #8a857e; font-size: 12px; }
  .timeline-drawer-close { color: #8a857e; background: #faf8f5; border: 1px solid #e4e0d9; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; }
  .timeline-body { padding: 24px; overflow-y: auto; flex: 1; }
  .timeline-empty { color: #8a857e; font-size: 13px; text-align: center; padding-top: 40px; }
  .timeline-list { display: flex; flex-direction: column; gap: 20px; position: relative; }
  .timeline-list::before { content: ''; position: absolute; left: 5px; top: 10px; bottom: 10px; width: 2px; background: #e4e0d9; }
  .timeline-entry { position: relative; padding-left: 24px; }
  .timeline-dot { position: absolute; left: 0; top: 4px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #ffffff; }
  .timeline-entry-status { color: #2a2a2a; font-weight: 700; font-size: 14px; margin-bottom: 2px; }
  .timeline-entry-date { color: #8a857e; font-size: 11px; margin-bottom: 6px; font-family: 'Space Mono', monospace; }
  .timeline-entry-note { color: #5a5650; font-size: 12px; background: #faf8f5; padding: 10px; border-radius: 8px; border: 1px solid #e4e0d9; }
  
  .status-dropdown { background: #ffffff; border: 1px solid #e4e0d9; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 12px; position: absolute; top: 100%; left: 0; width: 160px; z-index: 100; margin-top: 4px; padding: 6px; }
  .status-option { color: #2a2a2a; padding: 6px 10px; font-size: 12px; cursor: pointer; border-radius: 6px; display: flex; align-items: center; font-weight: 600; }
  .status-option:hover { background: #faf8f5; color: #6b2737; }
`;

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
  const [aiInitialTab, setAiInitialTab] = useState("email");
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
      }, 2500);
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

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Outfit', -apple-system, sans-serif" }}>
        <Sidebar />
        <div className="main" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* TOP HEADER */}
          <div className="top-row animate-in">
            <div className="top-left">
              <div className="header-date">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <div className="header-greeting">Welcome back, {user.name || "Kanu"}</div>
              <div className="header-sub">
                You have <strong style={{ color: '#2a2a2a' }}>{internships.filter(i => !['Rejected', 'Offer'].includes(i.status)).length} active applications</strong> and <strong style={{ color: '#2a2a2a' }}>{summary['Offer'] || 0} offers</strong> on the table.
              </div>
            </div>

            <div className="top-right">
              {/* Animated Radial Score Gauge */}
              <div className="score-widget hover-lift">
                <div style={{ position: 'relative', width: 44, height: 44 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path d="M18 2.5a15.5 15.5 0 110 31 15.5 15.5 0 010-31" fill="none" stroke="#eae7e2" strokeWidth="3" />
                    <path d="M18 2.5a15.5 15.5 0 110 31 15.5 15.5 0 010-31" fill="none" stroke="#6b2737" strokeWidth="3" strokeDasharray={`${careerScore}, 100`} strokeLinecap="round" className="score-circle" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800 }}>
                    {careerScore}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#8a857e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Career Score</div>
                  <div className="mono" style={{ fontSize: '10px', color: '#166534', fontWeight: 700 }}>+12% active</div>
                </div>
              </div>

              <button className="scan-btn" onClick={() => setShowScanner(true)}>
                <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                📥 Scan Gmail
              </button>
              <a href="/add" className="add-btn">+ Add Application</a>
            </div>
          </div>

          {syncMsg && (
            <div style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '10px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', fontWeight: 600 }}>
              ✓ {syncMsg}
            </div>
          )}

          {/* PRIORITY ACTION STACK */}
          {!loading && (
            <div className="priority-stack animate-in">
              <div className="priority-header">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6b2737', display: 'inline-block' }}></span>
                Immediate Priority Actions
              </div>

              {/* Next Best Action Card */}
              {nba && nba.msg && (
                <div className="priority-card">
                  <div className="priority-stripe-urgent"></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '15px', color: '#2a2a2a' }}>Next Best Action</strong>
                        <span className="stamp" style={{ color: '#92400e', borderColor: '#e9c46a' }}>🔥 Priority #1</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#5a5650' }}>{nba.msg}</div>
                    </div>
                    {nba.action && (
                      <a href={nba.link || "#"} className="add-btn" style={{ padding: '6px 14px', fontSize: '11px' }} target={nba.link?.startsWith('http') ? '_blank' : '_self'} rel="noreferrer">
                        {nba.action} →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Needs Attention Items */}
              {staleApps.slice(0, 2).map(app => (
                <div key={app._id} className="priority-card">
                  <div className={app.staleDays >= 14 ? "priority-stripe-urgent" : "priority-stripe-soon"}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <strong style={{ fontSize: '14px', color: '#2a2a2a' }}>{app.company}</strong>
                        <span className="stamp" style={{ color: app.staleDays >= 14 ? '#991b1b' : '#b45309', borderColor: app.staleDays >= 14 ? '#fca5a5' : '#fde68a' }}>
                          Stale · {app.staleDays}d
                        </span>
                        {app.emailSource && <span>📧</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8a857e' }}>{app.role} — No status update recorded. Follow up with recruiter?</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-text" onClick={() => handleEdit(app._id)}>Edit</button>
                      <button className="btn-text" style={{ color: '#6b2737', fontWeight: 700 }} onClick={() => { setAiInitialTab("followup"); setAiTarget(app); }}>👻 Follow-Up</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STATUS SUMMARY + CLOSING SOON */}
          <div className="row-2 animate-in">
            <div className="card">
              <div className="card-title">Pipeline Breakdown</div>
              <div className="status-blocks">
                {['Applied', 'Interview', 'OA', 'Offer', 'Rejected'].map(status => {
                  const statusColors = {
                    Applied: '#3a86ff', Interview: '#c17817', OA: '#8338ec', Offer: '#2d6a4f', Rejected: '#8a857e'
                  };
                  return (
                    <div 
                      className={`status-block ${filterStatus === status ? 'active' : ''}`} 
                      key={status} 
                      onClick={() => setFilterStatus(filterStatus === status ? "All" : status)}
                    >
                      <div className="status-val" style={{ color: statusColors[status] || '#2a2a2a' }}>
                        {summary[status] || 0}
                      </div>
                      <div className="status-lbl">{status}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="card">
              <div className="card-title">Closing Deadlines</div>
              {closingSoon.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#8a857e', padding: '12px 0' }}>No deadlines in the next 7 days.</div>
              ) : (
                <div className="closing-list">
                  {closingSoon.slice(0, 3).map((item) => (
                    <div key={item._id} className="closing-item">
                      <span className="closing-company" title={`${item.company} — ${item.role}`}>{item.company}</span>
                      <span className={`closing-days ${item.daysLeft === 0 ? 'badge-urgent' : item.daysLeft <= 3 ? 'badge-soon' : 'badge-ok'}`}>
                        {item.daysLeft === 0 ? 'Today!' : item.daysLeft === 1 ? 'Tomorrow' : `${item.daysLeft}d left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>



          {/* MAIN PIPELINE (SEARCH + VIEW TOGGLE + TABLE/BOARD) */}
          <div className="row-3 animate-in">
            <div className="filters">
              <input 
                type="text" 
                className="filter-input" 
                placeholder="Search company or role..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
              <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses ({internships.length})</option>
                {Object.keys(summary).map(s => <option key={s} value={s}>{s} ({summary[s]})</option>)}
              </select>
              <select className="filter-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              <div className="view-toggle">
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}>
                  Feed List
                </button>
                <button 
                  onClick={() => setViewMode('board')} 
                  className={`view-toggle-btn ${viewMode === 'board' ? 'active' : ''}`}>
                  Board View
                </button>
              </div>
            </div>

            <div className="table-card" style={viewMode === 'board' ? { border: 'none', background: 'transparent', boxShadow: 'none' } : {}}>
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#8a857e' }}>Loading your applications...</div>
              ) : filteredInternships.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#8a857e' }}>
                  <div style={{ marginBottom: '12px', fontSize: '28px' }}>📂</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#2a2a2a', marginBottom: '4px' }}>No applications match your filter</div>
                  <div style={{ fontSize: '12px' }}>Try searching another keyword or logging a new application.</div>
                </div>
              ) : viewMode === 'board' ? (
                <KanbanBoard 
                  internships={filteredInternships} 
                  onStatusChange={handleStatusChange} 
                  onActionClick={(action, item) => {
                    if (action === 'timeline') setTimelineTarget(item);
                    if (action === 'notes') setNotesTarget(item);
                    if (action === 'ai') { setAiInitialTab("email"); setAiTarget(item); }
                    if (action === 'followup') { setAiInitialTab("followup"); setAiTarget(item); }
                    if (action === 'ats') { setAiInitialTab("ats"); setAiTarget(item); }
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
                        <td className="td-company">
                          {item.company}
                          {item.emailSource && <span title="Updated via Email" style={{ marginLeft: '6px', fontSize: '12px' }}>📧</span>}
                        </td>
                        <td className="td-role">
                          {item.role}
                          {item.resumeUsed && (
                            <div style={{ fontSize: '10px', color: '#8a857e', marginTop: '2px' }}>📄 {item.resumeUsed}</div>
                          )}
                        </td>
                        <td><StatusCell item={item} onStatusChange={handleStatusChange} /></td>
                        <td className="td-date mono" style={{ fontSize: '11px', color: '#8a857e' }}>{item.appliedDate}</td>
                        <td>
                          {item.matchScore != null ? (
                            <span 
                              className={`match-badge ${item.matchScore >= 80 ? 'match-high' : item.matchScore >= 50 ? 'match-mid' : 'match-low'}`}
                              style={{ cursor: 'pointer' }}
                              title="Click for ATS Keyword Audit"
                              onClick={() => { setAiInitialTab("ats"); setAiTarget(item); }}
                            >
                              {item.matchScore}%
                            </span>
                          ) : hasResume ? (
                            <button className="btn-text" disabled={matchingId === item._id} onClick={() => handleMatchScore(item)}>{matchingId === item._id ? '...' : 'Check'}</button>
                          ) : (
                            <a href="/resume" style={{fontSize: '11px', color: '#8a857e', textDecoration: 'none'}}>+ Resume</a>
                          )}
                        </td>
                        <td className="td-actions">
                          <button className="btn-text" style={{ color: '#6b2737', borderColor: '#e4e0d9' }} onClick={() => { setAiInitialTab("email"); setAiTarget(item); }}>✨ AI</button>
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
          initialTab={aiInitialTab}
          onClose={() => setAiTarget(null)}
        />
      )}

      {showScanner && (
        <EmailScannerModal
          internships={internships}
          onClose={() => setShowScanner(false)}
          onUpdateSuccess={(updatedItem) => {
            setInternships(prev => prev.map(item => item._id === updatedItem._id ? updatedItem : item));
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