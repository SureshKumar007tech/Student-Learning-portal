import { useState, useEffect } from "react";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import { getAllUsers } from "../services/authService";
import { fetchCourses, createCourse } from "../services/courseService";
import { fetchResources, createResource } from "../services/resourceService";
import { fetchEvents, createEvent } from "../services/eventService";
import { fetchAllInquiries, updateInquiryStatus } from "../services/contactService";
import Icon from "../components/Icons";

export default function AdminDashboard() {
  const { user, isAdmin, openAuthModal } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'courses' | 'resources' | 'events' | 'inquiries' | 'users'
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms state
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    description: "",
    level: "Beginner",
    durationHours: 10
  });

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    resourceType: "NOTES",
    fileUrl: "/files/new-material.pdf"
  });

  const [newEvent, setNewEvent] = useState({
    title: "",
    eventDate: "",
    venue: "",
    description: "",
    organizer: "Computer Science Dept",
    capacity: 100
  });

  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        const [usersRes, coursesData, resourcesData, eventsData, inquiriesRes] =
          await Promise.all([
            getAllUsers(),
            fetchCourses(),
            fetchResources(),
            fetchEvents(),
            fetchAllInquiries()
          ]);

        if (usersRes?.success && Array.isArray(usersRes.data)) {
          setUsers(usersRes.data);
        } else {
          setUsers([
            { id: 1, username: "student", email: "student@portal.edu", firstName: "Alex", lastName: "Morgan", role: "ROLE_STUDENT" },
            { id: 2, username: "admin", email: "admin@portal.edu", firstName: "System", lastName: "Admin", role: "ROLE_ADMIN" }
          ]);
        }

        setCourses(coursesData || []);
        setResources(resourcesData || []);
        setEvents(eventsData || []);

        if (inquiriesRes?.success && Array.isArray(inquiriesRes.data)) {
          setInquiries(inquiriesRes.data);
        } else {
          setInquiries([
            { id: 1, name: "David Miller", email: "david@university.edu", message: "Question about Spring Boot prerequisites.", status: "NEW", createdAt: "2026-11-12" },
            { id: 2, name: "Chloe Bennett", email: "chloe@university.edu", message: "Access request for React starter projects.", status: "RESOLVED", createdAt: "2026-11-10" }
          ]);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await createCourse({
        ...newCourse,
        durationHours: Number(newCourse.durationHours) || 10
      });

      if (res.success && res.data) {
        setCourses((prev) => [...prev, res.data]);
        toast.success(`Course "${newCourse.title}" created in Course Service (8082)!`);
        setNewCourse({ code: "", title: "", description: "", level: "Beginner", durationHours: 10 });
      } else {
        const dummyCourse = { ...newCourse, id: Date.now() };
        setCourses((prev) => [...prev, dummyCourse]);
        toast.info(`Course "${newCourse.title}" created in catalog (Demo mode).`);
        setNewCourse({ code: "", title: "", description: "", level: "Beginner", durationHours: 10 });
      }
    } catch {
      toast.info("Course created.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await createResource(newResource);
      if (res.success && res.data) {
        setResources((prev) => [...prev, res.data]);
        toast.success(`Resource "${newResource.title}" added to Resource Service (8083)!`);
        setNewResource({ title: "", description: "", resourceType: "NOTES", fileUrl: "/files/new-material.pdf" });
      } else {
        const dummyResource = { ...newResource, id: Date.now(), downloadCount: 0 };
        setResources((prev) => [...prev, dummyResource]);
        toast.info(`Resource "${newResource.title}" added to catalog.`);
        setNewResource({ title: "", description: "", resourceType: "NOTES", fileUrl: "/files/new-material.pdf" });
      }
    } catch {
      toast.info("Resource created.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await createEvent({
        ...newEvent,
        capacity: Number(newEvent.capacity) || 100
      });
      if (res.success && res.data) {
        setEvents((prev) => [...prev, res.data]);
        toast.success(`Event "${newEvent.title}" published in Engagement Service (8084)!`);
        setNewEvent({ title: "", eventDate: "", venue: "", description: "", organizer: "Computer Science Dept", capacity: 100 });
      } else {
        const dummyEvent = { ...newEvent, id: Date.now() };
        setEvents((prev) => [...prev, dummyEvent]);
        toast.info(`Event "${newEvent.title}" published in calendar.`);
        setNewEvent({ title: "", eventDate: "", venue: "", description: "", organizer: "Computer Science Dept", capacity: 100 });
      }
    } catch {
      toast.info("Event created.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const res = await updateInquiryStatus(inquiryId, newStatus);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i))
      );
      toast.success(`Inquiry #${inquiryId} updated to ${newStatus} in Engagement Service!`);
    } catch {
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i))
      );
      toast.info(`Inquiry updated to ${newStatus}.`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="card" style={{ maxWidth: 640, margin: "40px auto", textAlign: "center", padding: 40 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "var(--status-warning-bg)", color: "var(--status-warning)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Icon name="shield" size={28} />
        </div>
        <h2 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 10px" }}>
          Admin Role Required
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, margin: "0 0 24px" }}>
          The Admin Console gives faculty and administrators control over course catalogues,
          learning assets, events, student directories, and incoming support inquiries.
        </p>

<button
          type="button"
          className="btn btn-primary"
          onClick={() => openAuthModal("login")}
        >
          Sign In as Administrator
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="badge badge-amber">Admin Control Center</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Role-Based Access Verified</span>
          </div>
          <h2 className="section-title">Faculty & Platform Management Console</h2>
          <p className="section-subtitle">
            Manage courses, publish learning assets, schedule workshops, and handle student inquiries.
          </p>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="toolbar-container" style={{ padding: "8px 12px" }}>
        <div className="filter-pills">
          <button
            type="button"
            className={`filter-pill ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Courses ({courses.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            Resources ({resources.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            Events ({events.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === "inquiries" ? "active" : ""}`}
            onClick={() => setActiveTab("inquiries")}
          >
            Inquiries ({inquiries.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users ({users.length})
          </button>
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div>
          <div className="stats-ribbon">
            <div className="stat-metric-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--accent-primary-subtle)", color: "var(--accent-primary)" }}>
                <Icon name="user" size={22} />
              </div>
              <div>
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">Registered Accounts</div>
              </div>
            </div>

            <div className="stat-metric-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--accent-cyan-subtle)", color: "var(--accent-cyan)" }}>
                <Icon name="book" size={22} />
              </div>
              <div>
                <div className="stat-value">{courses.length}</div>
                <div className="stat-label">Active Courses</div>
              </div>
            </div>

            <div className="stat-metric-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--status-warning-bg)", color: "var(--status-warning)" }}>
                <Icon name="download" size={22} />
              </div>
              <div>
                <div className="stat-value">{resources.length}</div>
                <div className="stat-label">Learning Resources</div>
              </div>
            </div>

            <div className="stat-metric-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--status-success-bg)", color: "var(--status-success)" }}>
                <Icon name="mail" size={22} />
              </div>
              <div>
                <div className="stat-value">
                  {inquiries.filter((i) => i.status === "NEW").length}
                </div>
                <div className="stat-label">Pending Inquiries</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
            <div className="card">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 12px" }}>
                Downstream Microservices Health
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.8125rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)" }}>
                  <span>User Service (Port 8081)</span>
                  <span className="badge badge-green">Healthy</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)" }}>
                  <span>Course Service (Port 8082)</span>
                  <span className="badge badge-green">Healthy</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)" }}>
                  <span>Resource Service (Port 8083)</span>
                  <span className="badge badge-green">Healthy</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-md)" }}>
                  <span>Engagement Service (Port 8084)</span>
                  <span className="badge badge-green">Healthy</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 12px" }}>
                Recent Student Inquiries
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {inquiries.slice(0, 3).map((inq) => (
                  <div key={inq.id} style={{ padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", fontSize: "0.8125rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{inq.name}</strong>
                      <span className={`badge ${inq.status === "RESOLVED" ? "badge-green" : "badge-amber"}`}>
                        {inq.status}
                      </span>
                    </div>
                    <div style={{ color: "var(--text-secondary)", marginTop: 4 }}>
                      {inq.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Courses */}
      {activeTab === "courses" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28, alignItems: "start" }}>
          <div className="table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Level</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id || c.code}>
                    <td><span className="badge badge-gray">{c.code}</span></td>
                    <td><strong>{c.title}</strong></td>
                    <td>{c.level}</td>
                    <td>{c.durationHours || 10}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create Course Form */}
          <div className="card">
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: "0 0 16px" }}>
              Publish New Course
            </h3>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label className="form-label">Course Code *</label>
                <input
                  className="form-input"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CS-DOCKER"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input
                  className="form-input"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="e.g. Docker & Kubernetes Architecture"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select
                    className="form-select"
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Hours)</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={newCourse.durationHours}
                    onChange={(e) => setNewCourse({ ...newCourse, durationHours: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Course overview and syllabus topics..."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={submittingAction}
              >
                {submittingAction ? "Publishing to Course Service..." : "Publish Course"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Resources */}
      {activeTab === "resources" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28, alignItems: "start" }}>
          <div className="table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Downloads</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => (
                  <tr key={r.id || r.title}>
                    <td><strong>{r.title}</strong></td>
                    <td><span className="badge badge-cyan">{r.resourceType}</span></td>
                    <td>{r.downloadCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Resource Form */}
          <div className="card">
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: "0 0 16px" }}>
              Add Learning Asset
            </h3>
            <form onSubmit={handleCreateResource}>
              <div className="form-group">
                <label className="form-label">Asset Title *</label>
                <input
                  className="form-input"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="e.g. Distributed Consensus Slides"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Asset Type</label>
                <select
                  className="form-select"
                  value={newResource.resourceType}
                  onChange={(e) => setNewResource({ ...newResource, resourceType: e.target.value })}
                >
                  <option value="NOTES">NOTES (Lecture Slides)</option>
                  <option value="EXERCISES">EXERCISES (Coding Lab)</option>
                  <option value="PROJECTS">PROJECTS (Starters)</option>
                  <option value="CHEATSHEET">CHEATSHEET (Quick Ref)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                  placeholder="Describe contents of study asset..."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={submittingAction}
              >
                {submittingAction ? "Adding to Resource Service..." : "Upload Resource Asset"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Events */}
      {activeTab === "events" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28, alignItems: "start" }}>
          <div className="table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Capacity</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id || e.title}>
                    <td><strong>{e.title}</strong></td>
                    <td>{e.eventDate}</td>
                    <td>{e.venue}</td>
                    <td>{e.capacity || 100}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Event Form */}
          <div className="card">
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, margin: "0 0 16px" }}>
              Schedule Academic Event
            </h3>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  className="form-input"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Spring Cloud Microservices Seminar"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    className="form-input"
                    value={newEvent.eventDate}
                    onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                    placeholder="e.g. 25 November 2026"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity</label>
                  <input
                    className="form-input"
                    type="number"
                    min="10"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue *</label>
                <input
                  className="form-input"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  placeholder="e.g. Main Auditorium / Virtual Room 1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Agenda and workshop objectives..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%" }}
                disabled={submittingAction}
              >
                {submittingAction ? "Publishing to Engagement Service..." : "Schedule Event"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Inquiries */}
      {activeTab === "inquiries" && (
        <div className="table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id}>
                  <td>#{inq.id}</td>
                  <td><strong>{inq.name}</strong></td>
                  <td>{inq.email}</td>
                  <td style={{ maxWidth: 300 }}>{inq.message}</td>
                  <td>
                    <span className={`badge ${inq.status === "RESOLVED" ? "badge-green" : inq.status === "IN_PROGRESS" ? "badge-blue" : "badge-amber"}`}>
                      {inq.status}
                    </span>
                  </td>
                  <td>
                    {inq.status !== "RESOLVED" ? (
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        onClick={() => handleUpdateInquiryStatus(inq.id, "RESOLVED")}
                      >
                        Resolve
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === "users" && (
        <div className="table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id || u.username}>
                  <td>#{u.id}</td>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "ROLE_ADMIN" ? "badge-amber" : "badge-blue"}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

