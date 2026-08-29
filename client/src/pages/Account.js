import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .account-root {
    display: flex;
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', -apple-system, sans-serif;
    color: var(--text);
  }

  .account-main-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 60px 40px;
  }

  .account-card {
    width: 100%;
    max-width: 520px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  }

  .account-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .account-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #f3f4f6;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 32px;
    color: #111827;
    margin: 0 auto 16px auto;
  }

  .account-name {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
  }

  .account-email {
    font-size: 14px;
    color: #6b7280;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  .pref-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
  }

  .pref-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: #fafbfc;
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .pref-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pref-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }

  .pref-desc {
    font-size: 12px;
    color: #6b7280;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #cbd5e1;
    transition: .3s;
    border-radius: 24px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #0f172a;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }

  .btn-test {
    width: 100%;
    padding: 10px 16px;
    background: #f1f5f9;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: #334155;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    margin-bottom: 24px;
    transition: all 0.2s;
  }

  .btn-test:hover {
    background: #e2e8f0;
  }

  .btn-logout {
    width: 100%;
    padding: 12px 20px;
    background: transparent;
    border: 1px solid #fee2e2;
    border-radius: 8px;
    color: #dc2626;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-logout:hover {
    background: #fee2e2;
  }
`;

export default function MyAccount() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [prefs, setPrefs] = useState({ deadlines: true, staleAlerts: true, weeklyDigest: true });
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const res = await fetch("http://localhost:5000/api/me/preferences", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({ name: data.name, email: data.email });
          if (data.emailPreferences) {
            setPrefs(data.emailPreferences);
          }
        }
      } catch (err) {
        console.error("Failed to load user preferences", err);
      }
    }
    loadPreferences();
  }, [navigate]);

  const handleToggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/me/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emailPreferences: updated })
      });
      if (res.ok) {
        setToast({ message: "Email preferences saved!", type: "success" });
      }
    } catch (err) {
      setToast({ message: "Failed to update preferences", type: "error" });
    }
  };

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/me/test-email", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: "Test notification dispatched to your email!", type: "success" });
      } else {
        setToast({ message: "Failed to send test notification", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Error triggering test notification", type: "error" });
    } finally {
      setSendingTest(false);
    }
  };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="account-root">
        <Sidebar />
        <div className="account-main-wrap">
          <div className="account-card">
            <div className="account-header">
              <div className="account-avatar">
                {profile.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="account-name">{profile.name || "User Account"}</div>
              <div className="account-email">{profile.email || ""}</div>
            </div>

            <div className="section-title">Email Notifications</div>
            
            <div className="pref-group">
              <div className="pref-row">
                <div className="pref-info">
                  <div className="pref-title">Deadline Alerts (3d & 1d out)</div>
                  <div className="pref-desc">Urgent emails when deadlines are approaching</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={prefs.deadlines}
                    onChange={() => handleToggle("deadlines")}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="pref-row">
                <div className="pref-info">
                  <div className="pref-title">Follow-up & Stale Reminders</div>
                  <div className="pref-desc">Alerts when no company update in 14+ days</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={prefs.staleAlerts}
                    onChange={() => handleToggle("staleAlerts")}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="pref-row">
                <div className="pref-info">
                  <div className="pref-title">Sunday Weekly Digest</div>
                  <div className="pref-desc">Weekly progress summary & AI action items</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={prefs.weeklyDigest}
                    onChange={() => handleToggle("weeklyDigest")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <button className="btn-test" onClick={handleSendTestEmail} disabled={sendingTest}>
              {sendingTest ? "Sending..." : "⚡ Send Test Notification Email"}
            </button>

            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />
      </div>
    </>
  );
}