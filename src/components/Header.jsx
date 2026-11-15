import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { useTheme } from "../hooks/ThemeContext";
import { useToast } from "../hooks/ToastContext";
import Icon from "./Icons";
import NotificationDropdown from "./NotificationDropdown";
import GlobalSearchModal from "./GlobalSearchModal";
import { getNavItems } from "./navItems";
import { displayName, getInitials } from "./ui";

export default function Header({ courses = [], resources = [] }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const accountRef = useRef(null);
  const accountBtnRef = useRef(null);

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");

  // Close menus whenever the route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // Global Ctrl/Cmd + K opens search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Account menu: close on outside click / Escape
  useEffect(() => {
    if (!accountOpen) return undefined;
    function handleClick(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
    }
    function handleKey(event) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountBtnRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [accountOpen]);

  // Mobile drawer: Escape closes
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const handleKey = (e) => e.key === "Escape" && setMobileMenuOpen(false);
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    toast.info("You've been signed out.", "Signed out");
    navigate("/");
  };

  const goTo = (path) => {
    setAccountOpen(false);
    navigate(path);
  };

  const navItems = getNavItems(isAdmin);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Student Learning Portal — home">
            <span className="brand-mark">
              <Icon name="graduation" size={20} />
            </span>
            <span className="brand-text">
              <span className="brand-name">Student Portal</span>
              <span className="brand-tagline">Learning hub</span>
            </span>
          </Link>

          <button
            type="button"
            className="header-search"
            onClick={() => setSearchOpen(true)}
            aria-label="Search courses, resources and events"
            aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
          >
            <Icon name="search" size={16} />
            <span>Search courses, resources…</span>
            <span className="kbd" aria-hidden="true">{isMac ? "⌘K" : "Ctrl K"}</span>
          </button>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn icon-btn-search-mobile"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Icon name="search" size={18} />
            </button>

            <button
              type="button"
              className="icon-btn header-theme"
              onClick={toggleTheme}
              aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
              title={darkMode ? "Light theme" : "Dark theme"}
            >
              <Icon name={darkMode ? "sun" : "moon"} size={18} />
            </button>

            <NotificationDropdown />

            {isAuthenticated ? (
              <div className="menu-anchor" ref={accountRef}>
                <button
                  ref={accountBtnRef}
                  type="button"
                  className="account-btn"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-label={`Account menu for ${displayName(user)}`}
                >
                  <span className="avatar">{getInitials(user)}</span>
                  <span className="account-name">{user.firstName || user.username}</span>
                  <Icon name="chevron-down" size={14} className="account-chevron" />
                </button>

                {accountOpen && (
                  <div className="menu" role="menu" aria-label="Account">
                    <div className="menu-header">
                      <div className="menu-header-name">{displayName(user)}</div>
                      {user.email && <div className="menu-header-email">{user.email}</div>}
                      <div style={{ marginTop: 8 }}>
                        <span className={`badge ${isAdmin ? "badge-warning" : "badge-primary"}`}>
                          {isAdmin ? "Administrator" : "Student"}
                        </span>
                      </div>
                    </div>
                    <button type="button" role="menuitem" className="menu-item" onClick={() => goTo("/dashboard")} autoFocus>
                      <Icon name="dashboard" size={16} />
                      My dashboard
                    </button>
                    <button type="button" role="menuitem" className="menu-item" onClick={() => goTo("/courses")}>
                      <Icon name="book" size={16} />
                      Browse courses
                    </button>
                    {isAdmin && (
                      <button type="button" role="menuitem" className="menu-item" onClick={() => goTo("/admin")}>
                        <Icon name="shield" size={16} />
                        Admin console
                      </button>
                    )}
                    <button type="button" role="menuitem" className="menu-item" onClick={() => goTo("/contact")}>
                      <Icon name="help-circle" size={16} />
                      Help & support
                    </button>
                    <div className="menu-divider" role="separator" />
                    <button type="button" role="menuitem" className="menu-item danger" onClick={handleLogout}>
                      <Icon name="log-out" size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="row header-auth" style={{ flexWrap: "nowrap" }}>
                <button type="button" className="btn btn-ghost btn-sm header-auth-secondary" onClick={() => openAuthModal("login")}>
                  Sign in
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => openAuthModal("register")}>
                  Create account
                </button>
              </div>
            )}

            <button
              type="button"
              className="icon-btn mobile-menu-btn"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Icon name={mobileMenuOpen ? "x" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-navigation" className="mobile-drawer" aria-label="Main">
            <ul>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `mobile-nav-link${isActive ? " active" : ""}`}
                  >
                    <Icon name={item.icon} size={18} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="mobile-drawer-actions">
              <button type="button" className="btn btn-ghost" onClick={toggleTheme}>
                <Icon name={darkMode ? "sun" : "moon"} size={16} />
                {darkMode ? "Light theme" : "Dark theme"}
              </button>
            </div>
            {!isAuthenticated && (
              <div className="mobile-drawer-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setMobileMenuOpen(false); openAuthModal("login"); }}>
                  Sign in
                </button>
                <button type="button" className="btn btn-primary" onClick={() => { setMobileMenuOpen(false); openAuthModal("register"); }}>
                  Create account
                </button>
              </div>
            )}
          </nav>
        )}
      </header>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        courses={courses}
        resources={resources}
      />
    </>
  );
}
