import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import { getAllUsers, checkGatewayHealth } from "../services/authService";
import { fetchCourses, createCourse } from "../services/courseService";
import { fetchResources, createResource } from "../services/resourceService";
import { fetchEvents, createEvent } from "../services/eventService";
import { fetchAllInquiries, updateInquiryStatus } from "../services/contactService";
import { unwrapList } from "../services/apiClient";
import Icon from "../components/Icons";
import {
  Alert,
  EmptyState,
  ErrorState,
  LoadingRows,
  PageHeader,
  Spinner,
  formatLevel,
  levelBadgeClass,
  resourceTypeInfo,
  RESOURCE_TYPES
} from "../components/ui";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses" },
  { id: "resources", label: "Resources" },
  { id: "events", label: "Events" },
  { id: "inquiries", label: "Inquiries" },
  { id: "users", label: "Users" }
];

const SERVICES = [
  { key: "gateway", label: "API gateway" },
  { key: "user-service", label: "Accounts & sign-in" },
  { key: "course-service", label: "Courses & enrollments" },
  { key: "resource-service", label: "Study resources" },
  { key: "engagement-service", label: "Events & support inquiries" }
];

const EMPTY_COURSE = { code: "", title: "", description: "", level: "Beginner", durationHours: 10 };
const EMPTY_RESOURCE = { title: "", description: "", resourceType: "NOTES", fileUrl: "" };
const EMPTY_EVENT = { title: "", eventDate: "", venue: "", description: "", organizer: "", capacity: 100 };

const remote = { status: "loading", data: [], error: null };

function formatDateInput(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function inquiryBadge(status) {
  if (status === "RESOLVED") return "badge-success";
  if (status === "IN_PROGRESS") return "badge-primary";
  return "badge-warning";
}

function inquiryLabel(status) {
  if (status === "IN_PROGRESS") return "In progress";
  if (status === "RESOLVED") return "Resolved";
  return "New";
}

export default function AdminDashboard({ onCatalogChanged }) {
  const { isAdmin, isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();
  const tabRefs = useRef({});

  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState(remote);
  const [courses, setCourses] = useState(remote);
  const [resources, setResources] = useState(remote);
  const [events, setEvents] = useState(remote);
  const [inquiries, setInquiries] = useState(remote);
  const [health, setHealth] = useState({ status: "idle", data: null, checkedAt: null, error: null });

  const [newCourse, setNewCourse] = useState(EMPTY_COURSE);
  const [newResource, setNewResource] = useState(EMPTY_RESOURCE);
  const [newEvent, setNewEvent] = useState(EMPTY_EVENT);
  const [formError, setFormError] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [updatingInquiry, setUpdatingInquiry] = useState(null);

  const load = async (setter, loader) => {
    setter((prev) => ({ ...prev, status: "loading", error: null }));
    try {
      setter({ status: "ready", data: await loader(), error: null });
    } catch (err) {
      setter({ status: "error", data: [], error: err.message });
    }
  };

  const loadAll = useCallback(() => {
    load(setUsers, async () => unwrapList(await getAllUsers()));
    load(setCourses, fetchCourses);
    load(setResources, fetchResources);
    load(setEvents, fetchEvents);
    load(setInquiries, async () => unwrapList(await fetchAllInquiries()));
  }, []);

  const runHealthCheck = useCallback(async () => {
    setHealth((prev) => ({ ...prev, status: "loading", error: null }));
    const res = await checkGatewayHealth();
    if (res.success && res.data) {
      setHealth({ status: "ready", data: res.data, checkedAt: new Date(), error: null });
    } else {
      setHealth({ status: "error", data: null, checkedAt: new Date(), error: res.error });
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadAll();
    runHealthCheck();
  }, [isAdmin, loadAll, runHealthCheck]);

  if (!isAdmin) {
    return (
      <div className="page">
        <PageHeader eyebrow="Admin console" title="Staff access only" />
        <EmptyState
          icon="shield"
          title={isAuthenticated ? "Your account doesn't have admin access" : "Sign in with an administrator account"}
          description={
            isAuthenticated
              ? "The admin console is for faculty and staff who manage courses, resources, events and support requests. Contact support if you think you should have access."
              : "Faculty and staff can sign in to manage courses, resources, events and student inquiries."
          }
        >
          {!isAuthenticated && (
            <button type="button" className="btn btn-primary" onClick={() => openAuthModal("login")}>
              Sign in
            </button>
          )}
        </EmptyState>
      </div>
    );
  }

  /* ---------- create handlers: only update lists when the API confirms ---------- */
  const submit = async (key, request, onSuccess) => {
    setSubmitting(key);
    setFormError((prev) => ({ ...prev, [key]: "" }));
    try {
      const res = await request();
      if (res.success && res.data) {
        onSuccess(res.data);
      } else {
        setFormError((prev) => ({ ...prev, [key]: res.error || "This couldn't be saved. Please try again." }));
      }
    } catch {
      setFormError((prev) => ({ ...prev, [key]: "This couldn't be saved. Please try again." }));
    } finally {
      setSubmitting(null);
    }
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    submit(
      "course",
      () => createCourse({ ...newCourse, code: newCourse.code.trim(), title: newCourse.title.trim(), description: newCourse.description.trim(), durationHours: Number(newCourse.durationHours) || 10 }),
      (created) => {
        setCourses((prev) => ({ ...prev, data: [...prev.data, created] }));
        toast.success(`${created.title} is now in the catalogue.`, "Course published");
        setNewCourse(EMPTY_COURSE);
        onCatalogChanged?.();
      }
    );
  };

  const handleCreateResource = (e) => {
    e.preventDefault();
    submit(
      "resource",
      () => createResource({ ...newResource, title: newResource.title.trim(), description: newResource.description.trim(), fileUrl: newResource.fileUrl.trim() || undefined }),
      (created) => {
        setResources((prev) => ({ ...prev, data: [...prev.data, created] }));
        toast.success(`${created.title} is now available to students.`, "Resource added");
        setNewResource(EMPTY_RESOURCE);
        onCatalogChanged?.();
      }
    );
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    submit(
      "event",
      () =>
        createEvent({
          ...newEvent,
          title: newEvent.title.trim(),
          venue: newEvent.venue.trim(),
          organizer: newEvent.organizer.trim() || undefined,
          eventDate: formatDateInput(newEvent.eventDate),
          capacity: Number(newEvent.capacity) || 100
        }),
      (created) => {
        setEvents((prev) => ({ ...prev, data: [...prev.data, created] }));
        toast.success(`${created.title} has been scheduled.`, "Event published");
        setNewEvent(EMPTY_EVENT);
      }
    );
  };

  const handleUpdateInquiryStatus = async (inquiry, newStatus) => {
    setUpdatingInquiry(inquiry.id);
    try {
      const res = await updateInquiryStatus(inquiry.id, newStatus);
      if (res.success) {
        setInquiries((prev) => ({
          ...prev,
          data: prev.data.map((i) => (i.id === inquiry.id ? { ...i, ...(res.data || {}), status: res.data?.status || newStatus } : i))
        }));
        toast.success(`Inquiry from ${inquiry.name} marked as ${inquiryLabel(newStatus).toLowerCase()}.`, "Inquiry updated");
      } else {
        toast.error(res.error || "The inquiry status couldn't be updated.");
      }
    } catch {
      toast.error("The inquiry status couldn't be updated.");
    } finally {
      setUpdatingInquiry(null);
    }
  };

  const countFor = (state) => (state.status === "ready" ? state.data.length : null);
  const newInquiries = inquiries.data.filter((i) => (i.status || "NEW") === "NEW");

  const onTabKeyDown = (e, index) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (index + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
    setActiveTab(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  };

  const tabCounts = {
    courses: countFor(courses),
    resources: countFor(resources),
    events: countFor(events),
    inquiries: inquiries.status === "ready" ? newInquiries.length : null,
    users: countFor(users)
  };

  return (
    <div className="page" style={{ gap: 24 }}>
      <PageHeader
        eyebrow={<><Icon name="shield" size={14} /> Admin console</>}
        title="Manage the portal"
        lead="Publish courses and resources, schedule events, respond to student inquiries, and check service status."
        actions={
          <button type="button" className="btn btn-secondary" onClick={() => { loadAll(); runHealthCheck(); }}>
            <Icon name="refresh" size={16} />
            Refresh data
          </button>
        }
      />

      <div className="tab-list tab-list-scroll" role="tablist" aria-label="Admin sections">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            type="button"
            role="tab"
            id={`admin-tab-${tab.id}`}
            className="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`admin-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => onTabKeyDown(e, index)}
          >
            {tab.label}
            {typeof tabCounts[tab.id] === "number" && (
              <span className={`badge ${tab.id === "inquiries" && tabCounts.inquiries > 0 ? "badge-warning" : "badge-neutral"}`}>
                {tabCounts[tab.id]}
                {tab.id === "inquiries" && <span className="visually-hidden"> new</span>}
              </span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`admin-panel-${activeTab}`} aria-labelledby={`admin-tab-${activeTab}`} tabIndex={0} style={{ outline: "none" }}>
        {activeTab === "overview" && (
          <div className="stack-lg">
            <div className="stat-grid">
              <AdminStat label="Registered accounts" icon="users" state={users} />
              <AdminStat label="Published courses" icon="book" state={courses} />
              <AdminStat label="Study resources" icon="file-text" state={resources} />
              <AdminStat label="New inquiries" icon="mail" state={inquiries} value={newInquiries.length} />
            </div>

            <div className="grid-2" style={{ alignItems: "start" }}>
              <section className="card" aria-labelledby="status-heading">
                <div className="card-head">
                  <div>
                    <h2 id="status-heading">Service status</h2>
                    <p className="small muted">Visible to administrators only.</p>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={runHealthCheck} disabled={health.status === "loading"}>
                    {health.status === "loading" ? <Spinner /> : <Icon name="refresh" size={14} />}
                    Check now
                  </button>
                </div>
                {health.status === "error" && (
                  <div style={{ marginBottom: 12 }}>
                    <Alert type="error" title="Status check failed">{health.error}</Alert>
                  </div>
                )}
                <ul className="list-plain" aria-live="polite">
                  {SERVICES.map((svc) => {
                    const value = health.data?.[svc.key];
                    const up = typeof value === "string" && value.toUpperCase().startsWith("UP");
                    const label = health.status === "ready" ? (value ? (up ? "Operational" : "Unavailable") : "Not reported") : health.status === "error" ? "Unknown" : "Checking…";
                    return (
                      <li key={svc.key} className="status-row">
                        <span className="row" style={{ gap: 10 }}>
                          <span className={`status-dot ${health.status === "ready" && value ? (up ? "up" : "down") : ""}`} aria-hidden="true" />
                          {svc.label}
                        </span>
                        <span className={`badge ${health.status === "ready" && value ? (up ? "badge-success" : "badge-danger") : "badge-neutral"}`}>{label}</span>
                      </li>
                    );
                  })}
                </ul>
                {health.checkedAt && (
                  <p className="small muted" style={{ marginTop: 12 }}>
                    Last checked {health.checkedAt.toLocaleTimeString()}
                  </p>
                )}
              </section>

              <section className="card" aria-labelledby="recent-inq-heading">
                <div className="card-head">
                  <h2 id="recent-inq-heading">Recent inquiries</h2>
                  <button type="button" className="text-link" onClick={() => setActiveTab("inquiries")}>View all</button>
                </div>
                {inquiries.status === "loading" && <LoadingRows count={3} label="Loading inquiries" />}
                {inquiries.status === "error" && <ErrorState compact title="Inquiries couldn't be loaded" description={inquiries.error} onRetry={() => load(setInquiries, async () => unwrapList(await fetchAllInquiries()))} />}
                {inquiries.status === "ready" && inquiries.data.length === 0 && <p className="small muted">No inquiries have been submitted yet.</p>}
                {inquiries.status === "ready" && inquiries.data.length > 0 && (
                  <ul className="list-plain">
                    {inquiries.data.slice(0, 4).map((inq) => (
                      <li key={inq.id} className="list-row" style={{ alignItems: "flex-start" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="row-between">
                            <span className="list-row-title">{inq.name}</span>
                            <span className={`badge ${inquiryBadge(inq.status)}`}>{inquiryLabel(inq.status)}</span>
                          </div>
                          <p className="list-row-sub" style={{ marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {inq.message}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="layout-sidebar">
            <DataTable
              state={courses}
              caption="Published courses"
              emptyText="No courses have been published yet."
              onRetry={() => load(setCourses, fetchCourses)}
              columns={["Course", "Level", "Duration"]}
              renderRow={(c) => (
                <tr key={c.id ?? c.code}>
                  <td data-label="Course" className="cell-wrap">
                    <div className="cell-strong">{c.title}</div>
                    <div className="cell-sub">{c.code}</div>
                  </td>
                  <td data-label="Level"><span className={`badge ${levelBadgeClass(c.level)}`}>{formatLevel(c.level)}</span></td>
                  <td data-label="Duration">{c.durationHours ? `${c.durationHours} hrs` : "—"}</td>
                </tr>
              )}
            />

            <FormCard title="Publish a course" error={formError.course} onSubmit={handleCreateCourse}>
              <Field id="course-code" label="Course code" hint="e.g. CS-301">
                <input id="course-code" className="form-input" value={newCourse.code} onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })} required autoCapitalize="characters" />
              </Field>
              <Field id="course-title" label="Title">
                <input id="course-title" className="form-input" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} required minLength={2} maxLength={100} />
              </Field>
              <div className="form-row">
                <Field id="course-level" label="Level">
                  <select id="course-level" className="form-select" value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </Field>
                <Field id="course-hours" label="Duration (hours)">
                  <input id="course-hours" className="form-input" type="number" min="1" max="500" value={newCourse.durationHours} onChange={(e) => setNewCourse({ ...newCourse, durationHours: e.target.value })} required />
                </Field>
              </div>
              <Field id="course-desc" label="Description" hint="What students will learn.">
                <textarea id="course-desc" className="form-textarea" rows={3} value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} required />
              </Field>
              <SubmitButton busy={submitting === "course"} label="Publish course" busyLabel="Publishing…" />
            </FormCard>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="layout-sidebar">
            <DataTable
              state={resources}
              caption="Study resources"
              emptyText="No resources have been added yet."
              onRetry={() => load(setResources, fetchResources)}
              columns={["Resource", "Type", "Downloads"]}
              renderRow={(r) => (
                <tr key={r.id ?? r.title}>
                  <td data-label="Resource" className="cell-wrap"><div className="cell-strong">{r.title}</div></td>
                  <td data-label="Type"><span className={`badge ${resourceTypeInfo(r.resourceType).badge}`}>{resourceTypeInfo(r.resourceType).label}</span></td>
                  <td data-label="Downloads">{typeof r.downloadCount === "number" ? r.downloadCount.toLocaleString() : "—"}</td>
                </tr>
              )}
            />

            <FormCard title="Add a study resource" error={formError.resource} onSubmit={handleCreateResource}>
              <Field id="res-title" label="Title">
                <input id="res-title" className="form-input" value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} required />
              </Field>
              <Field id="res-type" label="Type">
                <select id="res-type" className="form-select" value={newResource.resourceType} onChange={(e) => setNewResource({ ...newResource, resourceType: e.target.value })}>
                  {Object.entries(RESOURCE_TYPES).map(([key, info]) => (
                    <option key={key} value={key}>{info.label}</option>
                  ))}
                </select>
              </Field>
              <Field id="res-url" label="File link" optional hint="A full https:// link opens the file directly for students.">
                <input id="res-url" className="form-input" type="text" inputMode="url" value={newResource.fileUrl} onChange={(e) => setNewResource({ ...newResource, fileUrl: e.target.value })} placeholder="https://…" />
              </Field>
              <Field id="res-desc" label="Description">
                <textarea id="res-desc" className="form-textarea" rows={3} value={newResource.description} onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} required />
              </Field>
              <SubmitButton busy={submitting === "resource"} label="Add resource" busyLabel="Adding…" />
            </FormCard>
          </div>
        )}

        {activeTab === "events" && (
          <div className="layout-sidebar">
            <DataTable
              state={events}
              caption="Scheduled events"
              emptyText="No events have been scheduled yet."
              onRetry={() => load(setEvents, fetchEvents)}
              columns={["Event", "Date", "Venue", "Seats"]}
              renderRow={(ev) => (
                <tr key={ev.id ?? ev.title}>
                  <td data-label="Event" className="cell-wrap"><div className="cell-strong">{ev.title}</div>{ev.organizer && <div className="cell-sub">{ev.organizer}</div>}</td>
                  <td data-label="Date" style={{ whiteSpace: "nowrap" }}>{ev.eventDate}</td>
                  <td data-label="Venue">{ev.venue}</td>
                  <td data-label="Seats">{ev.capacity ? `${ev.registeredCount ?? 0} / ${ev.capacity}` : "—"}</td>
                </tr>
              )}
            />

            <FormCard title="Schedule an event" error={formError.event} onSubmit={handleCreateEvent}>
              <Field id="ev-title" label="Title">
                <input id="ev-title" className="form-input" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} required />
              </Field>
              <div className="form-row">
                <Field id="ev-date" label="Date">
                  <input id="ev-date" className="form-input" type="date" value={newEvent.eventDate} onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })} required />
                </Field>
                <Field id="ev-cap" label="Capacity">
                  <input id="ev-cap" className="form-input" type="number" min="1" value={newEvent.capacity} onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })} required />
                </Field>
              </div>
              <Field id="ev-venue" label="Venue">
                <input id="ev-venue" className="form-input" value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} placeholder="e.g. Main Auditorium" required />
              </Field>
              <Field id="ev-org" label="Organiser" optional>
                <input id="ev-org" className="form-input" value={newEvent.organizer} onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })} placeholder="e.g. Department of Computer Science" />
              </Field>
              <Field id="ev-desc" label="Description" optional>
                <textarea id="ev-desc" className="form-textarea" rows={2} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
              </Field>
              <SubmitButton busy={submitting === "event"} label="Schedule event" busyLabel="Scheduling…" />
            </FormCard>
          </div>
        )}

        {activeTab === "inquiries" && (
          <DataTable
            state={inquiries}
            caption="Student inquiries"
            emptyText="No inquiries have been submitted yet."
            onRetry={() => load(setInquiries, async () => unwrapList(await fetchAllInquiries()))}
            columns={["From", "Message", "Status", "Actions"]}
            renderRow={(inq) => (
              <tr key={inq.id}>
                <td data-label="From">
                  <div className="cell-strong">{inq.name}</div>
                  <div className="cell-sub"><a href={`mailto:${inq.email}`}>{inq.email}</a></div>
                </td>
                <td data-label="Message" className="cell-wrap">{inq.message}</td>
                <td data-label="Status"><span className={`badge ${inquiryBadge(inq.status)}`}>{inquiryLabel(inq.status)}</span></td>
                <td data-label="Actions">
                  {inq.status === "RESOLVED" ? (
                    <span className="small muted">Closed</span>
                  ) : (
                    <div className="row" style={{ flexWrap: "nowrap" }}>
                      {(inq.status || "NEW") === "NEW" && (
                        <button type="button" className="btn btn-secondary btn-sm" disabled={updatingInquiry === inq.id} onClick={() => handleUpdateInquiryStatus(inq, "IN_PROGRESS")}>
                          Start
                        </button>
                      )}
                      <button type="button" className="btn btn-primary btn-sm" disabled={updatingInquiry === inq.id} onClick={() => handleUpdateInquiryStatus(inq, "RESOLVED")} aria-label={`Mark inquiry from ${inq.name} as resolved`}>
                        {updatingInquiry === inq.id ? <Spinner /> : null}
                        Resolve
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )}
          />
        )}

        {activeTab === "users" && (
          <DataTable
            state={users}
            caption="Registered accounts"
            emptyText="No accounts found."
            onRetry={() => load(setUsers, async () => unwrapList(await getAllUsers()))}
            columns={["Name", "Username", "Email", "Role"]}
            renderRow={(u) => (
              <tr key={u.id ?? u.username}>
                <td data-label="Name" className="cell-strong">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</td>
                <td data-label="Username">{u.username}</td>
                <td data-label="Email" style={{ overflowWrap: "anywhere" }}>{u.email}</td>
                <td data-label="Role">
                  <span className={`badge ${u.role === "ROLE_ADMIN" ? "badge-warning" : "badge-primary"}`}>
                    {u.role === "ROLE_ADMIN" ? "Administrator" : "Student"}
                  </span>
                </td>
              </tr>
            )}
          />
        )}
      </div>
    </div>
  );
}

function AdminStat({ label, icon, state, value }) {
  return (
    <div className="stat-card">
      <span className="stat-label"><Icon name={icon} size={16} />{label}</span>
      {state.status === "loading" && <span className="skeleton" style={{ height: 28, width: 56 }} aria-label="Loading" />}
      {state.status === "error" && <span className="stat-value" title="Couldn't load">—</span>}
      {state.status === "error" && <span className="stat-note">Couldn't load</span>}
      {state.status === "ready" && <span className="stat-value">{value ?? state.data.length}</span>}
    </div>
  );
}

function DataTable({ state, caption, columns, renderRow, emptyText, onRetry }) {
  if (state.status === "loading") return <LoadingRows count={4} label={`Loading ${caption.toLowerCase()}`} />;
  if (state.status === "error") return <ErrorState title={`${caption} couldn't be loaded`} description={state.error} onRetry={onRetry} compact />;
  if (state.data.length === 0) return <EmptyState icon="list" title={emptyText} compact />;
  return (
    <div className="table-wrapper">
      <table className="data-table table-responsive">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{state.data.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

function FormCard({ title, error, onSubmit, children }) {
  return (
    <section className="card" aria-label={title}>
      <h2 style={{ fontSize: "var(--text-md)", fontWeight: 600, marginBottom: 16 }}>{title}</h2>
      {error && (
        <div style={{ marginBottom: 16 }}>
          <Alert type="error">{error}</Alert>
        </div>
      )}
      <form onSubmit={onSubmit}>{children}</form>
    </section>
  );
}

function Field({ id, label, hint, optional, children }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {optional && <span className="optional">(optional)</span>}
      </label>
      {children}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

function SubmitButton({ busy, label, busyLabel }) {
  return (
    <button type="submit" className="btn btn-primary btn-block" disabled={busy} aria-busy={busy}>
      {busy ? <><Spinner /> {busyLabel}</> : label}
    </button>
  );
}
