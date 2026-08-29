import { useLocation, Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: #ffffff;
    border-right: 1px solid #eaeaea;
    display: flex;
    flex-direction: column;
    padding: 28px 0;
    font-family: 'Inter', -apple-system, sans-serif;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 24px;
    margin-bottom: 36px;
    text-decoration: none;
  }

  .sidebar-logo-icon {
    width: 32px;
    height: 32px;
    background: #0f172a;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #ffffff;
  }

  .sidebar-logo-text {
    font-weight: 700;
    font-size: 18px;
    color: #111827;
    letter-spacing: -0.3px;
  }

  .sidebar-section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #6b7280;
    padding: 0 24px;
    margin-bottom: 12px;
  }

  .sidebar-nav {
    list-style: none;
    padding: 0 12px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #4b5563;
    text-decoration: none;
    transition: all 0.2s ease;
    border-radius: 8px;
  }

  .sidebar-link:hover {
    background: #f3f4f6;
    color: #111827;
  }

  .sidebar-link.active {
    background: #0f172a;
    color: #ffffff;
  }

  .sidebar-link-icon {
    width: 18px;
    height: 18px;
    opacity: 0.7;
    flex-shrink: 0;
  }

  .sidebar-link.active .sidebar-link-icon { opacity: 1; }

  .sidebar-footer {
    margin-top: auto;
    padding: 16px 24px;
    border-top: 1px solid #eaeaea;
  }

  .sidebar-version {
    font-size: 12px;
    color: #6b7280;
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
  {
    href: "/resume",
    label: "My Resume",
    icon: (
      <svg className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
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
        <Link to="/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '100%', height: '100%'}}>
              <path d="M8 2h8l4 10H4L8 2Z"/>
              <path d="M12 12v6"/>
              <path d="M8 22v-2c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2H8Z"/>
            </svg>
          </div>
          <div className="sidebar-logo-text">DeadlineDesk</div>
        </Link>

        <div className="sidebar-section-label">Menu</div>

        <ul className="sidebar-nav">
          {navItems.map(({ href, label, icon }) => {
            const isActive = location.pathname === href;
            return (
              <li key={href}>
                <Link to={href} className={`sidebar-link ${isActive ? "active" : ""}`}>
                  {icon}
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-version">DeadlineDesk v2.0</div>
        </div>
      </div>
    </>
  );
}