import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import API_BASE from "../apiConfig";

const styles = `
  .ana-root {
    display: flex;
    min-height: 100vh;
    background: #f5f3ef;
    color: #2a2a2a;
    font-family: 'Outfit', sans-serif;
  }
  .ana-main {
    flex: 1;
    padding: 32px 40px;
    max-width: 1200px;
    box-sizing: border-box;
  }
  .ana-header {
    margin-bottom: 24px;
  }
  .ana-title {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #2a2a2a;
  }
  .ana-sub {
    font-size: 13px;
    color: #8a857e;
    margin-top: 4px;
  }

  /* Grid Layout */
  .ana-grid-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }
  .ana-card {
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 14px;
    padding: 20px;
    box-sizing: border-box;
  }
  .card-header-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .card-title {
    font-size: 15px;
    font-weight: 800;
    color: #2a2a2a;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Funnel Visualization */
  .funnel-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .funnel-stage {
    background: #faf8f5;
    border: 1px solid #e4e0d9;
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.2s;
  }
  .funnel-stage:hover {
    border-color: #6b2737;
    background: #ffffff;
  }
  .stage-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  .stage-name {
    font-size: 13px;
    font-weight: 700;
    color: #2a2a2a;
  }
  .stage-count {
    font-size: 14px;
    font-weight: 800;
    font-family: 'Space Mono', monospace;
    color: #6b2737;
  }
  .bar-track {
    width: 100%;
    height: 8px;
    background: #e4e0d9;
    border-radius: 4px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: #6b2737;
    border-radius: 4px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .stage-dropoff {
    font-size: 11px;
    color: #8a857e;
    margin-top: 4px;
    display: flex;
    justify-content: space-between;
  }

  /* Metric KPI Blocks */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .kpi-box {
    background: #faf8f5;
    border: 1px solid #e4e0d9;
    border-radius: 10px;
    padding: 14px;
  }
  .kpi-label {
    font-size: 11px;
    font-weight: 700;
    color: #8a857e;
    text-transform: uppercase;
  }
  .kpi-value {
    font-size: 20px;
    font-weight: 800;
    color: #2a2a2a;
    margin-top: 4px;
    font-family: 'Space Mono', monospace;
  }

  /* Momentum & Goal Progress */
  .momentum-bar {
    width: 100%;
    height: 12px;
    background: #e4e0d9;
    border-radius: 6px;
    overflow: hidden;
    margin: 12px 0;
  }
  .momentum-fill {
    height: 100%;
    background: #166534;
    border-radius: 6px;
    transition: width 0.6s ease;
  }

  /* AI Funnel Diagnostic & Study Plan */
  .diagnostic-card {
    background: #ffffff;
    border: 1px solid #e4e0d9;
    border-radius: 14px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .diagnostic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .diagnostic-badge {
    background: #fdf2f4;
    color: #6b2737;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid #f9d8de;
    text-transform: uppercase;
  }
  .diagnostic-diagnosis {
    background: #faf8f5;
    border-left: 4px solid #6b2737;
    padding: 14px 18px;
    border-radius: 0 10px 10px 0;
    font-size: 14px;
    line-height: 1.6;
    color: #2a2a2a;
    margin-bottom: 20px;
  }
  .plan-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }
  .plan-item {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    padding: 14px;
  }
  .plan-day {
    font-size: 11px;
    font-weight: 800;
    color: #15803d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .plan-focus {
    font-size: 13px;
    font-weight: 700;
    color: #166534;
    margin-bottom: 4px;
  }
  .plan-desc {
    font-size: 12px;
    color: #4b5563;
    line-height: 1.4;
  }
`;

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
    fetchAnalytics();
    fetchDiagnostic();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/me/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagnostic = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/me/analytics/diagnostic`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setDiagnostic(json);
      }
    } catch (err) {
      console.error("Diagnostic fetch error:", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="ana-root">
        <Sidebar />
        <div className="ana-main" style={{ padding: "60px", textAlign: "center", color: "#8a857e" }}>
          Loading your career analytics...
        </div>
      </div>
    );
  }

  const { funnel, networking, weeklyVelocity, stageCounts } = data;

  return (
    <>
      <style>{styles}</style>
      <div className="ana-root">
        <Sidebar />
        <div className="ana-main">
          {/* HEADER */}
          <div className="ana-header">
            <div className="ana-title">📊 Application Funnel & Conversion Analytics</div>
            <div className="ana-sub">
              Live metrics across your application stages, interview conversion rate, and networking velocity.
            </div>
          </div>

          {/* AI FUNNEL DIAGNOSTIC & STUDY PLAN */}
          {diagnostic && (
            <div className="diagnostic-card">
              <div className="diagnostic-header">
                <div className="card-title">
                  <span>🧠 AI Funnel Diagnostic & Action Plan</span>
                </div>
                <span className="diagnostic-badge">
                  Bottleneck: {diagnostic.dropOffStage}
                </span>
              </div>

              <div className="diagnostic-diagnosis">
                {diagnostic.diagnosis}
              </div>

              {diagnostic.studyPlan && diagnostic.studyPlan.length > 0 && (
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
                    📅 Recommended Weekly Study & Prep Routine:
                  </div>
                  <div className="plan-grid">
                    {diagnostic.studyPlan.map((p, idx) => (
                      <div key={idx} className="plan-item">
                        <div className="plan-day">{p.day}</div>
                        <div className="plan-focus">{p.focus}</div>
                        <div className="plan-desc">{p.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOP METRICS & FUNNEL SECTION */}
          <div className="ana-grid-2">
            {/* CONVERSION FUNNEL */}
            <div className="ana-card">
              <div className="card-header-flex">
                <div className="card-title">🎯 Application Conversion Funnel</div>
                <span style={{ fontSize: "11px", color: "#8a857e" }}>Total: {funnel.total} Apps</span>
              </div>

              <div className="funnel-container">
                {/* 1. Applied */}
                <div className="funnel-stage">
                  <div className="stage-row">
                    <span className="stage-name">1. Submitted Applications</span>
                    <span className="stage-count">{funnel.applied}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: "100%" }}></div>
                  </div>
                  <div className="stage-dropoff">
                    <span>Base application pool</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* 2. OA Reached */}
                <div className="funnel-stage">
                  <div className="stage-row">
                    <span className="stage-name">2. Online Assessments (OA)</span>
                    <span className="stage-count">{funnel.oa}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${funnel.rates.appliedToOA}%`, background: "#9333ea" }}></div>
                  </div>
                  <div className="stage-dropoff">
                    <span>Applied ➔ OA Conversion</span>
                    <span style={{ fontWeight: 700 }}>{funnel.rates.appliedToOA}%</span>
                  </div>
                </div>

                {/* 3. Interview Reached */}
                <div className="funnel-stage">
                  <div className="stage-row">
                    <span className="stage-name">3. Interviews Scheduled</span>
                    <span className="stage-count">{funnel.interview}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${funnel.rates.oaToInterview}%`, background: "#2563eb" }}></div>
                  </div>
                  <div className="stage-dropoff">
                    <span>OA ➔ Interview Conversion</span>
                    <span style={{ fontWeight: 700 }}>{funnel.rates.oaToInterview}%</span>
                  </div>
                </div>

                {/* 4. Offers */}
                <div className="funnel-stage">
                  <div className="stage-row">
                    <span className="stage-name">4. Offers Received</span>
                    <span className="stage-count" style={{ color: "#166534" }}>{funnel.offer} 🏆</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${funnel.rates.interviewToOffer}%`, background: "#166534" }}></div>
                  </div>
                  <div className="stage-dropoff">
                    <span>Interview ➔ Offer Conversion</span>
                    <span style={{ fontWeight: 700, color: "#166534" }}>{funnel.rates.interviewToOffer}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KEY METRICS & NETWORKING HEALTH */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* NETWORKING EFFICIENCY */}
              <div className="ana-card">
                <div className="card-header-flex">
                  <div className="card-title">👥 Networking & Referral Health</div>
                  <span style={{ fontSize: "11px", color: "#8a857e" }}>{networking.totalContacts} Contacts</span>
                </div>

                <div className="kpi-grid">
                  <div className="kpi-box">
                    <div className="kpi-label">Response Rate</div>
                    <div className="kpi-value" style={{ color: "#15803d" }}>{networking.replyRate}%</div>
                    <div style={{ fontSize: "10px", color: "#8a857e", marginTop: "2px" }}>
                      {networking.repliedCount} / {networking.contactedCount} replied
                    </div>
                  </div>

                  <div className="kpi-box">
                    <div className="kpi-label">Referrals Won</div>
                    <div className="kpi-value" style={{ color: "#b45309" }}>{networking.referralsConfirmed} ⭐</div>
                    <div style={{ fontSize: "10px", color: "#8a857e", marginTop: "2px" }}>
                      {networking.referralWinRate}% of requested
                    </div>
                  </div>

                  <div className="kpi-box">
                    <div className="kpi-label">Pending Follow-ups</div>
                    <div className="kpi-value" style={{ color: networking.pendingFollowUpCount > 0 ? "#b91c1c" : "#15803d" }}>
                      {networking.pendingFollowUpCount}
                    </div>
                    <div style={{ fontSize: "10px", color: "#8a857e", marginTop: "2px" }}>
                      {networking.pendingFollowUpCount > 0 ? "Due for polite follow-up" : "All up to date"}
                    </div>
                  </div>

                  <div className="kpi-box">
                    <div className="kpi-label">Overall Offer Rate</div>
                    <div className="kpi-value" style={{ color: "#6b2737" }}>
                      {funnel.rates.overallConversion}%
                    </div>
                    <div style={{ fontSize: "10px", color: "#8a857e", marginTop: "2px" }}>
                      Offers per total applications
                    </div>
                  </div>
                </div>
              </div>

              {/* WEEKLY MOMENTUM */}
              <div className="ana-card">
                <div className="card-header-flex">
                  <div className="card-title">⚡ Weekly Application Momentum</div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534" }}>
                    {weeklyVelocity.recentApps} / {weeklyVelocity.weeklyGoal} This Week
                  </span>
                </div>

                <div className="momentum-bar">
                  <div className="momentum-fill" style={{ width: `${weeklyVelocity.goalProgress}%` }}></div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#5a5650" }}>
                  <span>🚀 {weeklyVelocity.recentApps} new applications submitted in last 7 days</span>
                  <span>{weeklyVelocity.goalProgress}% of goal</span>
                </div>
              </div>
            </div>
          </div>

          {/* APPLICATION STATUS BREAKDOWN */}
          <div className="ana-card">
            <div className="card-header-flex">
              <div className="card-title">📑 Complete Pipeline Breakdown</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
              {Object.entries(stageCounts).map(([stage, count]) => (
                <div key={stage} style={{ background: "#faf8f5", border: "1px solid #e4e0d9", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#8a857e", textTransform: "uppercase" }}>{stage}</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#2a2a2a", marginTop: "4px", fontFamily: "'Space Mono', monospace" }}>{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
