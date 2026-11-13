import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { useTheme } from "../hooks/ThemeContext";
import { useToast } from "../hooks/ToastContext";
import Icon from "./Icons";
import NotificationDropdown from "./NotificationDropdown";
import GlobalSearchModal from "./GlobalSearchModal";

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState("Connected");
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    toast.info("You have been signed out successfully.");
    navigate("/");
  };

  const getInitials = (u) => {
    if (!u) return "S";
    if (u.firstName && u.lastName) {
      return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    }
    return (u.username || "S")[0].toUpperCase();
  };

  return (
    <>
      {/* Top System & Announcement Ribbon */}
      <div className="top-announcement">
        <div className="top-announcement-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="announcement-badge">Major Project LMS</span>
            <span style={{ display: "inline-block" }}>
              University Enterprise Architecture • Distributed Microservices & React 19
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              className="top-gateway-pill"
              onClick={() => {
                toast.info("API Gateway routing active on port 8080 targeting 5 microservices (8081-8084)");
              }}
              title="Click for gateway details"
            >
              <span className="pulse-dot" />
              <span>Gateway 8080: {gatewayStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="portal-header">
        <div className="header-container">
          {/* Logo & Platform Name */}
          <Link to="/" className="brand-section">
            <div className="logo-badge">
              <Icon name="book" size={20} />
            </div>
            <div className="brand-text">
              <h1>StudentPortal</h1>
              <span className="brand-subtitle">Enterprise LMS Platform</span>
            </div>
          </Link>

          {/* Quick Global Search Trigger */}
          <button
            type="button"
            className="global-search-btn"
            onClick={() => setSearchOpen(true)}
            aria-label="Search courses and resources"
          >
            <Icon name="search" size={16} />
            <span>Quick search...</span>
            <span className="search-kbd">Ctrl+K</span>
          </button>

          {/* Navigation Links */}
          <nav className="nav-links-wrapper">
            <Link to="/" className="nav-link-item">Home</Link>
            <Link to="/courses" className="nav-link-item">Courses</Link>
            <Link to="/dashboard" className="nav-link-item">Dashboard</Link>
            <Link to="/resources" className="nav-link-item">Resources</Link>
            <Link to="/events" className="nav-link-item">Events</Link>
            {isAdmin && (
              <Link to="/admin" className="nav-link-item" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
                Admin
              </Link>
            )}
            <Link to="/contact" className="nav-link-item">Support</Link>
            <Link to="/about" className="nav-link-item">About</Link>
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="header-actions">
            {/* Theme Toggle Button */}
            <button
              type="button"
              className="icon-btn"
              onClick={toggleTheme}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              <Icon name={darkMode ? "sun" : "moon"} size={18} />
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* User Profile or Sign In */}
            {isAuthenticated ? (
              <div className="user-profile-menu" ref={profileMenuRef}>
                <button
                  type="button"
                  className="user-avatar-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="avatar-circle">
                    {getInitials(user)}
                  </div>
                  <span className="avatar-name">
                    {user.firstName || user.username}
                  </span>
                  <Icon name="chevron-down" size={14} style={{ color: "var(--text-muted)" }} />
                </button>

                {profileDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">
                        {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username}
                      </div>
                      <div className="dropdown-user-email">
                        {user.email || `${user.username}@portal.edu`}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <span className={`badge ${isAdmin ? "badge-amber" : "badge-blue"}`}>
                          {isAdmin ? "Administrator" : "Student"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate("/dashboard");
                      }}
                    >
                      <Icon name="dashboard" size={16} />
                      Student Dashboard
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate("/admin");
                        }}
                      >
                        <Icon name="shield" size={16} />
                        Admin Management Console
                      </button>
                    )}

                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate("/about");
                      }}
                    >
                      <Icon name="code" size={16} />
                      React 19 Syllabus Lab
                    </button>

                    <div style={{ height: 1, backgroundColor: "var(--border-color)", margin: "4px 0" }} />

                    <button
                      type="button"
                      className="dropdown-item danger"
                      onClick={handleLogout}
                    >
                      <Icon name="x" size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => openAuthModal("login")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => openAuthModal("register")}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
