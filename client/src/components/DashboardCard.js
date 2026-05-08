import React from "react";

const cardConfig = {
  Applied: { color: "#3b82f6", glow: "rgba(59,130,246,0.35)", icon: "📤" },
  Interview: { color: "#f59e0b", glow: "rgba(245,158,11,0.35)", icon: "🎙️" },
  OA: { color: "#8b5cf6", glow: "rgba(139,92,246,0.35)", icon: "💻" },
  Offer: { color: "#10b981", glow: "rgba(16,185,129,0.35)", icon: "🎉" },
  Rejected: { color: "#ef4444", glow: "rgba(239,68,68,0.35)", icon: "❌" },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

  .dash-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 22px 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, border-color 0.2s ease;
    font-family: 'DM Sans', sans-serif;
    cursor: default;
  }

  .dash-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255,255,255,0.13);
  }

  .dash-card-glow {
    position: absolute;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    filter: blur(32px);
    top: -10px;
    right: -10px;
    opacity: 0.6;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  .dash-card:hover .dash-card-glow { opacity: 0.9; }

  .dash-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .dash-card-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.38);
  }

  .dash-card-icon {
    font-size: 16px;
    opacity: 0.7;
  }

  .dash-card-count {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 44px;
    line-height: 1;
    letter-spacing: -2px;
  }

  .dash-card-bar {
    margin-top: 14px;
    height: 3px;
    border-radius: 2px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
  }

  .dash-card-bar-fill {
    height: 100%;
    border-radius: 2px;
    width: 40%;
    opacity: 0.7;
  }
`;

export default function DashboardCard({ title, count }) {
  const cfg = cardConfig[title] || { color: "#94a3b8", glow: "rgba(148,163,184,0.3)", icon: "📊" };

  return (
    <>
      <style>{styles}</style>
      <div className="dash-card">
        <div className="dash-card-glow" style={{ background: cfg.glow }} />
        <div className="dash-card-top">
          <span className="dash-card-label">{title}</span>
          <span className="dash-card-icon">{cfg.icon}</span>
        </div>
        <div className="dash-card-count" style={{ color: cfg.color }}>{count}</div>
        <div className="dash-card-bar">
          <div className="dash-card-bar-fill" style={{ background: cfg.color }} />
        </div>
      </div>
    </>
  );
}