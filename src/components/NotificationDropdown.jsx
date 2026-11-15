import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { fetchEvents, fetchMyEventRegistrations } from "../services/eventService";
import Icon from "./Icons";
import { Spinner } from "./ui";

/**
 * Notification panel. Only shows reminders backed by real data — the
 * signed-in student's confirmed event registrations. Nothing is invented.
 */
export default function NotificationDropdown() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState({ status: "idle", items: [] });
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "loading" }));
    try {
      const [registrations, events] = await Promise.all([fetchMyEventRegistrations(), fetchEvents()]);
      const registeredIds = new Set(
        registrations.filter((r) => (r.status || "CONFIRMED").toUpperCase() !== "CANCELLED").map((r) => r.eventId)
      );
      setState({ status: "ready", items: events.filter((e) => registeredIds.has(e.id)) });
    } catch {
      setState({ status: "error", items: [] });
    }
  }, []);

  useEffect(() => {
    if (isOpen && isAuthenticated) load();
  }, [isOpen, isAuthenticated, load]);

  useEffect(() => {
    if (!isAuthenticated) setState({ status: "idle", items: [] });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClick = (e) => wrapperRef.current && !wrapperRef.current.contains(e.target) && setIsOpen(false);
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  return (
    <div className="menu-anchor" ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        className="icon-btn"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Reminders"
        aria-expanded={isOpen}
        aria-controls="reminders-panel"
        title="Reminders"
      >
        <Icon name="bell" size={18} />
      </button>

      {isOpen && (
        <div id="reminders-panel" className="menu menu-wide" role="region" aria-label="Reminders">
          <div className="menu-section-head">
            <h2>Reminders</h2>
            {isAuthenticated && state.status === "ready" && (
              <span className="badge badge-neutral">{state.items.length}</span>
            )}
          </div>

          <div className="menu-scroll">
            {!isAuthenticated && (
              <div className="state state-compact" style={{ border: "none" }}>
                <p className="state-desc">Sign in to see reminders for the events you've registered for.</p>
                <div className="state-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setIsOpen(false);
                      openAuthModal("login");
                    }}
                  >
                    Sign in
                  </button>
                </div>
              </div>
            )}

            {isAuthenticated && state.status === "loading" && (
              <div className="row" style={{ padding: 16, justifyContent: "center", color: "var(--text-muted)" }} role="status">
                <Spinner /> <span className="small">Loading reminders…</span>
              </div>
            )}

            {isAuthenticated && state.status === "error" && (
              <div className="state state-compact" style={{ border: "none" }} role="alert">
                <p className="state-desc">We couldn't load your reminders right now.</p>
                <div className="state-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={load}>
                    Try again
                  </button>
                </div>
              </div>
            )}

            {isAuthenticated && state.status === "ready" && state.items.length === 0 && (
              <div className="state state-compact" style={{ border: "none" }}>
                <div className="state-icon"><Icon name="check" size={20} /></div>
                <p className="state-title">You're all caught up</p>
                <p className="state-desc">Register for an event and it will appear here.</p>
              </div>
            )}

            {isAuthenticated &&
              state.status === "ready" &&
              state.items.map((evt) => (
                <div key={evt.id} className="notice-item">
                  <div className="notice-icon">
                    <Icon name="calendar" size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="notice-title">{evt.title}</div>
                    <div className="notice-meta">
                      You're registered · {[evt.eventDate, evt.venue].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {isAuthenticated && (
            <div className="menu-foot">
              <Link to="/events" onClick={() => setIsOpen(false)} className="text-link">
                View all events <Icon name="arrow-right" size={12} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
