import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .home-root {
    min-height: 100vh;
    background: #faf8f5;
    color: #2a2a2a;
    font-family: 'Outfit', -apple-system, sans-serif;
    overflow-x: hidden;
  }

  /* ── Header / Navbar ── */
  .home-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(250, 248, 245, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #e8e4dd;
    padding: 14px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1240px;
    margin: 0 auto;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
  }

  .nav-logo-img {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(107, 39, 55, 0.2);
  }

  .nav-logo-text {
    font-size: 20px;
    font-weight: 800;
    color: #2a2a2a;
    letter-spacing: -0.5px;
  }

  .nav-logo-text span {
    color: #6b2737;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .nav-link {
    font-size: 14px;
    font-weight: 600;
    color: #6a655e;
    text-decoration: none;
    transition: color 0.18s ease;
  }

  .nav-link:hover {
    color: #6b2737;
  }

  .nav-btn-outline {
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid #e4e0d9;
    background: #ffffff;
    font-size: 13px;
    font-weight: 700;
    color: #2a2a2a;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .nav-btn-outline:hover {
    border-color: #6b2737;
    color: #6b2737;
  }

  .nav-btn-primary {
    padding: 9px 18px;
    border-radius: 10px;
    background: #6b2737;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(107, 39, 55, 0.25);
    transition: all 0.2s ease;
  }

  .nav-btn-primary:hover {
    background: #541e2b;
    transform: translateY(-1px);
  }

  /* ── Hero Section ── */
  .hero-section {
    max-width: 1100px;
    margin: 60px auto 40px;
    padding: 0 24px;
    text-align: center;
  }

  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f0ece6;
    border: 1px solid #dfd9ce;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    color: #6b2737;
    margin-bottom: 24px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  }

  .hero-badge .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
  }

  .hero-title {
    font-size: clamp(38px, 6vw, 64px);
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -1.8px;
    color: #1a1a1a;
    margin-bottom: 20px;
  }

  .hero-title .highlight {
    background: linear-gradient(135deg, #6b2737 0%, #c9a45c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-sub {
    font-size: clamp(16px, 2.5vw, 20px);
    color: #6e6962;
    max-width: 680px;
    margin: 0 auto 36px;
    line-height: 1.5;
  }

  .hero-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 40px;
  }

  .hero-btn-main {
    padding: 14px 28px;
    background: #6b2737;
    color: #ffffff;
    font-size: 16px;
    font-weight: 800;
    border-radius: 12px;
    text-decoration: none;
    box-shadow: 0 6px 20px rgba(107, 39, 55, 0.3);
    transition: all 0.2s ease;
  }

  .hero-btn-main:hover {
    background: #541e2b;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(107, 39, 55, 0.4);
  }

  .hero-btn-secondary {
    padding: 14px 24px;
    background: #ffffff;
    border: 1px solid #dfd9ce;
    color: #2a2a2a;
    font-size: 15px;
    font-weight: 700;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .hero-btn-secondary:hover {
    border-color: #6b2737;
    color: #6b2737;
    transform: translateY(-2px);
  }

  /* ── Interactive Playground Showcase ── */
  .interactive-wrap {
    max-width: 1080px;
    margin: 0 auto 80px;
    padding: 0 20px;
  }

  .interactive-box {
    background: #ffffff;
    border: 1.5px solid #dfd9ce;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 50px -10px rgba(107, 39, 55, 0.1), 0 2px 8px rgba(0,0,0,0.03);
  }

  .playground-header {
    background: #f5f2ed;
    border-bottom: 1px solid #e4dfd6;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .mac-dots {
    display: flex;
    gap: 6px;
  }

  .mac-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .playground-tabs {
    display: flex;
    gap: 6px;
    background: #eae5dc;
    padding: 3px;
    border-radius: 10px;
  }

  .p-tab {
    padding: 6px 14px;
    border-radius: 8px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    color: #6a655e;
    cursor: pointer;
    transition: all 0.18s ease;
  }

  .p-tab.active {
    background: #ffffff;
    color: #6b2737;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  }

  .playground-body {
    padding: 32px 28px;
    min-height: 380px;
    background: #ffffff;
  }

  /* Tab 1: Priority Stack Simulation */
  .sim-badge {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #c17817;
    background: #fef3c7;
    border: 1px solid #fde68a;
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
  }

  .sim-priority-card {
    background: #fdfbf9;
    border: 1.5px solid #e8e4dc;
    border-left: 5px solid #6b2737;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .sim-priority-card.flash {
    transform: scale(1.02);
    border-color: #6b2737;
    box-shadow: 0 10px 25px rgba(107, 39, 55, 0.15);
  }

  .sim-btn-pill {
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid #dfd9ce;
    background: #ffffff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sim-btn-pill:hover {
    background: #6b2737;
    color: #fff;
    border-color: #6b2737;
  }

  /* Tab 2: ATS Meter */
  .ats-meter-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 16px;
  }

  .ats-score-display {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 6px solid #6b2737;
    background: #fdfbf9;
    box-shadow: 0 8px 24px rgba(107,39,55,0.15);
    transition: all 0.4s ease;
  }

  .ats-score-number {
    font-size: 32px;
    font-weight: 900;
    color: #6b2737;
    line-height: 1;
  }

  .ats-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 600px;
  }

  .ats-chip {
    padding: 7px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    border: 1.5px solid #dfd9ce;
    background: #f8f6f2;
    color: #6a655e;
    transition: all 0.2s ease;
  }

  .ats-chip.selected {
    background: #6b2737;
    color: #ffffff;
    border-color: #6b2737;
    box-shadow: 0 4px 12px rgba(107,39,55,0.25);
  }

  /* Tab 3: Email Scanner */
  .email-sample-btn {
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid #dfd9ce;
    background: #fdfbf9;
    font-size: 12px;
    font-weight: 700;
    color: #4a4640;
    cursor: pointer;
    transition: all 0.18s;
  }

  .email-sample-btn:hover {
    border-color: #6b2737;
    color: #6b2737;
  }

  .email-preview-box {
    background: #fcfbf9;
    border: 1px solid #e8e4dc;
    border-radius: 12px;
    padding: 16px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #3a3632;
    margin-top: 14px;
    line-height: 1.6;
  }

  /* ── 3 Core Pillars ── */
  .section-wrap {
    max-width: 1100px;
    margin: 80px auto;
    padding: 0 24px;
  }

  .section-head {
    text-align: center;
    margin-bottom: 48px;
  }

  .section-tag {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #6b2737;
    letter-spacing: 1.5px;
    margin-bottom: 8px;
  }

  .section-title {
    font-size: clamp(26px, 4vw, 36px);
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: -0.8px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
  }

  .feature-card {
    background: #ffffff;
    border: 1px solid #e4dfd6;
    border-radius: 18px;
    padding: 28px;
    transition: all 0.22s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  }

  .feature-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(107, 39, 55, 0.09);
    border-color: #d0c8bd;
  }

  .f-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #fdfaf7;
    border: 1px solid #e8e2d8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 20px;
    color: #6b2737;
  }

  .f-title {
    font-size: 18px;
    font-weight: 800;
    color: #1a1a1a;
    margin-bottom: 8px;
  }

  .f-desc {
    font-size: 14px;
    color: #6e6962;
    line-height: 1.55;
    flex: 1;
  }

  /* ── Banner CTA ── */
  .cta-banner {
    max-width: 1040px;
    margin: 80px auto 100px;
    padding: 48px 32px;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #6b2737 100%);
    border-radius: 24px;
    color: #ffffff;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 50px -10px rgba(15, 23, 42, 0.4);
  }

  .cta-title {
    font-size: clamp(28px, 4vw, 40px);
    font-weight: 900;
    margin-bottom: 14px;
    letter-spacing: -0.8px;
  }

  .cta-sub {
    font-size: 16px;
    color: #cbd5e1;
    max-width: 540px;
    margin: 0 auto 32px;
    line-height: 1.5;
  }

  /* ── Footer ── */
  .home-footer {
    border-top: 1px solid #e4dfd6;
    padding: 32px 24px;
    text-align: center;
    font-size: 13px;
    color: #8a857e;
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .footer-links {
    display: flex;
    gap: 16px;
  }

  .footer-link {
    color: #6a655e;
    text-decoration: none;
    font-weight: 600;
  }

  .footer-link:hover {
    color: #6b2737;
  }
`;

export default function Home() {
  const [activePlaygroundTab, setActivePlaygroundTab] = useState("priority");

  // Interactive State for Tab 1: Priority Stack
  const [simStripeDays, setSimStripeDays] = useState(2);
  const [simCardFlashed, setSimCardFlashed] = useState(false);

  // Interactive State for Tab 2: ATS Matcher
  const [selectedSkills, setSelectedSkills] = useState(["React", "TypeScript", "Node.js"]);
  const allSkills = [
    "React", "TypeScript", "Node.js", "Express", 
    "MongoDB", "Docker", "System Design", "AWS", "Python"
  ];

  // Interactive State for Tab 3: Email Scanner
  const [selectedEmail, setSelectedEmail] = useState({
    company: "Google",
    type: "Technical Interview Invite",
    date: "Sept 18, 2:30 PM PST",
    stage: "Interview",
    text: "Hi Kanupriya! We were thrilled by your application for Software Engineer Intern. We would love to invite you to a 45-minute technical coding round with our systems engineering team."
  });

  const triggerSimFlash = (days) => {
    setSimStripeDays(days);
    setSimCardFlashed(true);
    setTimeout(() => setSimCardFlashed(false), 500);
  };

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Calculate simulated ATS score based on skill count
  const simulatedAtsScore = Math.min(98, Math.max(35, 40 + selectedSkills.length * 7));

  return (
    <>
      <style>{styles}</style>
      <div className="home-root">

        {/* ── Top Navigation Bar ── */}
        <header className="home-nav">
          <Link to="/" className="nav-brand">
            <img src="/logo192.png" alt="DeadlineDesk Logo" className="nav-logo-img" />
            <div className="nav-logo-text">deadline<span>desk</span></div>
          </Link>

          <nav className="nav-links">
            <a href="#demo" className="nav-link">Interactive Demo</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="/deadlinedesk-extension.zip" download="deadlinedesk-extension.zip" className="nav-link" title="Download Chrome Extension">
              🧩 Extension
            </a>
            <Link to="/login" className="nav-btn-outline">Sign In</Link>
            <Link to="/register" className="nav-btn-primary">Get Started Free</Link>
          </nav>
        </header>

        {/* ── Hero Section ── */}
        <section className="hero-section">
          <div className="hero-badge">
            <span className="dot"></span>
            Live & Production Ready • 100% Free
          </div>

          <h1 className="hero-title">
            Stop losing job applications in spreadsheets.<br />
            <span className="highlight">Meet your proactive career copilot.</span>
          </h1>

          <p className="hero-sub">
            DeadlineDesk turns chaotic application tracking into an intelligent command center. 
            Two-way Chrome extension sync, privacy-first AI email parsing, and automated deadline alarms — all in one place.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="hero-btn-main">
              Start Tracking for Free →
            </Link>
            <a href="#demo" className="hero-btn-secondary">
              ⚡ Try Interactive Demo
            </a>
          </div>
        </section>

        {/* ── Interactive Playground Section ── */}
        <section className="interactive-wrap" id="demo">
          <div className="interactive-box">
            
            <div className="playground-header">
              <div className="mac-dots">
                <div className="mac-dot" style={{ background: "#ef4444" }}></div>
                <div className="mac-dot" style={{ background: "#f59e0b" }}></div>
                <div className="mac-dot" style={{ background: "#10b981" }}></div>
              </div>

              <div className="playground-tabs">
                <button 
                  className={`p-tab ${activePlaygroundTab === 'priority' ? 'active' : ''}`}
                  onClick={() => setActivePlaygroundTab('priority')}>
                  ⚡ Priority Engine
                </button>
                <button 
                  className={`p-tab ${activePlaygroundTab === 'ats' ? 'active' : ''}`}
                  onClick={() => setActivePlaygroundTab('ats')}>
                  🎯 ATS Matcher
                </button>
                <button 
                  className={`p-tab ${activePlaygroundTab === 'email' ? 'active' : ''}`}
                  onClick={() => setActivePlaygroundTab('email')}>
                  📥 Email Scanner
                </button>
              </div>

              <div style={{ fontSize: '11px', color: '#8a857e', fontFamily: 'Space Mono, monospace' }}>
                Interactive Live Preview
              </div>
            </div>

            <div className="playground-body">

              {/* TAB 1: PRIORITY STACK SIMULATOR */}
              {activePlaygroundTab === 'priority' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>The "Today" Command Center</h3>
                      <p style={{ fontSize: '13px', color: '#6e6962', margin: 0 }}>
                        Calculates your #1 urgent priority action today instead of letting deadlines slip by.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="sim-btn-pill" onClick={() => triggerSimFlash(1)}>Due in 24h</button>
                      <button className="sim-btn-pill" onClick={() => triggerSimFlash(2)}>Due in 2d</button>
                      <button className="sim-btn-pill" onClick={() => triggerSimFlash(0)}>Due Today!</button>
                    </div>
                  </div>

                  <div className={`sim-priority-card ${simCardFlashed ? 'flash' : ''}`}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className="sim-badge">
                          {simStripeDays === 0 ? "🔥 Due Today!" : simStripeDays === 1 ? "⚠️ Due Tomorrow" : `⏳ Due in ${simStripeDays} Days`}
                        </span>
                        <strong style={{ fontSize: '15px' }}>Next Best Action: Stripe</strong>
                      </div>
                      <div style={{ fontSize: '13px', color: '#5a5650' }}>
                        HackerRank Online Assessment expires {simStripeDays === 0 ? 'tonight at 11:59 PM' : `in ${simStripeDays} days`}. High emphasis on Concurrency & API Reliability.
                      </div>
                    </div>
                    <button 
                      className="nav-btn-primary" 
                      style={{ fontSize: '12px', padding: '8px 14px', whiteSpace: 'nowrap' }}
                      onClick={() => alert("In the live dashboard, this opens your assessment link or generates tailored AI prep notes!")}>
                      Start Assessment →
                    </button>
                  </div>

                  <div className="sim-priority-card" style={{ borderLeftColor: '#f59e0b', background: '#fffcf7' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          Stale · 8 Days
                        </span>
                        <strong style={{ fontSize: '14px' }}>Amazon · SDE Intern</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6a655e' }}>
                        No status update recorded in 8 days. Ready to dispatch an AI follow-up to the technical recruiter?
                      </div>
                    </div>
                    <button 
                      className="nav-btn-outline" 
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      onClick={() => alert("DeadlineDesk generates a personalized 1-click follow-up draft based on your interview timeline!")}>
                      Draft Follow-up
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: ATS RESUME MATCHER */}
              {activePlaygroundTab === 'ats' && (
                <div className="ats-meter-wrap">
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>Instant ATS Keyword Scoring</h3>
                    <p style={{ fontSize: '13px', color: '#6e6962', margin: 0 }}>
                      Click technologies below to simulate matching your resume against a Full Stack Software Intern role:
                    </p>
                  </div>

                  <div className="ats-score-display" style={{ borderColor: simulatedAtsScore > 75 ? '#166534' : simulatedAtsScore > 55 ? '#c9a45c' : '#b91c1c' }}>
                    <div className="ats-score-number" style={{ color: simulatedAtsScore > 75 ? '#166534' : simulatedAtsScore > 55 ? '#c9a45c' : '#b91c1c' }}>
                      {simulatedAtsScore}%
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#8a857e' }}>
                      {simulatedAtsScore > 80 ? 'Strong Match' : simulatedAtsScore > 60 ? 'Moderate' : 'Needs Review'}
                    </div>
                  </div>

                  <div className="ats-chips">
                    {allSkills.map(skill => (
                      <button
                        key={skill}
                        className={`ats-chip ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                        onClick={() => toggleSkill(skill)}>
                        {selectedSkills.includes(skill) ? `✓ ${skill}` : `+ ${skill}`}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '12px', color: '#8a857e', marginTop: '6px' }}>
                    {selectedSkills.length} of {allSkills.length} skills matched • Includes AI bullet-point optimizer in dashboard
                  </div>
                </div>
              )}

              {/* TAB 3: PRIVACY EMAIL SCANNER */}
              {activePlaygroundTab === 'email' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>Zero-Access AI Email Scanner</h3>
                      <p style={{ fontSize: '13px', color: '#6e6962', margin: 0 }}>
                        Click a sample update to see how Gemini AI extracts stages and dates without reading your private inbox:
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="email-sample-btn"
                        onClick={() => setSelectedEmail({
                          company: "Google",
                          type: "Technical Interview",
                          date: "Sept 18, 2:30 PM",
                          stage: "Interview",
                          text: "Hi Kanupriya! We were thrilled by your application for Software Engineer Intern. We would love to invite you to a 45-minute technical coding round with our systems engineering team on Sept 18 at 2:30 PM."
                        })}>
                        Google Interview
                      </button>
                      <button 
                        className="email-sample-btn"
                        onClick={() => setSelectedEmail({
                          company: "Stripe",
                          type: "HackerRank OA",
                          date: "Sept 15, 11:59 PM",
                          stage: "OA",
                          text: "Congratulations on your candidacy! You have been selected to take the Stripe Backend Engineering Assessment. Please complete the coding challenge before Sept 15, 11:59 PM."
                        })}>
                        Stripe OA
                      </button>
                    </div>
                  </div>

                  <div className="email-preview-box">
                    <div style={{ color: '#8a857e', marginBottom: '6px' }}>&gt; INCOMING EMAIL BODY:</div>
                    <div>"{selectedEmail.text}"</div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '14px', background: '#fdfbf9', border: '1px solid #e8e4dc', borderRadius: '10px', padding: '12px 18px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div><span style={{ fontSize: '11px', color: '#8a857e' }}>EXTRACTED COMPANY:</span> <strong style={{ color: '#2a2a2a' }}>{selectedEmail.company}</strong></div>
                    <div><span style={{ fontSize: '11px', color: '#8a857e' }}>ROUND TYPE:</span> <span className="sim-badge">{selectedEmail.type}</span></div>
                    <div><span style={{ fontSize: '11px', color: '#8a857e' }}>DEADLINE / DATE:</span> <strong style={{ color: '#6b2737' }}>{selectedEmail.date}</strong></div>
                    <button 
                      className="nav-btn-primary" 
                      style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => alert(`✅ Successfully updated ${selectedEmail.company} to ${selectedEmail.stage} stage with deadline ${selectedEmail.date}!`)}>
                      ✓ Confirm &amp; Sync to Kanban
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* ── 3 Key Pillars Section ── */}
        <section className="section-wrap" id="features">
          <div className="section-head">
            <div className="section-tag">Engineered for Real Job Hunts</div>
            <h2 className="section-title">Everything you need to turn applications into offers</h2>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="f-icon">🧩</div>
              <div className="f-title">Two-Way Chrome Sync</div>
              <div className="f-desc">
                Save roles directly while browsing LinkedIn or Internshala with 1 click. Highlights companies you've already applied to so you never duplicate applications.
              </div>
            </div>

            <div className="feature-card">
              <div className="f-icon">🎯</div>
              <div className="f-title">ATS Resume Matcher</div>
              <div className="f-desc">
                Paste any job description to instantly see your keyword match percentage, missing technical stacks, and get AI-optimized resume bullet points.
              </div>
            </div>

            <div className="feature-card">
              <div className="f-icon">👥</div>
              <div className="f-title">Recruiter Networking CRM</div>
              <div className="f-desc">
                Keep track of every engineer and recruiter you contact. Generates hyper-personalized cold outreach messages and schedules follow-up reminders.
              </div>
            </div>

            <div className="feature-card">
              <div className="f-icon">⚡</div>
              <div className="f-title">Today Priority Stack</div>
              <div className="f-desc">
                No more wondering what to do next. The system calculates your highest-leverage task today and warns you when applications stay silent for more than 7 days.
              </div>
            </div>

            <div className="feature-card">
              <div className="f-icon">📅</div>
              <div className="f-title">Calendar &amp; CSV Freedom</div>
              <div className="f-desc">
                Sync all your deadlines straight into Google Calendar or Apple Calendar (`.ics`), or export your complete dataset to CSV anytime with zero platform lock-in.
              </div>
            </div>

            <div className="feature-card">
              <div className="f-icon">🔒</div>
              <div className="f-title">Zero-Access Privacy</div>
              <div className="f-desc">
                We never ask for your Google account passwords or private inbox permissions. Your data stays in your own private cloud container.
              </div>
            </div>
          </div>
        </section>

        {/* ── Final Banner CTA ── */}
        <section className="section-wrap">
          <div className="cta-banner">
            <h2 className="cta-title">Ready to conquer your internship search?</h2>
            <p className="cta-sub">
              Join students and job seekers organizing their applications with DeadlineDesk. Free forever, no credit card required.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="hero-btn-main" style={{ background: '#ffffff', color: '#0f172a' }}>
                Create Free Account →
              </Link>
              <a 
                href="/deadlinedesk-extension.zip" 
                download="deadlinedesk-extension.zip" 
                className="hero-btn-secondary" 
                style={{ background: 'transparent', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
                📦 Download Chrome Extension (.zip)
              </a>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="home-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo192.png" width="22" height="22" alt="Logo" style={{ borderRadius: '6px' }} />
            <span><strong>DeadlineDesk</strong> • Engineered by Kanupriya Varshney</span>
          </div>

          <div className="footer-links">
            <a href="https://github.com/kanu-priy/Internship-Tracker" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
            <a href="/deadlinedesk-extension.zip" download="deadlinedesk-extension.zip" className="footer-link">Extension</a>
            <Link to="/login" className="footer-link">Sign In</Link>
            <Link to="/register" className="footer-link">Register</Link>
          </div>
        </footer>

      </div>
    </>
  );
}
