import React from "react";
import { Link } from "react-router-dom";

export default function KanbanBoard({ internships, onStatusChange, onActionClick }) {
  const statuses = ["Applied", "OA", "Interview", "Offer", "Rejected", "No Response"];

  // Group internships by status
  const columns = statuses.map(status => ({
    status,
    items: internships.filter(i => i.status === status)
  }));

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("internshipId", id);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("internshipId");
    if (id) {
      onStatusChange(id, newStatus);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("T")[0].split("-");
    return `${d}-${m}-${y}`;
  };

  const colColors = {
    Applied: '#3a86ff',
    OA: '#8338ec',
    Interview: '#c17817',
    Offer: '#2d6a4f',
    Rejected: '#8a857e',
    'No Response': '#b0aaa2'
  };

  return (
    <div className="kanban-container">
      <style>{`
        .kanban-container {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
          min-height: 520px;
          font-family: 'Outfit', sans-serif;
        }
        .kanban-col {
          flex: 1;
          min-width: 270px;
          background: #eeebe4;
          border: 1px solid #e4e0d9;
          border-radius: 16px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .kanban-col-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          color: #2a2a2a;
          font-size: 13px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e4e0d9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .kanban-count {
          background: #ffffff;
          color: #6b2737;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .kanban-card {
          background: #ffffff;
          border: 1px solid #e4e0d9;
          border-radius: 12px;
          padding: 14px;
          cursor: grab;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .kanban-card:active {
          cursor: grabbing;
        }
        .kanban-card:hover {
          border-color: #6b2737;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px -4px rgba(107, 39, 55, 0.1);
        }
        .kb-company {
          font-weight: 700;
          color: #2a2a2a;
          font-size: 14px;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .kb-role {
          font-size: 12px;
          color: #8a857e;
          margin-bottom: 8px;
        }
        .kb-date {
          font-size: 10px;
          color: #b0aaa2;
          font-family: 'Space Mono', monospace;
        }
        .kb-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed #e4e0d9;
        }
        .kb-actions {
          display: flex;
          gap: 6px;
        }
        .kb-btn {
          background: #faf8f5;
          border: 1px solid #e4e0d9;
          cursor: pointer;
          color: #5a5650;
          padding: 3px 7px;
          border-radius: 6px;
          font-size: 11px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .kb-btn:hover {
          background: #ffffff;
          border-color: #6b2737;
          color: #6b2737;
        }
        .kb-ai-btn {
          color: #6b2737;
          font-weight: 700;
          border-color: #e4e0d9;
        }
        .stale-warning {
          display: inline-block;
          margin-top: 8px;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 6px;
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
          font-weight: 700;
        }
      `}</style>

      {columns.map(col => (
        <div 
          key={col.status} 
          className="kanban-col"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.status)}
        >
          <div className="kanban-col-header" style={{ color: colColors[col.status] || '#2a2a2a' }}>
            <span>{col.status}</span>
            <span className="kanban-count">{col.items.length}</span>
          </div>

          {col.items.map(item => (
            <div 
              key={item._id} 
              className="kanban-card"
              draggable
              onDragStart={(e) => handleDragStart(e, item._id)}
            >
              <div className="kb-company">
                {item.company}
                {item.emailSource && <span title="Updated via Email" style={{ fontSize: "12px" }}>📧</span>}
              </div>
              <div className="kb-role">{item.role}</div>
              <div className="kb-date">Applied: {formatDate(item.appliedDate)}</div>
              
              {item.staleDays >= 7 && !['Rejected', 'Offer', 'No Response'].includes(col.status) && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", gap: "6px" }}>
                  <span className="stale-warning">⚠️ {item.staleDays >= 14 ? `Ghosted (${item.staleDays}d)` : `Stale (${item.staleDays}d)`}</span>
                  <button 
                    className="kb-btn" 
                    style={{ fontSize: "10px", color: "#6b2737", fontWeight: 700, borderColor: "#e4e0d9", padding: "2px 6px" }}
                    onClick={() => onActionClick("followup", item)}
                    title="Draft polite follow-up email"
                  >
                    👻 Follow-up
                  </button>
                </div>
              )}
              {item.matchScore != null && (
                <div style={{ marginTop: "6px" }}>
                  <span 
                    className="kb-btn" 
                    style={{ fontSize: "10px", fontWeight: 700, display: "inline-flex", cursor: "pointer", color: item.matchScore >= 80 ? "#166534" : "#92400e", background: item.matchScore >= 80 ? "#dcfce7" : "#fef3c7", border: "none" }}
                    onClick={() => onActionClick("ats", item)}
                    title="Click for ATS Keyword Gap Audit"
                  >
                    🎯 {item.matchScore}% ATS Match
                  </span>
                </div>
              )}
              {item.resumeUsed && (
                <div style={{ fontSize: "10px", color: "#8a857e", marginTop: "4px" }}>
                  📄 {item.resumeUsed}
                </div>
              )}

              <div className="kb-footer">
                <div className="kb-actions">
                  <button className="kb-btn kb-ai-btn" onClick={() => onActionClick("ai", item)} title="AI Assist">
                    ✨ AI
                  </button>
                  <button className="kb-btn" onClick={() => onActionClick("timeline", item)} title="Timeline">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </button>
                  <button className="kb-btn" onClick={() => onActionClick("notes", item)} title="Notes">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </button>
                </div>
                <Link to={`/edit/${item._id}`} className="kb-btn" title="Edit">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
