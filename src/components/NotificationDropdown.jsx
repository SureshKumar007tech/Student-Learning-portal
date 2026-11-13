import { useState, useRef, useEffect } from "react";
import Icon from "./Icons";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Course Available",
      desc: "Spring Boot Microservices & Gateway course is now open for enrollment.",
      time: "10m ago",
      read: false,
      type: "course"
    },
    {
      id: 2,
      title: "Upcoming Event RSVP",
      desc: "Microservices Architecture Hackathon registration closes this Friday.",
      time: "1h ago",
      read: false,
      type: "event"
    },
    {
      id: 3,
      title: "System Status Normal",
      desc: "All 5 microservices healthy via Port 8080 API Gateway.",
      time: "3h ago",
      read: true,
      type: "system"
    }
  ]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="user-profile-menu" ref={dropdownRef}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        title="Notifications"
      >
        <Icon name="bell" size={18} />
        {unreadCount > 0 && <span className="notification-badge" />}
      </button>

      {isOpen && (
        <div className="user-dropdown" style={{ width: "320px", right: 0, padding: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-ghost"
                onClick={markAllAsRead}
                style={{ fontSize: "0.75rem", padding: "2px 6px" }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border-color-subtle)",
                  backgroundColor: n.read ? "transparent" : "var(--accent-primary-subtle)",
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  transition: "background-color 0.15s ease"
                }}
              >
                <div style={{ marginTop: 2, color: "var(--accent-primary)" }}>
                  {n.type === "course" && <Icon name="book" size={16} />}
                  {n.type === "event" && <Icon name="calendar" size={16} />}
                  {n.type === "system" && <Icon name="server" size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>
                    {n.desc}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: 4 }}>
                    {n.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Microservices Event Streaming Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

