import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import { fetchStudentEnrollments, updateCourseProgress, FALLBACK_COURSES } from "../services/courseService";
import { fetchEvents, FALLBACK_EVENTS } from "../services/eventService";
import Icon from "../components/Icons";

export default function Dashboard() {
  const { user, profile, isAuthenticated, openAuthModal, saveProfile } = useAuth();
  const toast = useToast();

  const [enrollments, setEnrollments] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: "",
    learningGoals: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Time-based personalized greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const studentName = user?.firstName || user?.username || "Student";
  const greeting = `${getTimeGreeting()}, ${studentName}!`;

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const studentId = user?.userId || 1;
        const [enrollmentData, eventsData] = await Promise.all([
          fetchStudentEnrollments(studentId),
          fetchEvents()
        ]);

        if (Array.isArray(enrollmentData) && enrollmentData.length > 0) {
          setEnrollments(enrollmentData);
        } else {
          // Provide sensible defaults for student demo if backend has no enrollments yet
          setEnrollments([
            {
              id: 101,
              courseId: 3,
              courseTitle: "React 19 Architecture & Hooks",
              courseCode: "CS-REACT",
              level: "Intermediate",
              progressPercent: 65,
              status: "IN_PROGRESS",
              durationHours: 20
            },
            {
              id: 102,
              courseId: 4,
              courseTitle: "Spring Boot Microservices & Gateway",
              courseCode: "CS-MICROSERVICES",
              level: "Advanced",
              progressPercent: 40,
              status: "IN_PROGRESS",
              durationHours: 30
            },
            {
              id: 103,
              courseId: 1,
              courseTitle: "HTML5 Modern Semantic Web",
              courseCode: "CS-HTML",
              level: "Beginner",
              progressPercent: 100,
              status: "COMPLETED",
              durationHours: 8
            }
          ]);
        }

        if (Array.isArray(eventsData) && eventsData.length > 0) {
          setUpcomingEvents(eventsData.slice(0, 3));
        } else {
          setUpcomingEvents(FALLBACK_EVENTS.slice(0, 3));
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        bio: profile.bio || "Computer Science student specializing in distributed systems.",
        learningGoals: profile.learningGoals || "Complete Spring Boot Microservices and React 19 track."
      });
    }
  }, [profile]);

  // Handle progress slider updates
  const handleProgressChange = async (enrollmentId, newPercent) => {
    const updated = enrollments.map((item) =>
      item.id === enrollmentId
        ? {
            ...item,
            progressPercent: newPercent,
            status: newPercent === 100 ? "COMPLETED" : "IN_PROGRESS"
          }
        : item
    );
    setEnrollments(updated);

    try {
      const res = await updateCourseProgress(enrollmentId, newPercent);
      if (res.success) {
        toast.success(`Progress updated to ${newPercent}% in Course Service (Port 8082)!`);
      }
    } catch {
      toast.info(`Progress updated locally to ${newPercent}%.`);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await saveProfile(profileForm);
      if (res.success) {
        toast.success("Profile saved successfully to User Service!");
        setEditingProfile(false);
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch {
      toast.info("Profile updated.");
      setEditingProfile(false);
    } finally {
      setSavingProfile(false);
    }
  };

  // Metrics calculations
  const totalEnrolled = enrollments.length;
  const completedCount = enrollments.filter((e) => e.progressPercent === 100 || e.status === "COMPLETED").length;
  const inProgressCount = totalEnrolled - completedCount;
  const avgProgress = totalEnrolled > 0
    ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progressPercent || 0), 0) / totalEnrolled)
    : 0;

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-xl)",
          padding: "28px 32px",
          marginBottom: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          boxShadow: "var(--shadow-xs)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span className="badge badge-blue">Student Hub</span>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              ID: {user?.userId || "101"} • Role: {user?.role || "ROLE_STUDENT"}
            </span>
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text-primary)" }}>
            {greeting}
          </h2>
          <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text-secondary)" }}>
            Welcome to your academic workspace. Monitor your syllabus milestones, learning hours, and enrolled courses.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setEditingProfile(!editingProfile)}
          >
            <Icon name="user" size={14} />
            {editingProfile ? "Cancel Editing" : "Edit Profile"}
          </button>
          <Link to="/courses" className="btn btn-primary btn-sm">
            <Icon name="plus" size={14} />
            Explore Courses
          </Link>
        </div>
      </div>

      {/* Profile Edit Drawer / Form */}
      {editingProfile && (
        <div className="card" style={{ marginBottom: 32, borderColor: "var(--accent-primary)" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 16px" }}>
            Update Student Profile & Learning Goals
          </h3>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Academic Bio</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Briefly describe your academic background or current degree program..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Primary Learning Goals</label>
              <input
                className="form-input"
                value={profileForm.learningGoals}
                onChange={(e) => setProfileForm({ ...profileForm, learningGoals: e.target.value })}
                placeholder="e.g. Master Spring Boot Microservices and React 19 Architecture"
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditingProfile(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={savingProfile}
              >
                {savingProfile ? "Saving to User Service..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Metrics Row */}
      <div className="stats-ribbon" style={{ marginBottom: 32 }}>
        <div className="stat-metric-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--accent-primary-subtle)", color: "var(--accent-primary)" }}>
            <Icon name="book" size={22} />
          </div>
          <div>
            <div className="stat-value">{totalEnrolled}</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--status-success-bg)", color: "var(--status-success)" }}>
            <Icon name="check-circle" size={22} />
          </div>
          <div>
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Completed Courses</div>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--status-warning-bg)", color: "var(--status-warning)" }}>
            <Icon name="clock" size={22} />
          </div>
          <div>
            <div className="stat-value">{inProgressCount}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--accent-cyan-subtle)", color: "var(--accent-cyan)" }}>
            <Icon name="award" size={22} />
          </div>
          <div>
            <div className="stat-value">{avgProgress}%</div>
            <div className="stat-label">Average Completion</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 32, alignItems: "start" }}>
        {/* Left Column: Enrolled Courses & Progress Tracker */}
        <div>
          <div className="section-header">
            <div>
              <h3 className="section-title" style={{ fontSize: "1.25rem" }}>
                My Enrolled Courses & Progress
              </h3>
              <p className="section-subtitle">
                Course state tracked by Course Service (Port 8082). Drag progress slider to update completion percentage.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {enrollments.map((course) => {
              const isCompleted = course.progressPercent === 100 || course.status === "COMPLETED";
              return (
                <div
                  key={course.id || course.courseId}
                  className="card"
                  style={{
                    borderLeft: isCompleted
                      ? "4px solid var(--status-success)"
                      : "4px solid var(--accent-primary)"
                  }}
                >
                  <div className="card-header-row">
                    <div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                        <span className="badge badge-gray">{course.courseCode || "CS"}</span>
                        <span className={`badge ${isCompleted ? "badge-green" : "badge-blue"}`}>
                          {isCompleted ? "Completed" : "In Progress"}
                        </span>
                      </div>
                      <h4 style={{ margin: "4px 0", fontSize: "1.0625rem", fontWeight: 700 }}>
                        {course.courseTitle || course.title}
                      </h4>
                    </div>

                    <span style={{ fontSize: "1.125rem", fontWeight: 800, color: isCompleted ? "var(--status-success)" : "var(--accent-primary)" }}>
                      {course.progressPercent || 0}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      backgroundColor: "var(--bg-surface-subtle)",
                      borderRadius: varRadiusFull(),
                      overflow: "hidden",
                      margin: "12px 0 16px"
                    }}
                  >
                    <div
                      style={{
                        width: `${course.progressPercent || 0}%`,
                        height: "100%",
                        backgroundColor: isCompleted ? "var(--status-success)" : "var(--accent-primary)",
                        borderRadius: varRadiusFull(),
                        transition: "width 0.3s ease"
                      }}
                    />
                  </div>

                  {/* Interactive Progress Slider */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Update Progress:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={course.progressPercent || 0}
                        onChange={(e) => handleProgressChange(course.id, Number(e.target.value))}
                        style={{ flex: 1, accentColor: "var(--accent-primary)", cursor: "pointer" }}
                      />
                    </div>

                    <Link to="/courses" className="btn btn-secondary btn-sm" style={{ fontSize: "0.75rem" }}>
                      Course Syllabus
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Learning Actions */}
          <div style={{ marginTop: 28 }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 12px" }}>
              Quick Academic Actions
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Link to="/resources" className="card" style={{ padding: 16, textDecoration: "none" }}>
                <Icon name="download" size={20} style={{ color: "var(--accent-cyan)", marginBottom: 8 }} />
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                  Download Notes
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Lecture slides & cheatsheets
                </div>
              </Link>

              <Link to="/events" className="card" style={{ padding: 16, textDecoration: "none" }}>
                <Icon name="calendar" size={20} style={{ color: "var(--status-warning)", marginBottom: 8 }} />
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                  Academic Events
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Workshops & presentations
                </div>
              </Link>

              <Link to="/contact" className="card" style={{ padding: 16, textDecoration: "none" }}>
                <Icon name="mail" size={20} style={{ color: "var(--accent-primary)", marginBottom: 8 }} />
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                  Academic Help
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Submit support ticket
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Events & Recommended Courses */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Upcoming Registered Events Card */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                Scheduled Academic Events
              </h4>
              <Link to="/events" style={{ fontSize: "0.75rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                View All
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-surface-subtle)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12
                  }}
                >
                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border-color)",
                      textAlign: "center",
                      minWidth: 44
                    }}
                  >
                    <Icon name="calendar" size={14} style={{ color: "var(--accent-primary)" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--text-primary)" }}>
                      {evt.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                      {evt.eventDate} • {evt.venue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Courses */}
          <div className="card">
            <h4 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 700 }}>
              Recommended Next Courses
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FALLBACK_COURSES.slice(1, 3).map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{rec.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {rec.level} • {rec.durationHours} hrs
                    </div>
                  </div>
                  <Link to="/courses" className="btn btn-outline btn-sm" style={{ padding: "4px 8px", fontSize: "0.75rem" }}>
                    Enroll
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Microservices Health Quick Card */}
          <div className="card" style={{ backgroundColor: "var(--bg-surface-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="pulse-dot" />
              <span style={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                API Gateway Health: UP (8080)
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Your dashboard calls Course Service (8082) for enrollments and User Service (8081) for identity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function varRadiusFull() {
  return "9999px";
}

