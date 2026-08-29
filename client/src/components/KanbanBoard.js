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

  return (
    <div className="kanban-container">
      <style>{`
        .kanban-container {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 16px;
          min-height: 500px;
        }
        .kanban-col {
          flex: 1;
          min-width: 260px;
          background: #fafbfc;
          border: 1px solid #eaeaea;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .kanban-col-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: #111827;
          font-size: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eaeaea;
        }
        .kanban-count {
          background: #eaeaea;
          color: #6b7280;
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 12px;
        }
        .kanban-card {
          background: #ffffff;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 12px;
          cursor: grab;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }
        .kanban-card:active {
          cursor: grabbing;
        }
        .kanban-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border-color: #d1d5db;
        }
        .kb-company {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .kb-role {
          font-size: 13px;
          color: #4b5563;
          margin-bottom: 8px;
        }
        .kb-date {
          font-size: 12px;
          color: #9ca3af;
        }
        .kb-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #eaeaea;
        }
        .kb-actions {
          display: flex;
          gap: 6px;
        }
        .kb-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 4px;
        }
        .kb-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }
        .kb-ai-btn {
          color: #b5763b;
        }
        .kb-ai-btn:hover {
          background: #fdf6ed;
          color: #9c622c;
        }
        .stale-warning {
          display: inline-block;
          margin-top: 8px;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          background: #fef2f2;
          color: #ef4444;
          font-weight: 500;
        }
      `}</style>

      {columns.map(col => (
        <div 
          key={col.status} 
          className="kanban-col"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.status)}
        >
          <div className="kanban-col-header">
            {col.status}
            <span className="kanban-count">{col.items.length}</span>
          </div>

          {col.items.map(item => (
            <div 
              key={item._id} 
              className="kanban-card"
              draggable
              onDragStart={(e) => handleDragStart(e, item._id)}
            >
              <div className="kb-company">{item.company}</div>
              <div className="kb-role">{item.role}</div>
              <div className="kb-date">Applied: {formatDate(item.appliedDate)}</div>
              
              {item.staleDays >= 14 && !['Rejected', 'Offer', 'No Response'].includes(col.status) && (
                <div className="stale-warning">⚠️ Likely Ghosted</div>
              )}
              {item.resumeUsed && (
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                  📄 {item.resumeUsed}
                </div>
              )}

              <div className="kb-footer">
                <div className="kb-actions">
                  <button className="kb-btn kb-ai-btn" onClick={() => onActionClick("ai", item)} title="AI Assist">
                    ✨
                  </button>
                  <button className="kb-btn" onClick={() => onActionClick("timeline", item)} title="Timeline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </button>
                  <button className="kb-btn" onClick={() => onActionClick("notes", item)} title="Notes">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </button>
                </div>
                <Link to={`/edit/${item._id}`} className="kb-btn" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
