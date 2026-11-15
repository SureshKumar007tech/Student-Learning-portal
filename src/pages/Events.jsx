import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchEvents, registerForEvent, cancelEventRegistration, fetchMyEventRegistrations } from "../services/eventService";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import Icon from "../components/Icons";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  Alert,
  DateChip,
  EmptyState,
  ErrorState,
  LoadingGrid,
  PageHeader,
  ProgressBar,
  parseEventDate
} from "../components/ui";

function seatInfo(event, isRegistered) {
  const capacity = Number(event.capacity) || 0;
  const registered = Number(event.registeredCount) || 0;
  const remaining = Math.max(0, capacity - registered);
  const isFull = capacity > 0 && remaining <= 0 && !isRegistered;
  const pct = capacity > 0 ? Math.round((registered / capacity) * 100) : 0;
  return { capacity, registered, remaining, isFull, pct };
}

export default function Events() {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [registeredMap, setRegisteredMap] = useState({});
  const [registrationsError, setRegistrationsError] = useState(false);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' | 'table'
  const [showMine, setShowMine] = useState(false);
  const [selectedEventForRsvp, setSelectedEventForRsvp] = useState(null);
  const [selectedEventForCancel, setSelectedEventForCancel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadEventData = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setStatus("loading");
      try {
        const data = await fetchEvents();
        setEvents(data);
        setStatus("ready");
      } catch (err) {
        setLoadError(err.message);
        setStatus("error");
        return;
      }

      if (isAuthenticated) {
        try {
          const myRegs = await fetchMyEventRegistrations();
          const map = {};
          myRegs
            .filter((r) => (r.status || "CONFIRMED").toUpperCase() !== "CANCELLED")
            .forEach((r) => {
              map[r.eventId] = true;
            });
          setRegisteredMap(map);
          setRegistrationsError(false);
        } catch {
          setRegistrationsError(true);
        }
      } else {
        setRegisteredMap({});
        setRegistrationsError(false);
        setShowMine(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  const sortedEvents = useMemo(() => {
    const list = showMine ? events.filter((e) => registeredMap[e.id]) : events;
    return [...list].sort((a, b) => {
      const da = parseEventDate(a.eventDate);
      const db = parseEventDate(b.eventDate);
      if (!da || !db) return 0;
      return da - db;
    });
  }, [events, registeredMap, showMine]);

  const myCount = Object.keys(registeredMap).length;

  const handleRsvpClick = (event) => {
    if (!isAuthenticated) {
      toast.info("Sign in or create an account to register for events.", "Sign in required");
      openAuthModal("login");
      return;
    }
    setSelectedEventForRsvp(event);
  };

  const confirmRsvp = async () => {
    const event = selectedEventForRsvp;
    if (!event) return;
    setActionLoading(true);
    try {
      const res = await registerForEvent(event.id, user?.userId, user?.firstName || user?.username, user?.email);
      if (res.success) {
        setRegisteredMap((prev) => ({ ...prev, [event.id]: true }));
        toast.success(`Your seat at ${event.title} is reserved.`, "You're registered");
        setSelectedEventForRsvp(null);
        loadEventData({ quiet: true });
      } else {
        toast.error(res.error || "We couldn't register you for this event.");
      }
    } catch {
      toast.error("We couldn't register you for this event. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCancel = async () => {
    const event = selectedEventForCancel;
    if (!event) return;
    setActionLoading(true);
    try {
      const res = await cancelEventRegistration(event.id);
      if (res.success) {
        setRegisteredMap((prev) => {
          const copy = { ...prev };
          delete copy[event.id];
          return copy;
        });
        toast.success(`Your registration for ${event.title} was cancelled.`, "Registration cancelled");
        setSelectedEventForCancel(null);
        loadEventData({ quiet: true });
      } else {
        toast.error(res.error || "We couldn't cancel this registration.");
      }
    } catch {
      toast.error("We couldn't cancel this registration. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const renderAction = (event, compact = false) => {
    const isRegistered = Boolean(registeredMap[event.id]);
    const { isFull } = seatInfo(event, isRegistered);
    if (isRegistered) {
      return (
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <span className="badge badge-success">
            <Icon name="check" size={12} /> Registered
          </span>
          <button
            type="button"
            className="btn btn-danger-ghost btn-sm"
            onClick={() => setSelectedEventForCancel(event)}
            aria-label={`Cancel registration for ${event.title}`}
          >
            Cancel
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        className={`btn btn-sm ${isFull ? "btn-secondary" : "btn-primary"}`}
        onClick={() => handleRsvpClick(event)}
        disabled={isFull}
        aria-label={isFull ? `${event.title} is full` : `Register for ${event.title}`}
      >
        {isFull ? "Fully booked" : compact ? "Register" : "Reserve a seat"}
      </button>
    );
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Events"
        title="Workshops and campus events"
        lead="Seminars, hackathons and project showcases from across the university. Reserve a seat and it will show up in your reminders."
      />

      <section className="section" aria-labelledby="events-list-heading">
        <h2 id="events-list-heading" className="visually-hidden">Event list</h2>

        <div className="toolbar">
          <div>
            <span className="toolbar-label" id="events-show-label">Show</span>
            <div className="segmented" role="group" aria-labelledby="events-show-label">
              <button type="button" aria-pressed={!showMine} onClick={() => setShowMine(false)}>
                All events
              </button>
              <button
                type="button"
                aria-pressed={showMine}
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuthModal("login");
                    return;
                  }
                  setShowMine(true);
                }}
              >
                My registrations{isAuthenticated && status === "ready" ? ` (${myCount})` : ""}
              </button>
            </div>
          </div>
          <div>
            <span className="toolbar-label" id="events-view-label">View</span>
            <div className="segmented" role="group" aria-labelledby="events-view-label">
              <button type="button" aria-pressed={viewMode === "cards"} onClick={() => setViewMode("cards")}>
                <Icon name="grid" size={14} /> Cards
              </button>
              <button type="button" aria-pressed={viewMode === "table"} onClick={() => setViewMode("table")}>
                <Icon name="list" size={14} /> List
              </button>
            </div>
          </div>
        </div>

        {registrationsError && (
          <Alert
            type="warning"
            action={
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => loadEventData({ quiet: true })}>
                Retry
              </button>
            }
          >
            We couldn't check which events you're registered for, so registration badges may be missing.
          </Alert>
        )}

        {status === "loading" && <LoadingGrid count={4} label="Loading events" />}

        {status === "error" && (
          <ErrorState title="We couldn't load events" description={loadError} onRetry={() => loadEventData()} />
        )}

        {status === "ready" && sortedEvents.length === 0 && (
          showMine ? (
            <EmptyState icon="calendar" title="You haven't registered for any events" description="Browse all events and reserve a seat at anything that interests you.">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowMine(false)}>
                Show all events
              </button>
            </EmptyState>
          ) : (
            <EmptyState icon="calendar" title="No events scheduled yet" description="Check back soon for workshops, seminars and project showcases." />
          )
        )}

        {status === "ready" && sortedEvents.length > 0 && viewMode === "cards" && (
          <div className="grid-cards">
            {sortedEvents.map((event) => {
              const isRegistered = Boolean(registeredMap[event.id]);
              const seats = seatInfo(event, isRegistered);
              return (
                <article key={event.id ?? event.title} className="card card-interactive">
                  <div className="event-head">
                    <DateChip value={event.eventDate} />
                    <div style={{ minWidth: 0 }}>
                      {event.category && <span className="badge badge-neutral" style={{ marginBottom: 6 }}>{event.category}</span>}
                      <h3 className="card-title" style={{ marginBottom: 0 }}>{event.title}</h3>
                    </div>
                  </div>

                  {event.description && <p className="card-desc">{event.description}</p>}

                  <div className="card-meta" style={{ flexDirection: "column", gap: 6 }}>
                    <span><Icon name="calendar" size={14} />{event.eventDate}{event.time ? ` · ${event.time}` : ""}</span>
                    {event.venue && <span><Icon name="map-pin" size={14} />{event.venue}</span>}
                    {event.organizer && <span><Icon name="users" size={14} />{event.organizer}</span>}
                  </div>

                  {seats.capacity > 0 && (
                    <div className="capacity">
                      <div className="capacity-label">
                        <span>{seats.registered} of {seats.capacity} seats taken</span>
                        <span style={{ color: seats.remaining === 0 ? "var(--status-error)" : undefined, fontWeight: 600 }}>
                          {seats.remaining === 0 ? "Full" : `${seats.remaining} left`}
                        </span>
                      </div>
                      <ProgressBar
                        value={seats.pct}
                        label={`${seats.registered} of ${seats.capacity} seats taken`}
                        tone={seats.pct >= 90 ? "is-warning" : "none"}
                      />
                    </div>
                  )}

                  <div className="card-footer card-footer-end">{renderAction(event)}</div>
                </article>
              );
            })}
          </div>
        )}

        {status === "ready" && sortedEvents.length > 0 && viewMode === "table" && (
          <div className="table-wrapper">
            <table className="data-table table-responsive">
              <caption className="visually-hidden">Upcoming events</caption>
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Date</th>
                  <th scope="col">Venue</th>
                  <th scope="col">Seats</th>
                  <th scope="col"><span className="visually-hidden">Action</span></th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map((event) => {
                  const isRegistered = Boolean(registeredMap[event.id]);
                  const seats = seatInfo(event, isRegistered);
                  return (
                    <tr key={event.id ?? event.title}>
                      <td data-label="Event" className="cell-wrap">
                        <div className="cell-strong">{event.title}</div>
                        {event.organizer && <div className="cell-sub">{event.organizer}</div>}
                      </td>
                      <td data-label="Date" style={{ whiteSpace: "nowrap" }}>{event.eventDate}</td>
                      <td data-label="Venue">{event.venue}</td>
                      <td data-label="Seats">
                        {seats.capacity > 0 ? (
                          <span className={`badge ${seats.remaining === 0 ? "badge-danger" : "badge-neutral"}`}>
                            {seats.remaining === 0 ? "Full" : `${seats.remaining} of ${seats.capacity} free`}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td data-label="Action">{renderAction(event, true)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={Boolean(selectedEventForRsvp)}
        title="Reserve your seat?"
        message={
          selectedEventForRsvp
            ? `You'll be registered for ${selectedEventForRsvp.title}${selectedEventForRsvp.eventDate ? ` on ${selectedEventForRsvp.eventDate}` : ""}${selectedEventForRsvp.venue ? ` at ${selectedEventForRsvp.venue}` : ""}.`
            : ""
        }
        confirmText="Reserve seat"
        loadingText="Registering…"
        loading={actionLoading}
        onConfirm={confirmRsvp}
        onCancel={() => setSelectedEventForRsvp(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(selectedEventForCancel)}
        type="danger"
        title="Cancel your registration?"
        message={`Your seat at ${selectedEventForCancel?.title || "this event"} will be released for other students.`}
        confirmText="Cancel registration"
        cancelText="Keep my seat"
        loadingText="Cancelling…"
        loading={actionLoading}
        onConfirm={confirmCancel}
        onCancel={() => setSelectedEventForCancel(null)}
      />
    </div>
  );
}
