import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useGreeting from "../hooks/useGreeting";
import useLocalStorage from "../hooks/useLocalStorage";
import { useAuth } from "../hooks/AuthContext";
import { useTheme } from "../hooks/ThemeContext";
import { recordVisit, checkGatewayHealth } from "../services/authService";
import { useToast } from "../hooks/ToastContext";
import Icon from "../components/Icons";
import FocusDemo from "../components/FocusDemo";
import { Alert, PageHeader, SectionHeader, Spinner } from "../components/ui";

const FEATURES = [
  { icon: "book", title: "Find and join courses", desc: "Browse the catalogue by level and enroll in the courses you need." },
  { icon: "bar-chart", title: "Track your progress", desc: "See every enrolled course on your dashboard and update progress as you go." },
  { icon: "file-text", title: "Download study materials", desc: "Lecture notes, exercises, starter projects and quick-reference sheets." },
  { icon: "calendar", title: "Join events and get help", desc: "Reserve seats at workshops and showcases, or ask student support a question." }
];

const SERVICES = [
  { key: "gateway", name: "API Gateway", port: "8080", db: "—", role: "Single entry point: routing, CORS, JWT validation" },
  { key: "user-service", name: "User Service", port: "8081", db: "user_db", role: "Registration, sign-in, tokens, student profiles" },
  { key: "course-service", name: "Course Service", port: "8082", db: "course_db", role: "Course catalogue, enrollments, progress" },
  { key: "resource-service", name: "Resource Service", port: "8083", db: "resource_db", role: "Study materials and download counts" },
  { key: "engagement-service", name: "Engagement Service", port: "8084", db: "engagement_db", role: "Events, registrations, support inquiries" }
];

export default function About() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const toast = useToast();
  const location = useLocation();

  const [name, setName] = useState(user?.firstName || "Student");
  const greeting = useGreeting(name);
  const [visits, setVisits] = useLocalStorage("portalVisits", 1);

  const [health, setHealth] = useState({ status: "idle", data: null, error: null, checkedAt: null });
  const [recordingVisit, setRecordingVisit] = useState(false);

  useEffect(() => {
    if (user?.firstName) setName(user.firstName);
  }, [user]);

  // Support /about#how-it-works links
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) window.setTimeout(() => el.scrollIntoView({ block: "start" }), 0);
  }, [location.hash]);

  const handleIncreaseVisits = async () => {
    setVisits((prev) => prev + 1);
    setRecordingVisit(true);
    const res = await recordVisit(user?.userId || 1);
    setRecordingVisit(false);
    if (res.success) toast.success("Saved in this browser and recorded by the User Service.", "Visit recorded");
    else toast.warning(`Saved in this browser only — the User Service didn't accept it (${res.error}).`, "Saved locally");
  };

  const handlePingServices = async () => {
    setHealth((prev) => ({ ...prev, status: "loading", error: null }));
    const res = await checkGatewayHealth();
    if (res.success && res.data) {
      setHealth({ status: "ready", data: res.data, error: null, checkedAt: new Date() });
    } else {
      setHealth({ status: "error", data: null, error: res.error, checkedAt: new Date() });
    }
  };

  const statusFor = (key) => {
    if (health.status === "idle") return { label: "Not checked", cls: "badge-neutral" };
    if (health.status === "loading") return { label: "Checking…", cls: "badge-neutral" };
    if (health.status === "error") return { label: "Unreachable", cls: "badge-danger" };
    const v = health.data?.[key];
    if (!v) return { label: "Not reported", cls: "badge-neutral" };
    return String(v).toUpperCase().startsWith("UP") ? { label: "Up", cls: "badge-success" } : { label: "Down", cls: "badge-danger" };
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="About"
        title="About the Student Learning Portal"
        lead="The portal brings your courses, study materials and campus events together, so you spend less time searching and more time learning."
        actions={
          <Link to="/contact" className="btn btn-secondary">
            <Icon name="help-circle" size={16} />
            Contact support
          </Link>
        }
      />

      <section className="section" aria-labelledby="features-heading">
        <SectionHeader id="features-heading" title="What you can do here" />
        <div className="grid-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <span className="feature-icon"><Icon name={f.icon} size={20} /></span>
              <h3 className="card-title" style={{ fontSize: "var(--text-md)" }}>{f.title}</h3>
              <p className="small" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture & diagnostics — technical details live here, not in student-facing pages */}
      <section className="section" id="how-it-works" aria-labelledby="arch-heading" style={{ scrollMarginTop: 90 }}>
        <SectionHeader
          id="arch-heading"
          title="How it's built"
          lead="A React single-page app talks to an API gateway, which routes requests to four independent Spring Boot services — each with its own database."
          action={
            <button type="button" className="btn btn-secondary btn-sm" onClick={handlePingServices} disabled={health.status === "loading"} aria-busy={health.status === "loading"}>
              {health.status === "loading" ? <Spinner /> : <Icon name="server" size={14} />}
              {health.status === "loading" ? "Checking services…" : "Check service status"}
            </button>
          }
        />

        {health.status === "error" && (
          <Alert type="error" title="The gateway couldn't be reached">
            {health.error} Service statuses below are unknown until the gateway responds.
          </Alert>
        )}

        <div className="table-wrapper">
          <table className="data-table table-responsive">
            <caption className="visually-hidden">Services and their status</caption>
            <thead>
              <tr>
                <th scope="col">Service</th>
                <th scope="col">Port</th>
                <th scope="col">Database</th>
                <th scope="col">Responsibility</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody aria-live="polite">
              {SERVICES.map((svc) => {
                const s = statusFor(svc.key);
                return (
                  <tr key={svc.key}>
                    <td data-label="Service" className="cell-strong">{svc.name}</td>
                    <td data-label="Port"><code>{svc.port}</code></td>
                    <td data-label="Database">{svc.db === "—" ? "Stateless" : <code>{svc.db}</code>}</td>
                    <td data-label="Responsibility" className="cell-wrap">{svc.role}</td>
                    <td data-label="Status"><span className={`badge ${s.cls}`}>{s.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {health.checkedAt && (
          <p className="small muted">Last checked {health.checkedAt.toLocaleTimeString()}.</p>
        )}
      </section>

      {/* Developer / examiner section: React syllabus demonstrations */}
      <section className="section" aria-labelledby="lab-heading">
        <SectionHeader
          id="lab-heading"
          title="React hooks lab"
          lead="For developers and examiners: live demonstrations of the React concepts used throughout the portal."
        />

        <div className="card">
          <div className="row-between" style={{ alignItems: "flex-end", gap: 20 }}>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow">Custom hook · useGreeting + useDebugValue</div>
              <p style={{ fontSize: "var(--text-xl)", fontWeight: 700 }} aria-live="polite">“{greeting}”</p>
              <p className="small" style={{ color: "var(--text-secondary)", marginTop: 4 }}>
                Typing recomputes the memoised greeting; the hook labels itself in React DevTools.
              </p>
            </div>
            <div className="form-group" style={{ minWidth: 240, margin: 0 }}>
              <label className="form-label" htmlFor="greeting-name">Name</label>
              <input id="greeting-name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="grid-3">
          <div className="card">
            <div className="eyebrow">Topic 14 · useLocalStorage</div>
            <h3 className="card-title" style={{ fontSize: "var(--text-md)" }}>Persisted visit counter</h3>
            <p className="small" style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
              Stored in this browser and also sent to the User Service.
            </p>
            <div className="fact" style={{ marginBottom: 16 }}>
              <div className="fact-label">Visits in this browser</div>
              <div className="stat-value" style={{ fontSize: "1.5rem" }}>{visits}</div>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleIncreaseVisits} disabled={recordingVisit} style={{ alignSelf: "flex-start", marginTop: "auto" }}>
              {recordingVisit ? <Spinner /> : <Icon name="plus" size={14} />}
              Record a visit
            </button>
          </div>

          <div className="card">
            <div className="eyebrow">Topic 12 · useContext</div>
            <h3 className="card-title" style={{ fontSize: "var(--text-md)" }}>Shared theme & auth state</h3>
            <p className="small" style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
              Theme, signed-in user and toasts are provided once and read anywhere.
            </p>
            <div className="fact small">
              <div>Signed in as: <strong>{user?.username || "Guest"}</strong></div>
              <div>Theme: <strong>{darkMode ? "Dark" : "Light"}</strong></div>
            </div>
          </div>

          <div className="card">
            <div className="eyebrow">Topics 10 & 13 · useMemo, useRef</div>
            <h3 className="card-title" style={{ fontSize: "var(--text-md)" }}>Memoised filtering</h3>
            <p className="small" style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
              <code>useMemo</code> caches filtered course lists; <code>useRef</code> moves focus to the first invalid form field.
            </p>
            <div className="code-block">useMemo(() =&gt; filter(courses), [level, query])</div>
          </div>
        </div>

        <FocusDemo />

        <div className="card">
          <h3 className="card-title" style={{ fontSize: "var(--text-md)" }}>Architecture Q&amp;A</h3>
          <div className="grid-2" style={{ marginTop: 8 }}>
            <div>
              <h4 style={{ fontSize: "var(--text-sm)", color: "var(--accent-primary-text)", marginBottom: 4 }}>Why a database per service?</h4>
              <p className="small" style={{ color: "var(--text-secondary)" }}>
                Each service owns its schema. The Course Service never reads the <code>users</code> table; identity arrives as verified
                headers (<code>X-User-Id</code>, <code>X-User-Role</code>) added by the gateway after it validates the JWT.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: "var(--text-sm)", color: "var(--accent-primary-text)", marginBottom: 4 }}>Where is useDebugValue used?</h4>
              <p className="small" style={{ color: "var(--text-secondary)" }}>
                Both <code>useGreeting</code> and <code>useLocalStorage</code> call <code>useDebugValue</code>, so their values show up in the
                React DevTools Components tab.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
