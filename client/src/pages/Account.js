import React from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .account-root {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 40px 20px;
    box-sizing: border-box;
  }

  .account-bg-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
  }
  .ac-orb1 { width: 500px; height: 500px; background: rgba(245,158,11,0.09); top: -150px; left: -100px; }
  .ac-orb2 { width: 400px; height: 400px; background: rgba(139,92,246,0.08); bottom: -100px; right: -100px; }

  .account-grid-bg {
    position: fixed;
    inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .account-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 460px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 28px;
    overflow: hidden;
    backdrop-filter: blur(20px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.6);
    animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1);
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Header banner */
  .account-banner {
    height: 100px;
    background: linear-gradient(135deg, rgba(245,158,11,0.18), rgba(139,92,246,0.15));
    position: relative;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .account-banner-pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  /* Avatar */
  .account-avatar-wrap {
    display: flex;
    justify-content: center;
  }

  .account-avatar {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 32px;
    color: #000;
    box-shadow: 0 8px 32px rgba(245,158,11,0.45), 0 0 0 4px rgba(10,10,15,1), 0 0 0 6px rgba(245,158,11,0.2);
    margin-top: -42px;
    position: relative;
    z-index: 2;
  }

  .account-body {
    padding: 20px 36px 36px;
  }

  .account-name {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }

  .account-email-header {
    text-align: center;
    font-size: 14px;
    color: rgba(255,255,255,0.35);
    margin-bottom: 28px;
  }

  .account-fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 28px;
  }

  .account-field {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .account-field-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 15px;
  }

  .account-field-content { flex: 1; min-width: 0; }

  .account-field-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 3px;
  }

  .account-field-value {
    font-size: 15px;
    font-weight: 500;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .btn-edit-profile {
    width: 100%;
    padding: 14px;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.22);
    border-radius: 13px;
    color: #fbbf24;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-edit-profile:hover {
    background: rgba(245,158,11,0.2);
    border-color: rgba(245,158,11,0.38);
  }

  .btn-logout {
    width: 100%;
    padding: 14px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 13px;
    color: #f87171;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-logout:hover {
    background: rgba(239,68,68,0.2);
    border-color: rgba(239,68,68,0.38);
  }
`;

export default function MyAccount() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <style>{styles}</style>
      <div className="account-root">
        <div className="account-bg-orb ac-orb1" />
        <div className="account-bg-orb ac-orb2" />
        <div className="account-grid-bg" />

        <div className="account-card">
          {/* Banner */}
          <div className="account-banner">
            <div className="account-banner-pattern" />
          </div>

          {/* Avatar */}
          <div className="account-avatar-wrap">
            <div className="account-avatar">
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </div>
          </div>

          <div className="account-body">
            <div className="account-name">{user?.name || "Unknown User"}</div>
            <div className="account-email-header">{user?.email || "No email"}</div>

            <div className="account-fields">
              <div className="account-field">
                <div className="account-field-icon">👤</div>
                <div className="account-field-content">
                  <div className="account-field-label">Full Name</div>
                  <div className="account-field-value">{user?.name || "—"}</div>
                </div>
              </div>

              <div className="account-field">
                <div className="account-field-icon">✉️</div>
                <div className="account-field-content">
                  <div className="account-field-label">Email Address</div>
                  <div className="account-field-value">{user?.email || "—"}</div>
                </div>
              </div>
            </div>

            <div className="account-actions">
              
              <button
                className="btn-logout"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}