import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import Icon from "./Icons";

export default function Navbar() {
  const { isAuthenticated, isAdmin, openAuthModal } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Home", icon: "book" },
    { to: "/courses", label: "Courses", icon: "layers" },
    { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/resources", label: "Resources", icon: "download" },
    { to: "/events", label: "Events", icon: "calendar" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin Console", icon: "shield" }] : []),
    { to: "/contact", label: "Support", icon: "mail" },
    { to: "/about", label: "Viva Lab", icon: "code" }
  ];

  return (
    <div style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-color)", padding: "4px 20px" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Mobile menu button */}
        <button
          type="button"
          className="icon-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display: "none" }}
          id="mobile-nav-toggle"
          aria-label="Toggle navigation"
        >
          <Icon name={mobileOpen ? "x" : "menu"} size={20} />
        </button>

        {/* Quick horizontal categories bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, overflowX: "auto", padding: "6px 0", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
          <span style={{ fontWeight: 600, color: "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="sparkles" size={14} style={{ color: "var(--accent-primary)" }} />
            Quick Access:
          </span>
          <NavLink to="/courses" style={{ color: "inherit", textDecoration: "none" }}>Web Technologies</NavLink>
          <span>•</span>
          <NavLink to="/courses" style={{ color: "inherit", textDecoration: "none" }}>React Architecture</NavLink>
          <span>•</span>
          <NavLink to="/courses" style={{ color: "inherit", textDecoration: "none" }}>Spring Boot Microservices</NavLink>
          <span>•</span>
          <NavLink to="/resources" style={{ color: "inherit", textDecoration: "none" }}>Lecture Notes</NavLink>
          <span>•</span>
          <NavLink to="/events" style={{ color: "inherit", textDecoration: "none" }}>Hackathons</NavLink>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.8125rem" }}>
          <span className="badge badge-green">Spring Boot 4 + React 19</span>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{ padding: "12px 0", borderTop: "1px solid var(--border-color)" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                color: "var(--text-primary)",
                fontWeight: 500,
                borderRadius: "var(--radius-md)"
              }}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
          {!isAuthenticated && (
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => {
                  setMobileOpen(false);
                  openAuthModal("login");
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => {
                  setMobileOpen(false);
                  openAuthModal("register");
                }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
