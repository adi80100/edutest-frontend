import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1 className="logo">EduTest</h1>
        </div>
        <div className="header-right">
          <span className="user-name">Welcome, {user?.name}</span>
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <nav className="nav">
          <ul>
            <li>
              <Link 
                to="/dashboard" 
                className={isActiveRoute('/dashboard') ? 'active' : ''}
              >
                📊 Dashboard
              </Link>
            </li>
            
            {user?.role === 'admin' ? (
              <>
                <li className="nav-section">
                  <span className="nav-section-title">Admin</span>
                </li>
                <li>
                  <Link 
                    to="/admin" 
                    className={isActiveRoute('/admin') && location.pathname === '/admin' ? 'active' : ''}
                  >
                    🏠 Admin Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/tests" 
                    className={isActiveRoute('/admin/tests') ? 'active' : ''}
                  >
                    📝 Tests
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/users" 
                    className={isActiveRoute('/admin/users') ? 'active' : ''}
                  >
                    👥 Users
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/analytics" 
                    className={isActiveRoute('/admin/analytics') ? 'active' : ''}
                  >
                    📈 Analytics
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-section">
                  <span className="nav-section-title">Student</span>
                </li>
                <li>
                  <Link 
                    to="/student" 
                    className={isActiveRoute('/student') ? 'active' : ''}
                  >
                    🎓 My Tests
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/results" 
                    className={isActiveRoute('/results') ? 'active' : ''}
                  >
                    📋 My Results
                  </Link>
                </li>
              </>
            )}
            
            <li className="nav-section">
              <span className="nav-section-title">Account</span>
            </li>
            <li>
              <Link 
                to="/profile" 
                className={isActiveRoute('/profile') ? 'active' : ''}
              >
                👤 Profile
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
