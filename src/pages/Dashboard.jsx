import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import { fetchStudentEnrollments, updateCourseProgress } from "../services/courseService";
import { fetchEvents, fetchMyEventRegistrations } from "../services/eventService";
import Icon from "../components/Icons";
import {
  Alert,
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  ProgressBar,
  Spinner,
  displayName,
  formatLevel,
  getInitials,
  levelBadgeClass
} from "../components/ui";

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function isCompleted(e) {
  return e.progressPercent >= 100 || e.status === "COMPLETED";
}

export default function Dashboard({ courses = [], onEnrollmentsChanged }) {
  const { user, profile, isAuthenticated, openAuthModal, saveProfile } = useAuth();
  const toast = useToast();

  const [enrollments, setEnrollments] = useState({ status: "loading", data: [], error: null });
  const [myEvents, setMyEvents] = useState({ status: "loading", data: [] });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ bio: "", learningGoals: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const loadEnrollments = useCallback(async () => {
    setEnrollments((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      const data = await fetchStudentEnrollments(user?.userId);
      setEnrollments({ status: "ready", data, error: null });
    } catch (err) {
      setEnrollments({ status: "error", data: [], error: err.message });
    }
  }, [user?.userId]);

  const loadMyEvents = useCallback(async () => {
    setMyEvents({ status: "loading", data: [] });
    try {
      const [regs, events] = await Promise.all([fetchMyEventRegistrations(), fetchEvents()]);
      const ids = new Set(regs.filter((r) => (r.status || "CONFIRMED").toUpperCase() !== "CANCELLED").map((r) => r.eventId));
      setMyEvents({ status: "ready", data: events.filter((e) => ids.has(e.id)) });
    } catch {
      setMyEvents({ status: "error", data: [] });
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadEnrollments();
    loadMyEvents();
  }, [isAuthenticated, loadEnrollments, loadMyEvents]);

  useEffect(() => {
    setProfileForm({ bio: profile?.bio || "", learningGoals: profile?.learningGoals || "" });
  }, [profile]);

  const handleProgressSaved = (enrollmentId, newPercent) => {
    setEnrollments((prev) => ({
      ...prev,
      data: prev.data.map((item) =>
        item.id === enrollmentId
          ? { ...item, progressPercent: newPercent, status: newPercent >= 100 ? "COMPLETED" : "IN_PROGRESS" }
          : item
      )
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    try {
      const res = await saveProfile({ bio: profileForm.bio.trim(), learningGoals: profileForm.learningGoals.trim() });
      if (res.success) {
        toast.success("Your profile has been updated.", "Profile saved");
        setEditingProfile(false);
      } else {
        setProfileError(res.error || "Your profile couldn't be saved. Please try again.");
      }
    } catch {
      setProfileError("Your profile couldn't be saved. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  const list = enrollments.data;
  const stats = useMemo(() => {
    const total = list.length;
    const completed = list.filter(isCompleted).length;
    const avg = total > 0 ? Math.round(list.reduce((acc, e) => acc + (e.progressPercent || 0), 0) / total) : null;
    return { total, completed, inProgress: total - completed, avg };
  }, [list]);

  const enrolledIds = useMemo(() => new Set(list.map((e) => e.courseId)), [list]);
  const suggestions = useMemo(
    () => courses.filter((c) => !enrolledIds.has(c.id)).slice(0, 3),
    [courses, enrolledIds]
  );

  if (!isAuthenticated) {
    return (
      <div className="page">
        <PageHeader eyebrow="My dashboard" title="Your learning, all in one view" />
        <EmptyState
          icon="dashboard"
          title="Sign in to see your dashboard"
          description="Your enrolled courses, progress and event registrations appear here once you're signed in."
        >
          <button type="button" className="btn btn-primary" onClick={() => openAuthModal("login")}>
            Sign in
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => openAuthModal("register")}>
            Create an account
          </button>
        </EmptyState>
      </div>
    );
  }

  const ready = enrollments.status === "ready";
  const statValue = (v) => (ready ? v : enrollments.status === "error" ? "—" : null);

  return (
    <div className="page">
      <PageHeader
        eyebrow="My dashboard"
        title={`${getTimeGreeting()}, ${user?.firstName || user?.username || "there"}`}
        lead="Pick up where you left off, keep your progress up to date, and see what's coming up."
        actions={
          <Link to="/courses" className="btn btn-primary">
            <Icon name="plus" size={16} />
            Find a course
          </Link>
        }
      />

      {/* At-a-glance — numbers come straight from your enrollments */}
      <section aria-labelledby="glance-heading">
        <h2 id="glance-heading" className="visually-hidden">At a glance</h2>
        <div className="stat-grid">
          <Stat icon="book" label="Enrolled courses" value={statValue(stats.total)} />
          <Stat icon="clock" label="In progress" value={statValue(stats.inProgress)} />
          <Stat icon="check-circle" label="Completed" value={statValue(stats.completed)} />
          <Stat icon="bar-chart" label="Average progress" value={statValue(stats.avg === null ? "—" : `${stats.avg}%`)} />
        </div>
      </section>

      <div className="layout-sidebar">
        {/* Main column */}
        <section className="section" aria-labelledby="my-courses-heading">
          <div className="section-header">
            <div>
              <h2 id="my-courses-heading" className="section-title">My courses</h2>
              <p className="section-lead">Update your progress as you work through each course.</p>
            </div>
          </div>

          {enrollments.status === "loading" && <LoadingRows count={3} label="Loading your courses" />}

          {enrollments.status === "error" && (
            <ErrorState title="We couldn't load your courses" description={enrollments.error} onRetry={loadEnrollments} compact />
          )}

          {ready && list.length === 0 && (
            <EmptyState
              icon="book"
              title="You haven't enrolled in any courses yet"
              description="Browse the catalogue and enroll — your courses and progress will show up here."
            >
              <Link to="/courses" className="btn btn-primary btn-sm">Browse courses</Link>
            </EmptyState>
          )}

          {ready && list.length > 0 && (
            <ul className="list-plain" style={{ gap: 12 }}>
              {list.map((enrollment) => (
                <li key={enrollment.id ?? enrollment.courseId}>
                  <EnrollmentItem
                    enrollment={enrollment}
                    onSaved={(pct) => {
                      handleProgressSaved(enrollment.id, pct);
                      onEnrollmentsChanged?.();
                    }}
                  />
                </li>
              ))}
            </ul>
          )}

          {ready && suggestions.length > 0 && (
            <div className="stack" style={{ marginTop: 16 }}>
              <h3 className="section-title-sm">Suggested next</h3>
              <ul className="list-plain">
                {suggestions.map((c) => (
                  <li key={c.id} className="list-row">
                    <div style={{ minWidth: 0 }}>
                      <div className="list-row-title">{c.title}</div>
                      <div className="list-row-sub">
                        {[formatLevel(c.level), c.durationHours ? `${c.durationHours} hours` : null].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <Link to={`/courses?q=${encodeURIComponent(c.title)}`} className="btn btn-secondary btn-sm push">
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="stack-lg" aria-label="Profile and upcoming events">
          <div className="card">
            <div className="profile-summary" style={{ marginBottom: 16 }}>
              <span className="avatar avatar-lg">{getInitials(user)}</span>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600 }}>{displayName(user)}</h2>
                {user?.email && <p className="small muted" style={{ overflowWrap: "anywhere" }}>{user.email}</p>}
              </div>
            </div>

            {!editingProfile ? (
              <>
                <div className="stack-sm">
                  <div>
                    <div className="profile-field-label">About me</div>
                    <p className="profile-field-value">{profile?.bio || <span className="muted">Not added yet</span>}</p>
                  </div>
                  <div>
                    <div className="profile-field-label">Learning goals</div>
                    <p className="profile-field-value">{profile?.learningGoals || <span className="muted">Not added yet</span>}</p>
                  </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 16, alignSelf: "flex-start" }} onClick={() => setEditingProfile(true)}>
                  <Icon name="user" size={14} />
                  Edit profile
                </button>
              </>
            ) : (
              <form onSubmit={handleSaveProfile} aria-label="Edit profile">
                {profileError && (
                  <div style={{ marginBottom: 12 }}>
                    <Alert type="error">{profileError}</Alert>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-bio">About me <span className="optional">(optional)</span></label>
                  <textarea
                    id="profile-bio"
                    className="form-textarea"
                    rows={3}
                    maxLength={500}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Your programme, year, or what you're interested in"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-goals">Learning goals <span className="optional">(optional)</span></label>
                  <textarea
                    id="profile-goals"
                    className="form-textarea"
                    rows={2}
                    maxLength={300}
                    value={profileForm.learningGoals}
                    onChange={(e) => setProfileForm({ ...profileForm, learningGoals: e.target.value })}
                    placeholder="e.g. Finish two intermediate courses this term"
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileError("");
                      setProfileForm({ bio: profile?.bio || "", learningGoals: profile?.learningGoals || "" });
                    }}
                    disabled={savingProfile}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={savingProfile} aria-busy={savingProfile}>
                    {savingProfile ? <><Spinner /> Saving…</> : "Save profile"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <h2>My upcoming events</h2>
              <Link to="/events" className="text-link">All events</Link>
            </div>
            {myEvents.status === "loading" && <LoadingRows count={2} label="Loading your events" />}
            {myEvents.status === "error" && (
              <Alert type="warning" action={<button type="button" className="btn btn-secondary btn-sm" onClick={loadMyEvents}>Retry</button>}>
                Your event registrations couldn't be loaded.
              </Alert>
            )}
            {myEvents.status === "ready" && myEvents.data.length === 0 && (
              <p className="small muted">
                You haven't registered for any events yet. <Link to="/events">Browse events</Link>
              </p>
            )}
            {myEvents.status === "ready" && myEvents.data.length > 0 && (
              <ul className="list-plain">
                {myEvents.data.map((evt) => (
                  <li key={evt.id} className="list-row">
                    <span className="feature-icon" style={{ margin: 0, width: 32, height: 32 }}>
                      <Icon name="calendar" size={16} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="list-row-title">{evt.title}</div>
                      <div className="list-row-sub">{[evt.eventDate, evt.venue].filter(Boolean).join(" · ")}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card card-compact">
            <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, marginBottom: 12 }}>Shortcuts</h2>
            <ul className="list-plain">
              <li><Link to="/resources" className="text-link"><Icon name="file-text" size={14} /> Download study resources</Link></li>
              <li><Link to="/events" className="text-link"><Icon name="calendar" size={14} /> Find workshops and events</Link></li>
              <li><Link to="/contact" className="text-link"><Icon name="help-circle" size={14} /> Ask student support</Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-label">
        <Icon name={icon} size={16} />
        {label}
      </span>
      {value === null ? (
        <span className="skeleton" style={{ height: 28, width: 56 }} aria-label="Loading" />
      ) : (
        <span className="stat-value">{value}</span>
      )}
    </div>
  );
}

function EnrollmentItem({ enrollment, onSaved }) {
  const toast = useToast();
  const sliderId = useId();
  const current = enrollment.progressPercent || 0;
  const [draft, setDraft] = useState(current);
  const [saving, setSaving] = useState(false);
  const completed = isCompleted(enrollment);
  const changed = draft !== current;

  useEffect(() => setDraft(current), [current]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateCourseProgress(enrollment.id, draft);
      if (res.success) {
        onSaved(draft);
        toast.success(
          draft >= 100 ? `Congratulations on completing ${enrollment.courseTitle}!` : `Progress saved at ${draft}%.`,
          draft >= 100 ? "Course completed" : "Progress updated"
        );
      } else {
        toast.error(res.error || "Your progress couldn't be saved.");
      }
    } catch {
      toast.error("Your progress couldn't be saved.");
    } finally {
      setSaving(false);
    }
  };

  const title = enrollment.courseTitle || enrollment.title || "Course";

  return (
    <article className="enrollment-item" aria-labelledby={`${sliderId}-title`}>
      <div className="row-between" style={{ alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div className="row" style={{ marginBottom: 6 }}>
            {enrollment.courseCode && <span className="badge badge-neutral badge-mono">{enrollment.courseCode}</span>}
            {enrollment.courseLevel && <span className={`badge ${levelBadgeClass(enrollment.courseLevel)}`}>{formatLevel(enrollment.courseLevel)}</span>}
            <span className={`badge ${completed ? "badge-success" : "badge-primary"}`}>{completed ? "Completed" : "In progress"}</span>
          </div>
          <h3 id={`${sliderId}-title`} className="card-title" style={{ marginBottom: 0 }}>{title}</h3>
        </div>
      </div>

      <div className="enrollment-progress-row">
        <ProgressBar value={current} label={`${title} progress`} />
        <span className="enrollment-percent">{current}%</span>
      </div>

      <div className="progress-editor">
        <label htmlFor={sliderId} className="small" style={{ fontWeight: 600 }}>
          Update progress
        </label>
        <input
          id={sliderId}
          type="range"
          min="0"
          max="100"
          step="5"
          value={draft}
          onChange={(e) => setDraft(Number(e.target.value))}
          aria-valuetext={`${draft} percent`}
          disabled={saving}
        />
        <span className="small" style={{ minWidth: 40, fontWeight: 600 }} aria-hidden="true">{draft}%</span>
        <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={!changed || saving} aria-busy={saving}>
          {saving ? <><Spinner /> Saving…</> : "Save"}
        </button>
        {changed && !saving && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDraft(current)}>
            Reset
          </button>
        )}
      </div>
    </article>
  );
}
