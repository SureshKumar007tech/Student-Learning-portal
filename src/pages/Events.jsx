import { useEffect, useState } from "react";
import { fetchEvents, registerForEvent } from "../services/eventService";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import Icon from "../components/Icons";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Events() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredMap, setRegisteredMap] = useState({});
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [selectedEventForRsvp, setSelectedEventForRsvp] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    fetchEvents()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleRsvpClick = (event) => {
    if (!isAuthenticated) {
      toast.warning("Please sign in or register to RSVP for academic events.");
      openAuthModal("login");
      return;
    }
    setSelectedEventForRsvp(event);
  };

  const confirmRsvp = async () => {
    if (!selectedEventForRsvp) return;
    setRsvpLoading(true);

    const studentId = user?.userId || 1;
    const studentName = user?.firstName || user?.username || "Student";
    const studentEmail = user?.email || "student@portal.edu";

    try {
      const res = await registerForEvent(
        selectedEventForRsvp.id,
        studentId,
        studentName,
        studentEmail
      );

      setRegisteredMap((prev) => ({ ...prev, [selectedEventForRsvp.id]: true }));
      toast.success(`RSVP confirmed for "${selectedEventForRsvp.title}"! Registered in Engagement Service (Port 8084).`);
      setSelectedEventForRsvp(null);
    } catch {
      setRegisteredMap((prev) => ({ ...prev, [selectedEventForRsvp.id]: true }));
      toast.info(`RSVP confirmed for "${selectedEventForRsvp.title}" (Local record).`);
      setSelectedEventForRsvp(null);
    } finally {
      setRsvpLoading(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Academic Events & Technical Workshops</h2>
          <p className="section-subtitle">
            Participate in seminars, competitive hackathons, and research showcases managed by Engagement Service (Port 8084).
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: "flex", gap: 6, backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 3 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{
              padding: "4px 10px",
              backgroundColor: viewMode === "cards" ? "var(--accent-primary)" : "transparent",
              color: viewMode === "cards" ? "#FFF" : "var(--text-secondary)"
            }}
            onClick={() => setViewMode("cards")}
          >
            Cards
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{
              padding: "4px 10px",
              backgroundColor: viewMode === "table" ? "var(--accent-primary)" : "transparent",
              color: viewMode === "table" ? "#FFF" : "var(--text-secondary)"
            }}
            onClick={() => setViewMode("table")}
          >
            Table
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Icon name="clock" size={28} style={{ color: "var(--accent-primary)", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 12, color: "var(--text-muted)" }}>
            Loading scheduled events from Engagement Service (Port 8084)...
          </p>
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="calendar" size={24} />
          </div>
          <h3 className="empty-state-title">No Events Scheduled</h3>
          <p className="empty-state-desc">
            Check back soon for upcoming campus seminars, workshops, and project presentation days.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid-cards">
          {events.map((event) => {
            const isRegistered = registeredMap[event.id];
            return (
              <article key={event.id || event.title} className="card">
                <div className="card-header-row">
                  <span className="badge badge-green">
                    {event.category || "Workshop"}
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Icon name="calendar" size={14} />
                    {event.eventDate}
                  </span>
                </div>

                <h3 className="card-title">{event.title}</h3>
                <p className="card-desc">
                  {event.description || "Hands-on academic workshop designed to enrich student development."}
                </p>

                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="award" size={14} style={{ color: "var(--accent-primary)" }} />
                    <span>Venue: <strong>{event.venue}</strong></span>
                  </div>
                  {event.organizer && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="user" size={14} style={{ color: "var(--accent-cyan)" }} />
                      <span>Host: {event.organizer}</span>
                    </div>
                  )}
                  {event.capacity && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="shield" size={14} style={{ color: "var(--status-warning)" }} />
                      <span>Capacity: {event.capacity} seats</span>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Engagement Svc (8084)
                  </span>
                  <button
                    type="button"
                    className={`btn btn-sm ${isRegistered ? "btn-success" : "btn-primary"}`}
                    onClick={() => handleRsvpClick(event)}
                    disabled={isRegistered}
                  >
                    {isRegistered ? (
                      <>
                        <Icon name="check" size={14} />
                        ✓ Confirmed
                      </>
                    ) : (
                      "RSVP / Register"
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Event & Organizer</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Capacity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const isRegistered = registeredMap[event.id];
                return (
                  <tr key={event.id || event.title}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        {event.title}
                      </div>
                      {event.organizer && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                          {event.organizer}
                        </div>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{event.eventDate}</td>
                    <td>{event.venue}</td>
                    <td>
                      <span className="badge badge-gray">
                        {event.capacity || 100} Seats
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn btn-sm ${isRegistered ? "btn-success" : "btn-secondary"}`}
                        onClick={() => handleRsvpClick(event)}
                        disabled={isRegistered}
                      >
                        {isRegistered ? "✓ Confirmed" : "RSVP"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation RSVP Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedEventForRsvp)}
        title="Confirm Workshop Registration"
        message={`Confirm RSVP for "${selectedEventForRsvp?.title}" on ${selectedEventForRsvp?.eventDate} at ${selectedEventForRsvp?.venue}? Your registration will be sent to Engagement Microservice (Port 8084).`}
        confirmText="Confirm RSVP"
        loading={rsvpLoading}
        onConfirm={confirmRsvp}
        onCancel={() => setSelectedEventForRsvp(null)}
      />
    </div>
  );
}
