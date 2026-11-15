import Icon from "./Icons";

/* Small, shared presentational building blocks so every page uses the
   same header, state and feedback patterns. */

export function PageHeader({ eyebrow, title, lead, actions, titleId }) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="page-title" id={titleId}>
          {title}
        </h1>
        {lead && <p className="page-lead">{lead}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function SectionHeader({ title, lead, action, as: Tag = "h2", id }) {
  return (
    <div className="section-header">
      <div>
        <Tag className="section-title" id={id}>
          {title}
        </Tag>
        {lead && <p className="section-lead">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ size = "sm", label }) {
  return (
    <>
      <span className={`spinner ${size === "lg" ? "spinner-lg" : ""}`} aria-hidden="true" />
      {label && <span className="visually-hidden">{label}</span>}
    </>
  );
}

export function EmptyState({ icon = "search", title, description, children, compact = false }) {
  return (
    <div className={`state ${compact ? "state-compact" : ""}`}>
      <div className="state-icon">
        <Icon name={icon} size={22} />
      </div>
      <h3 className="state-title">{title}</h3>
      {description && <p className="state-desc">{description}</p>}
      {children && <div className="state-actions">{children}</div>}
    </div>
  );
}

export function ErrorState({
  title = "We couldn't load this right now",
  description,
  onRetry,
  compact = false
}) {
  return (
    <div className={`state state-error ${compact ? "state-compact" : ""}`} role="alert">
      <div className="state-icon">
        <Icon name="alert-circle" size={22} />
      </div>
      <h3 className="state-title">{title}</h3>
      <p className="state-desc">
        {description || "The service didn't respond. Check your connection and try again in a moment."}
      </p>
      {onRetry && (
        <div className="state-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
            <Icon name="refresh" size={14} />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

export function LoadingGrid({ count = 3, label = "Loading" }) {
  return (
    <div className="grid-cards" aria-busy="true">
      <span className="visually-hidden" role="status">
        {label}…
      </span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card skeleton-card" aria-hidden="true">
          <div className="skeleton skeleton-line" style={{ width: "35%" }} />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" style={{ width: "85%" }} />
          <div className="skeleton skeleton-line" style={{ width: "60%", marginTop: "auto" }} />
        </div>
      ))}
    </div>
  );
}

export function LoadingRows({ count = 3, label = "Loading" }) {
  return (
    <div className="stack-sm" aria-busy="true">
      <span className="visually-hidden" role="status">
        {label}…
      </span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} aria-hidden="true" />
      ))}
    </div>
  );
}

const ALERT_ICONS = { info: "info", success: "check-circle", warning: "alert-circle", error: "alert-circle" };

export function Alert({ type = "info", title, children, action, role }) {
  return (
    <div className={`alert alert-${type}`} role={role || (type === "error" ? "alert" : "status")}>
      <Icon name={ALERT_ICONS[type]} size={18} />
      <div className="alert-body">
        {title && <div className="alert-title">{title}</div>}
        {children}
      </div>
      {action && <div className="alert-actions">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value = 0, label, tone }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const toneClass = tone || (pct >= 100 ? "is-complete" : "");
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
    >
      <div className={`progress-bar ${toneClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------- formatting helpers ---------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function parseEventDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function DateChip({ value }) {
  const date = parseEventDate(value);
  if (!date) {
    return (
      <div className="date-chip" aria-hidden="true">
        <div className="date-chip-month">Date</div>
        <div className="date-chip-day">
          <Icon name="calendar" size={18} />
        </div>
      </div>
    );
  }
  return (
    <div className="date-chip" aria-hidden="true">
      <div className="date-chip-month">{MONTHS[date.getMonth()]}</div>
      <div className="date-chip-day">{date.getDate()}</div>
    </div>
  );
}

export function formatLevel(level) {
  if (!level) return "All levels";
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
}

export function levelBadgeClass(level) {
  switch (level?.toLowerCase()) {
    case "beginner":
      return "badge-success";
    case "intermediate":
      return "badge-warning";
    case "advanced":
      return "badge-primary";
    default:
      return "badge-neutral";
  }
}

export const RESOURCE_TYPES = {
  NOTES: { label: "Lecture notes", icon: "file-text", badge: "badge-primary" },
  EXERCISES: { label: "Exercises", icon: "code", badge: "badge-info" },
  PROJECTS: { label: "Projects", icon: "layers", badge: "badge-warning" },
  CHEATSHEET: { label: "Cheat sheet", icon: "book", badge: "badge-success" }
};

export function resourceTypeInfo(type) {
  return RESOURCE_TYPES[type?.toUpperCase()] || { label: type || "Resource", icon: "file-text", badge: "badge-neutral" };
}

export function fileFormatFromUrl(url) {
  if (!url) return null;
  const match = /\.([a-z0-9]{2,5})(?:\?|#|$)/i.exec(url);
  return match ? match[1].toUpperCase() : null;
}

export function getInitials(u) {
  if (!u) return "?";
  if (u.firstName && u.lastName) return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  if (u.firstName) return u.firstName[0].toUpperCase();
  return (u.username || "?")[0].toUpperCase();
}

export function displayName(u) {
  if (!u) return "";
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
  return full || u.username || "";
}
