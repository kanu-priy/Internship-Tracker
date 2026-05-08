import { useLocation } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: #0d0d14;
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    padding: 28px 0;
    font-family: 'DM Sans', sans-serif;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .sidebar-glow {
    position: absolute;
    width: 200px;
    height: 200px;
    background: rgba(245,158,11,0.07);
    border-radius: 50%;
    filter: blur(60px);
    bottom: 40px;
    left: -60px;
    pointer-events: none;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 24px;
    margin-bottom: 36px;
  }

  .sidebar-logo-icon {
    width: 34px;
    height: 34px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 4px 16px rgba(245,158,11,0.35);
    flex-shrink: 0;
  }

  .sidebar-logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 16px;
    color: #fff;
    letter-spacing: -0.3px;
  }

  .sidebar-logo-text span { color: #f59e0b; }

  .sidebar-section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.2);
    padding: 0 24px;
    margin-bottom: 8px;
  }

  .sidebar-nav {
    list-style: none;
    padding: 0;
    margin: 0 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255,255,255,0.45);
    text-decoration: none;
    transition: all 0.18s ease;
    position: relative;
  }

  .sidebar-link:hover {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.85);
  }

  .sidebar-link.active {
    background: rgba(245,158,11,0.12);
    color: #fbbf24;
    border: 1px solid rgba(245,158,11,0.18);
  }

  .sidebar-link-icon {
    width: 18px;
    height: 18px;
    opacity: 0.7;
    flex-shrink: 0;
  }

  .sidebar-link.active .sidebar-link-icon { opacity: 1; }

  .sidebar-link-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #f59e0b;
    position: absolute;
    right: 14px;
    box-shadow: 0 0 8px rgba(245,158,11,0.6);
  }

  .sidebar-divider {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 16px 24px;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 16px 24px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .sidebar-version {
    font-size: 11px;
    color: rgba(255,255,255,0.2);
  }
`;

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/add",
    label: "Add Internship",
    icon: (
      <svg className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    href: "/account",
    label: "My Account",
    icon: (
      <svg className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <>
      <style>{styles}</style>
      <div className="sidebar">
        <div className="sidebar-glow" />

        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📋</div>
          <div className="sidebar-logo-text">Deadline<span>Desk</span></div>
        </div>

        <div className="sidebar-section-label">Menu</div>

        <ul className="sidebar-nav">
          {navItems.map(({ href, label, icon }) => {
            const isActive = location.pathname === href;
            return (
              <li key={href}>
                <a href={href} className={`sidebar-link ${isActive ? "active" : ""}`}>
                  {icon}
                  {label}
                  {isActive && <span className="sidebar-link-dot" />}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-version">DeadlineDesk v1.0</div>
        </div>
      </div>
    </>
  );
}