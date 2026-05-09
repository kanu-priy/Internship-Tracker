/* global chrome */
import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const EXTENSION_ID = "hlbpahiogcemdholecbgommhgdppcfdj";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .dash-root {
    display: flex;
    min-height: 100vh;
    background: #0a0a0f;
    font-family: 'DM Sans', sans-serif;
    color: #fff;
  }

  .dash-main-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .dash-main {
    flex: 1;
    padding: 36px 40px;
    background: #0a0a0f;
    position: relative;
    overflow: hidden;
  }

  .dash-bg-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
  }
  .d-orb1 { width: 600px; height: 600px; background: rgba(245,158,11,0.06); top: -150px; left: 200px; }
  .d-orb2 { width: 400px; height: 400px; background: rgba(139,92,246,0.07); bottom: -100px; right: -100px; }

  .dash-content { position: relative; z-index: 1; }

  .dash-header { margin-bottom: 36px; }

  .dash-greeting {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 36px;
    color: #fff;
    letter-spacing: -1px;
    margin-bottom: 8px;
  }

  .dash-greeting span { color: #f59e0b; }

  .dash-subtext {
    font-size: 15px;
    color: rgba(255,255,255,0.38);
  }

  .dash-stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  @media (max-width: 1200px) { .dash-stats { grid-template-columns: repeat(3,1fr); } }
  @media (max-width: 700px) { .dash-stats { grid-template-columns: repeat(2,1fr); } }

  .stat-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 24px 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255,255,255,0.14);
  }

  .stat-card-glow {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    filter: blur(30px);
    top: -10px;
    right: -10px;
    opacity: 0.5;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: 12px;
  }

  .stat-count {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 42px;
    letter-spacing: -2px;
    line-height: 1;
  }

  .dash-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px 40px;
    gap: 12px;
    color: rgba(255,255,255,0.3);
    font-size: 15px;
  }

  .dash-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255,255,255,0.1);
    border-top-color: #f59e0b;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .dash-sync-toast {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(16,185,129,0.12);
    border: 1px solid rgba(16,185,129,0.25);
    color: #6ee7b7;
    font-size: 13px;
    padding: 8px 16px;
    border-radius: 20px;
    margin-bottom: 20px;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

  .dash-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 28px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    padding: 18px 20px;
    border-radius: 18px;
  }

  .dash-search {
    flex: 1;
    min-width: 200px;
    padding: 12px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: all 0.2s;
  }
  .dash-search::placeholder { color: rgba(255,255,255,0.2); }
  .dash-search:focus { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.04); }

  .dash-select {
    padding: 12px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    cursor: pointer;
    transition: all 0.2s;
  }
  .dash-select option { background: #1a1a2e; color: #fff; }
  .dash-select:focus { border-color: rgba(245,158,11,0.4); }

  .dash-table-wrap {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
  }

  .dash-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .dash-table thead {
    background: rgba(255,255,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .dash-table thead th {
    padding: 16px 20px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
  }

  .dash-table tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s;
    animation: fadeRow 0.3s ease forwards;
    opacity: 0;
  }

  .dash-table tbody tr:last-child { border-bottom: none; }
  .dash-table tbody tr:hover { background: rgba(255,255,255,0.03); }

  .dash-table td {
    padding: 16px 20px;
    color: rgba(255,255,255,0.75);
    vertical-align: middle;
  }

  .td-company {
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: #fff !important;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .status-dot { width: 6px; height: 6px; border-radius: 50%; }

  .status-Applied { background: rgba(59,130,246,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.2); }
  .status-Applied .status-dot { background: #60a5fa; }
  .status-Interview { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.2); }
  .status-Interview .status-dot { background: #fbbf24; }
  .status-OA { background: rgba(139,92,246,0.15); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.2); }
  .status-OA .status-dot { background: #a78bfa; }
  .status-Offer { background: rgba(16,185,129,0.15); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.2); }
  .status-Offer .status-dot { background: #34d399; }
  .status-Rejected { background: rgba(239,68,68,0.12); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); }
  .status-Rejected .status-dot { background: #f87171; }

  .btn-edit {
    padding: 7px 16px;
    background: rgba(245,158,11,0.15);
    border: 1px solid rgba(245,158,11,0.25);
    border-radius: 8px;
    color: #fbbf24;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    margin-right: 8px;
  }
  .btn-edit:hover { background: rgba(245,158,11,0.25); border-color: rgba(245,158,11,0.4); }

  .btn-delete {
    padding: 7px 16px;
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px;
    color: #f87171;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-delete:hover { background: rgba(239,68,68,0.22); border-color: rgba(239,68,68,0.4); }

  .dash-empty {
    text-align: center;
    padding: 80px 40px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
  }
  .dash-empty-icon { font-size: 52px; margin-bottom: 16px; }
  .dash-empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: rgba(255,255,255,0.7);
    margin-bottom: 8px;
  }
  .dash-empty-sub { color: rgba(255,255,255,0.3); font-size: 14px; }

  @keyframes fadeRow { to { opacity: 1; } }
`;

const statConfig = {
  Applied:  { color: "#3b82f6", glow: "rgba(59,130,246,0.4)" },
  Interview:{ color: "#f59e0b", glow: "rgba(245,158,11,0.4)" },
  OA:       { color: "#8b5cf6", glow: "rgba(139,92,246,0.4)" },
  Offer:    { color: "#10b981", glow: "rgba(16,185,129,0.4)" },
  Rejected: { color: "#ef4444", glow: "rgba(239,68,68,0.4)" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]                 = useState({});
  const [internships, setInternships]   = useState([]);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder]       = useState("newest");
  const [loading, setLoading]           = useState(true);
  const [syncMsg, setSyncMsg]           = useState("");

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

    if (window.chrome?.runtime) {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        {
          type: "SYNC_SAVED",
          items: data.map((i) => ({
            company: i.company,
            role: i.role,
            status: i.status,
            appliedDate: i.appliedDate,
            deadline: i.deadline || "",
            savedAt: i.createdAt || new Date().toISOString(),
          })),
        },
        () => {
          if (chrome.runtime.lastError) return;
        }
      );
    }
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
  if (!window.chrome?.runtime) return;

  isSyncing.current = true;

  chrome.runtime.sendMessage(
    EXTENSION_ID,
    { type: "GET_PENDING" },
    async (response) => {
      if (chrome.runtime.lastError) {
        isSyncing.current = false;
        return;
      }

      const items = response?.data || [];
      if (items.length === 0) {
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
          (e) =>
            `${e.company.toLowerCase().trim()}|${e.role
              .toLowerCase()
              .trim()}|${e.appliedDate}`
        )
      );

      const savedIndexes = [];
      const failedIndexes = [];

      for (let i = 0; i < items.length; i++) {
        const internship = items[i];
        const key = `${internship.company.toLowerCase().trim()}|${internship.role
          .toLowerCase()
          .trim()}|${internship.appliedDate}`;

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
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { type: "CLEAR_PENDING" },
          () => {
            isSyncing.current = false;

            if (savedIndexes.length > 0) {
              setSyncMsg(
                `✅ ${savedIndexes.length} internship(s) synced from extension`
              );
              setTimeout(() => setSyncMsg(""), 4000);
              fetchInternships();
            }
          }
        );
      }
    }
  );
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

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------
  const summary = internships.reduce(
    (acc, item) => { acc[item.status] = (acc[item.status] || 0) + 1; return acc; },
    { Applied: 0, Interview: 0, OA: 0, Offer: 0, Rejected: 0 }
  );

  // --------------------------------------------------
  // FILTER + SORT
  // --------------------------------------------------
  const filteredInternships = internships
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
      <div className="dash-root">
        <Sidebar />
        <div className="dash-main-wrap">
          <Navbar />
          <main className="dash-main">
            <div className="dash-bg-orb d-orb1" />
            <div className="dash-bg-orb d-orb2" />
            <div className="dash-content">

              <div className="dash-header">
                <h1 className="dash-greeting">
                  Hey, <span>{user.name || "User"}</span> 👋
                </h1>
                <p className="dash-subtext">
                  {internships.length} applications tracked · Stay on top of your journey
                </p>
              </div>

              {syncMsg && <div className="dash-sync-toast">{syncMsg}</div>}

              <div className="dash-stats">
                {Object.keys(summary).map((status) => (
                  <div className="stat-card" key={status}>
                    <div className="stat-card-glow" style={{ background: statConfig[status]?.glow }} />
                    <div className="stat-label">{status}</div>
                    <div className="stat-count" style={{ color: statConfig[status]?.color }}>
                      {summary[status]}
                    </div>
                  </div>
                ))}
              </div>

              <div className="dash-filters">
                <input type="text" placeholder="🔍  Search company or role..."
                  value={search} onChange={(e) => setSearch(e.target.value)} className="dash-search" />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="dash-select">
                  <option value="All">All Status</option>
                  {Object.keys(summary).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="dash-select">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {loading ? (
                <div className="dash-loading">
                  <div className="dash-spinner" />
                  Loading your applications...
                </div>
              ) : filteredInternships.length === 0 ? (
                <div className="dash-empty">
                  <div className="dash-empty-icon">🚀</div>
                  <div className="dash-empty-title">No internships yet</div>
                  <div className="dash-empty-sub">Start tracking your applications and stay organized.</div>
                </div>
              ) : (
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Applied</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInternships.map((item, i) => (
                        <tr key={item._id} style={{ animationDelay: `${i * 40}ms` }}>
                          <td className="td-company">{item.company}</td>
                          <td>{item.role}</td>
                          <td>
                            <span className={`status-badge status-${item.status}`}>
                              <span className="status-dot" />
                              {item.status}
                            </span>
                          </td>
                          <td>{item.appliedDate}</td>
                          <td>{item.deadline || "—"}</td>
                          <td>
                            <button onClick={() => handleEdit(item._id)} className="btn-edit">Edit</button>
                            <button onClick={() => handleDelete(item._id)} className="btn-delete">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </>
  );
}