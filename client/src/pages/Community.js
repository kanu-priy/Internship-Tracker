import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import API_BASE from "../apiConfig";

const styles = `
  .community-layout {
    display: flex;
    min-height: 100vh;
    background: #fafbfc;
    font-family: 'Outfit', -apple-system, sans-serif;
    color: #111827;
  }
  .community-main {
    flex: 1;
    padding: 32px 40px;
    max-width: 1280px;
    margin: 0 auto;
  }
  .community-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
    gap: 16px;
  }
  .community-title {
    font-size: 28px;
    font-weight: 800;
    color: #111827;
    margin: 0 0 6px 0;
    letter-spacing: -0.5px;
  }
  .community-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    line-height: 1.5;
  }
  .btn-share {
    background: #6b2737;
    color: #ffffff;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 14px rgba(107, 39, 55, 0.2);
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .btn-share:hover {
    background: #541d2a;
    transform: translateY(-1px);
  }
  .search-filter-bar {
    display: flex;
    gap: 14px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .filter-input {
    flex: 1;
    min-width: 220px;
    padding: 10px 16px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    color: #111827;
    outline: none;
  }
  .filter-input:focus {
    border-color: #6b2737;
  }
  .filter-select {
    padding: 10px 16px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    color: #374151;
    outline: none;
    cursor: pointer;
  }
  .topics-cloud {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }
  .topic-chip {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .topic-chip:hover, .topic-chip.active {
    background: #6b2737;
    color: #ffffff;
    border-color: #6b2737;
  }
  .topic-count {
    opacity: 0.75;
    margin-left: 4px;
  }
  .experiences-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .exp-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 22px 26px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    transition: box-shadow 0.2s ease;
  }
  .exp-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }
  .exp-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 12px;
  }
  .exp-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .exp-company {
    font-size: 18px;
    font-weight: 800;
    color: #111827;
  }
  .exp-role {
    font-size: 14px;
    color: #4b5563;
    font-weight: 600;
  }
  .badge-round {
    background: #f3f4f6;
    color: #374151;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .badge-diff {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 6px;
  }
  .diff-easy { background: #dcfce7; color: #166534; }
  .diff-medium { background: #fef9c3; color: #854d0e; }
  .diff-hard { background: #fee2e2; color: #991b1b; }
  .exp-content {
    font-size: 14px;
    line-height: 1.65;
    color: #374151;
    margin-bottom: 16px;
    white-space: pre-line;
  }
  .exp-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .exp-tag {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
    padding: 3px 9px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
  }
  .exp-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #f3f4f6;
    font-size: 12px;
    color: #9ca3af;
  }
  .exp-author {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #6b7280;
    font-weight: 500;
  }
  .btn-like {
    background: transparent;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #4b5563;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;
  }
  .btn-like:hover {
    border-color: #6b2737;
    color: #6b2737;
    background: #fdf2f4;
  }
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    padding: 20px;
  }
  .modal-card {
    background: #ffffff;
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    padding: 28px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    max-height: 90vh;
    overflow-y: auto;
  }
  .form-group {
    margin-bottom: 16px;
  }
  .form-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #374151;
    margin-bottom: 6px;
  }
  .form-control {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    font-family: inherit;
  }
  .form-control:focus {
    border-color: #6b2737;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    background: #ffffff;
    border: 1px dashed #e5e7eb;
    border-radius: 14px;
  }
`;

export default function Community() {
  const [experiences, setExperiences] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCompany, setFilterCompany] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterRound, setFilterRound] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    role: "",
    round: "OA",
    difficulty: "Medium",
    topics: "",
    content: "",
    isAnonymous: true,
  });

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filterCompany) params.append("company", filterCompany);
      if (filterTopic) params.append("topic", filterTopic);
      if (filterRound) params.append("round", filterRound);

      const res = await fetch(`${API_BASE}/api/experiences?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setExperiences(data.experiences || []);
        setTopics(data.topics || []);
      }
    } catch (err) {
      console.error("Failed to load experiences", err);
    } finally {
      setLoading(false);
    }
  }, [filterCompany, filterTopic, filterRound]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExperiences();
  };

  const handleLike = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/experiences/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setExperiences(prev =>
          prev.map(exp => exp._id === id ? { ...exp, likes: data.likes } : exp)
        );
      }
    } catch (err) {
      console.error("Failed to like", err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        topics: formData.topics.split(",").map(t => t.trim()).filter(Boolean)
      };
      const res = await fetch(`${API_BASE}/api/experiences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          company: "",
          role: "",
          round: "OA",
          difficulty: "Medium",
          topics: "",
          content: "",
          isAnonymous: true,
        });
        fetchExperiences();
      }
    } catch (err) {
      console.error("Submit error", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="community-layout">
      <style>{styles}</style>
      <Sidebar />
      <div className="community-main">
        <div className="community-header">
          <div>
            <h1 className="community-title">Community Prep & OA Intel</h1>
            <p className="community-subtitle">
              Real interview breakdowns, coding patterns, and OA experiences shared by fellow applicants.
            </p>
          </div>
          <button className="btn-share" onClick={() => setShowModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Share Experience
          </button>
        </div>

        {/* Search & Filter */}
        <form className="search-filter-bar" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="filter-input"
            placeholder="Search by company (e.g. Cisco, Stripe, Google)..."
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
          >
            <option value="">All Rounds</option>
            <option value="OA">Online Assessment (OA)</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="System Design">System Design</option>
            <option value="Behavioral">Behavioral / Final Loop</option>
          </select>
          <button type="submit" className="btn-share" style={{ background: "#374151" }}>Filter</button>
          {(filterCompany || filterTopic || filterRound) && (
            <button
              type="button"
              className="btn-like"
              onClick={() => {
                setFilterCompany("");
                setFilterTopic("");
                setFilterRound("");
              }}
            >
              Reset Filters
            </button>
          )}
        </form>

        {/* Topics Cloud */}
        {topics.length > 0 && (
          <div className="topics-cloud">
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", alignSelf: "center", marginRight: "4px" }}>
              Frequent Topics:
            </span>
            {topics.map(t => (
              <span
                key={t.name}
                className={`topic-chip ${filterTopic === t.name ? "active" : ""}`}
                onClick={() => setFilterTopic(prev => prev === t.name ? "" : t.name)}
              >
                {t.name} <span className="topic-count">({t.count})</span>
              </span>
            ))}
          </div>
        )}

        {/* Experiences List */}
        {loading ? (
          <div className="empty-state">
            <p style={{ color: "#6b7280", fontSize: "15px" }}>Loading community experiences...</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="empty-state">
            <h3 style={{ margin: "0 0 8px 0", color: "#374151" }}>No experiences found</h3>
            <p style={{ color: "#6b7280", margin: "0 0 16px 0", fontSize: "14px" }}>
              Be the first to share an OA or interview experience for this company!
            </p>
            <button className="btn-share" style={{ margin: "0 auto" }} onClick={() => setShowModal(true)}>
              Share Your First Experience
            </button>
          </div>
        ) : (
          <div className="experiences-grid">
            {experiences.map(exp => {
              const diffClass =
                exp.difficulty === "Easy" ? "diff-easy" :
                exp.difficulty === "Hard" ? "diff-hard" : "diff-medium";
              return (
                <div key={exp._id} className="exp-card">
                  <div className="exp-top">
                    <div>
                      <div className="exp-meta">
                        <span className="exp-company">{exp.company}</span>
                        <span className="exp-role">{exp.role}</span>
                        <span className="badge-round">{exp.round}</span>
                        <span className={`badge-diff ${diffClass}`}>{exp.difficulty}</span>
                      </div>
                    </div>
                    <button className="btn-like" onClick={() => handleLike(exp._id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                      {exp.likes || 0} Helpful
                    </button>
                  </div>

                  <div className="exp-content">{exp.content}</div>

                  {exp.topics && exp.topics.length > 0 && (
                    <div className="exp-tags">
                      {exp.topics.map((tag, idx) => (
                        <span key={idx} className="exp-tag">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="exp-footer">
                    <span className="exp-author">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Shared by {exp.isAnonymous ? "Anonymous Peer" : (exp.authorName || "Peer")}
                    </span>
                    <span>{new Date(exp.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Share Experience Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 800, color: "#111827" }}>
                Share Interview / OA Intel
              </h2>
              <p style={{ margin: "0 0 20px 0", fontSize: "13px", color: "#6b7280" }}>
                Help fellow students prepare with real insights. You can post completely anonymously.
              </p>
              <form onSubmit={handleCreateSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Company *</label>
                    <input
                      required
                      type="text"
                      className="form-control"
                      placeholder="e.g. Cisco, Stripe, Google"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <input
                      required
                      type="text"
                      className="form-control"
                      placeholder="e.g. SWE Intern, Backend"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Round</label>
                    <select
                      className="form-control"
                      value={formData.round}
                      onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                    >
                      <option value="OA">Online Assessment (OA)</option>
                      <option value="Technical Interview">Technical Interview</option>
                      <option value="System Design">System Design</option>
                      <option value="Behavioral">Behavioral / Final Round</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select
                      className="form-control"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Topics / Patterns (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Graphs, DP, OS, Subnetting, LRU Cache"
                    value={formData.topics}
                    onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Experience & Details *</label>
                  <textarea
                    required
                    rows="4"
                    className="form-control"
                    placeholder="What questions were asked? What key algorithms, system design topics, or behavioral scenarios should candidates review?"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  />
                  <label htmlFor="isAnonymous" style={{ fontSize: "13px", color: "#374151", cursor: "pointer", fontWeight: 600 }}>
                    Post Anonymously (Hide your name from other applicants)
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-like"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-share"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? "Publishing..." : "Publish Experience"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
