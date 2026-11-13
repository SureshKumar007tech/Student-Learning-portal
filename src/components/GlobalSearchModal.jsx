import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icons";
import { FALLBACK_COURSES } from "../services/courseService";
import { FALLBACK_RESOURCES } from "../services/resourceService";
import { FALLBACK_EVENTS } from "../services/eventService";

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // toggle open
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  const matchingCourses = normalizedQuery
    ? FALLBACK_COURSES.filter(
        (c) =>
          c.title.toLowerCase().includes(normalizedQuery) ||
          c.code.toLowerCase().includes(normalizedQuery) ||
          c.description.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const matchingResources = normalizedQuery
    ? FALLBACK_RESOURCES.filter(
        (r) =>
          r.title.toLowerCase().includes(normalizedQuery) ||
          r.description.toLowerCase().includes(normalizedQuery) ||
          r.resourceType.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const matchingEvents = normalizedQuery
    ? FALLBACK_EVENTS.filter(
        (e) =>
          e.title.toLowerCase().includes(normalizedQuery) ||
          e.venue.toLowerCase().includes(normalizedQuery) ||
          e.organizer.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: "620px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="search" size={20} style={{ color: "var(--accent-primary)" }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, resources, events across the platform..."
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              color: "var(--text-primary)"
            }}
          />
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "12px 16px" }}>
          {!normalizedQuery && (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
              <div style={{ marginBottom: 8 }}>
                <Icon name="sparkles" size={24} style={{ color: "var(--accent-cyan)" }} />
              </div>
              Type keyword to search courses (e.g. <em>React</em>, <em>Spring</em>), resources, or events...
            </div>
          )}

          {normalizedQuery &&
            matchingCourses.length === 0 &&
            matchingResources.length === 0 &&
            matchingEvents.length === 0 && (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                No platform matches found for "<strong>{query}</strong>"
              </div>
            )}

          {matchingCourses.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 8px" }}>
                Courses ({matchingCourses.length})
              </div>
              {matchingCourses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelect("/courses")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "background 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="book" size={16} style={{ color: "var(--accent-primary)" }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{c.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{c.code} • {c.durationHours}h</div>
                    </div>
                  </div>
                  <span className="badge badge-blue">{c.level}</span>
                </div>
              ))}
            </div>
          )}

          {matchingResources.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 8px" }}>
                Learning Resources ({matchingResources.length})
              </div>
              {matchingResources.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleSelect("/resources")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "background 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="layers" size={16} style={{ color: "var(--accent-cyan)" }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{r.resourceType} • {r.downloadCount} downloads</div>
                    </div>
                  </div>
                  <Icon name="download" size={14} style={{ color: "var(--text-muted)" }} />
                </div>
              ))}
            </div>
          )}

          {matchingEvents.length > 0 && (
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "6px 8px" }}>
                Academic Events ({matchingEvents.length})
              </div>
              {matchingEvents.map((e) => (
                <div
                  key={e.id}
                  onClick={() => handleSelect("/events")}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "background 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="calendar" size={16} style={{ color: "var(--status-success)" }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{e.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{e.eventDate} • {e.venue}</div>
                    </div>
                  </div>
                  <span className="badge badge-green">RSVP</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "10px 16px", background: "var(--bg-surface-subtle)", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <span>Navigate with click • Press ESC to exit</span>
          <span className="search-kbd">Ctrl + K</span>
        </div>
      </div>
    </div>
  );
}

