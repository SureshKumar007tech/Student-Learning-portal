import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icons";
import Modal from "./Modal";
import { fetchEvents } from "../services/eventService";
import { formatLevel, resourceTypeInfo } from "./ui";

const MAX_PER_GROUP = 5;

/** Command-palette style search across live courses, resources and events. */
export default function GlobalSearchModal({ isOpen, onClose, courses = [], resources = [] }) {
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState({ status: "idle", data: [] });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }
    // Events aren't held globally, so fetch them when search opens
    let cancelled = false;
    setEvents((prev) => ({ ...prev, status: "loading" }));
    fetchEvents()
      .then((data) => !cancelled && setEvents({ status: "ready", data }))
      .catch(() => !cancelled && setEvents({ status: "error", data: [] }));
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const q = query.toLowerCase().trim();

  const results = useMemo(() => {
    if (!q) return { courses: [], resources: [], events: [] };
    const has = (v) => (v || "").toString().toLowerCase().includes(q);
    return {
      courses: courses.filter((c) => has(c.title) || has(c.code) || has(c.description)).slice(0, MAX_PER_GROUP),
      resources: resources
        .filter((r) => has(r.title) || has(r.description) || has(resourceTypeInfo(r.resourceType).label))
        .slice(0, MAX_PER_GROUP),
      events: events.data
        .filter((e) => has(e.title) || has(e.venue) || has(e.organizer))
        .slice(0, MAX_PER_GROUP)
    };
  }, [q, courses, resources, events.data]);

  const total = results.courses.length + results.resources.length + results.events.length;

  const go = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" hideHeader labelledBy="search-label" initialFocusRef={inputRef}>
      <div className="search-palette-head">
        <Icon name="search" size={20} />
        <label id="search-label" htmlFor="global-search-input" className="visually-hidden">
          Search courses, resources and events
        </label>
        <input
          id="global-search-input"
          ref={inputRef}
          type="search"
          className="search-palette-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, resources and events"
          autoComplete="off"
        />
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search">
          <Icon name="x" size={18} />
        </button>
      </div>

      <div className="search-palette-results">
        <p className="visually-hidden" role="status" aria-live="polite">
          {q ? `${total} result${total === 1 ? "" : "s"}` : ""}
        </p>

        {!q && (
          <div className="state state-compact" style={{ border: "none" }}>
            <p className="state-desc">
              Search by course title or code, a resource name, or an event. Try a topic you're studying.
            </p>
          </div>
        )}

        {q && total === 0 && (
          <div className="state state-compact" style={{ border: "none" }}>
            <h3 className="state-title">No matches for “{query}”</h3>
            <p className="state-desc">Check the spelling or try a broader term.</p>
          </div>
        )}

        {results.courses.length > 0 && (
          <SearchGroup label="Courses">
            {results.courses.map((c) => (
              <SearchResult
                key={`c-${c.id ?? c.code}`}
                icon="book"
                title={c.title}
                sub={[c.code, formatLevel(c.level), c.durationHours ? `${c.durationHours} hrs` : null].filter(Boolean).join(" · ")}
                onSelect={() => go(`/courses?q=${encodeURIComponent(c.title)}`)}
              />
            ))}
          </SearchGroup>
        )}

        {results.resources.length > 0 && (
          <SearchGroup label="Study resources">
            {results.resources.map((r) => (
              <SearchResult
                key={`r-${r.id ?? r.title}`}
                icon="file-text"
                title={r.title}
                sub={resourceTypeInfo(r.resourceType).label}
                onSelect={() => go(`/resources?q=${encodeURIComponent(r.title)}`)}
              />
            ))}
          </SearchGroup>
        )}

        {results.events.length > 0 && (
          <SearchGroup label="Events">
            {results.events.map((e) => (
              <SearchResult
                key={`e-${e.id ?? e.title}`}
                icon="calendar"
                title={e.title}
                sub={[e.eventDate, e.venue].filter(Boolean).join(" · ")}
                onSelect={() => go("/events")}
              />
            ))}
          </SearchGroup>
        )}

        {q && events.status === "error" && (
          <p className="small muted" style={{ padding: "8px 10px" }}>
            Events couldn't be searched right now.
          </p>
        )}
      </div>

      <div className="search-palette-foot">
        <span>Tab to a result, Enter to open</span>
        <span>Esc to close</span>
      </div>
    </Modal>
  );
}

function SearchGroup({ label, children }) {
  return (
    <div role="group" aria-label={label}>
      <div className="search-group-label">{label}</div>
      {children}
    </div>
  );
}

function SearchResult({ icon, title, sub, onSelect }) {
  return (
    <button type="button" className="search-result" onClick={onSelect}>
      <Icon name={icon} size={18} />
      <span style={{ minWidth: 0 }}>
        <span className="search-result-title" style={{ display: "block" }}>{title}</span>
        {sub && <span className="search-result-sub">{sub}</span>}
      </span>
      <Icon name="arrow-right" size={14} style={{ marginLeft: "auto" }} />
    </button>
  );
}
