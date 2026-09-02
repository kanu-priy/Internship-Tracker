import { useLocation, Link } from "react-router-dom";

const styles = `
  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: #f0ede8;
    border-right: 1px solid #e4e0d9;
    display: flex;
    flex-direction: column;
    padding: 24px 0;
    font-family: 'Outfit', -apple-system, sans-serif;
    flex-shrink: 0;
    position: relative;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
    margin-bottom: 32px;
    text-decoration: none;
  }

  .sidebar-logo-icon {
    width: 36px;
    height: 36px;
    background: #6b2737;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #ffffff;
    font-size: 16px;
    font-weight: 800;
    box-shadow: 0 4px 12px rgba(107, 39, 55, 0.25);
    transition: transform 0.2s ease;
  }

  .sidebar-logo:hover .sidebar-logo-icon {
    transform: rotate(6deg) scale(1.04);
  }

  .sidebar-logo-text-wrap {
    display: flex;
    flex-direction: column;
  }

  .sidebar-logo-text {
    font-weight: 800;
    font-size: 18px;
    color: #2a2a2a;
    letter-spacing: -0.4px;
    line-height: 1.1;
  }

  .sidebar-logo-text span {
    color: #6b2737;
  }

  .sidebar-logo-sub {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    color: #8a857e;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 2px;
  }

  .sidebar-section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #8a857e;
    padding: 0 20px;
    margin-bottom: 12px;
  }

  .sidebar-nav {
    list-style: none;
    padding: 0 12px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #6a655e;
    text-decoration: none;
    transition: all 0.2s ease;
    border-radius: 12px;
  }

  .sidebar-link:hover {
    background: rgba(107, 39, 55, 0.06);
    color: #2a2a2a;
    transform: translateX(2px);
  }

  .sidebar-link.active {
    background: #6b2737;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(107, 39, 55, 0.28);
  }

  .sidebar-link-icon {
    width: 17px;
    height: 17px;
    opacity: 0.85;
    flex-shrink: 0;
  }

  .sidebar-link.active .sidebar-link-icon { opacity: 1; }

  .sidebar-footer {
    margin-top: auto;
    padding: 16px 20px;
    border-top: 1px solid #e4e0d9;
  }

  .sidebar-version {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: #8a857e;
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
    label: "Add Application",
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
  {
    href: "/integrations",
    label: "Data & Tools",
    icon: (
      <svg className="sidebar-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="8" height="8" rx="2"/><rect x="14" y="2" width="8" height="8" rx="2"/>
        <rect x="14" y="14" width="8" height="8" rx="2"/><path d="M6 10v4a2 2 0 0 0 2 2h4"/>
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
          <div className="sidebar-logo-icon">D</div>
          <div className="sidebar-logo-text-wrap">
            <div className="sidebar-logo-text">deadline<span>desk</span></div>
            <div className="sidebar-logo-sub">Career Hub</div>
          </div>
        </Link>

        <div className="sidebar-section-label">Navigation</div>

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
          <div className="sidebar-version">v3.0 • Bespoke Studio</div>
        </div>
      </div>
    </>
  );
}