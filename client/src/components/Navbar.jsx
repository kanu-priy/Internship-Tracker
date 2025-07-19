import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/signup';

  if (isAuthPage) return null;

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/">Logout</Link>
    </nav>
  );
}
export default Navbar;