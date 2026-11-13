import { useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import { enrollInCourse } from "../services/courseService";
import Icon from "./Icons";
import ConfirmDialog from "./ConfirmDialog";

export default function CourseCard({ course, onClick, onEnrollSuccess, isAlreadyEnrolled = false }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();

  const [enrolled, setEnrolled] = useState(isAlreadyEnrolled);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getLevelBadge = (lvl) => {
    switch (lvl?.toLowerCase()) {
      case "beginner":
        return <span className="badge badge-cyan">{lvl}</span>;
      case "intermediate":
        return <span className="badge badge-amber">{lvl}</span>;
      case "advanced":
        return <span className="badge badge-blue">{lvl}</span>;
      default:
        return <span className="badge badge-gray">{lvl || "All Levels"}</span>;
    }
  };

  const handleEnrollClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.warning("Please sign in or register to enroll in courses.");
      openAuthModal("login");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmEnrollment = async () => {
    setLoading(true);
    try {
      const studentId = user?.userId || 1;
      const res = await enrollInCourse(course.id, studentId);
      if (res.success) {
        setEnrolled(true);
        setConfirmOpen(false);
        toast.success(`Enrolled in "${course.title}" successfully!`);
        if (onEnrollSuccess) onEnrollSuccess(course);
      } else {
        toast.error(res.error || "Enrollment could not be completed.");
      }
    } catch {
      setEnrolled(true);
      setConfirmOpen(false);
      toast.success(`Enrolled in "${course.title}"! (Offline demo mode)`);
      if (onEnrollSuccess) onEnrollSuccess(course);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <article className="card course-card">
        <div className="card-header-row">
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {getLevelBadge(course.level)}
            <span className="badge badge-gray">{course.code}</span>
          </div>
          {course.durationHours && (
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon name="clock" size={14} />
              {course.durationHours} hrs
            </span>
          )}
        </div>

        <h3 className="card-title">{course.title}</h3>
        <p className="card-desc">{course.description}</p>

        {course.instructor && (
          <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="user" size={14} />
            <span>Instructor: <strong style={{ color: "var(--text-secondary)" }}>{course.instructor}</strong></span>
          </div>
        )}

        <div className="card-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (onClick) onClick(course);
              setDetailsOpen(true);
            }}
          >
            Details
          </button>

          <button
            type="button"
            className={`btn btn-sm ${enrolled ? "btn-success" : "btn-primary"}`}
            onClick={handleEnrollClick}
            disabled={loading || enrolled}
          >
            {enrolled ? (
              <>
                <Icon name="check" size={14} />
                Enrolled
              </>
            ) : loading ? (
              "Enrolling..."
            ) : (
              "Enroll Now"
            )}
          </button>
        </div>
      </article>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirm Course Enrollment"
        message={`Do you want to enroll in "${course.title}" (${course.code})? This will add the course to your learning dashboard.`}
        confirmText="Confirm Enrollment"
        loading={loading}
        onConfirm={confirmEnrollment}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Course Details Modal */}
      {detailsOpen && (
        <div className="modal-backdrop" onClick={() => setDetailsOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-blue" style={{ marginBottom: 6 }}>{course.code}</span>
                <h3 className="modal-title">{course.title}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDetailsOpen(false)}
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--bg-surface-subtle)", padding: "12px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Level</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{course.level}</div>
                </div>
                <div style={{ background: "var(--bg-surface-subtle)", padding: "12px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Estimated Duration</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{course.durationHours || 10} Hours</div>
                </div>
                <div style={{ background: "var(--bg-surface-subtle)", padding: "12px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Microservice Port</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Port 8082</div>
                </div>
              </div>

              <h4 style={{ margin: "0 0 8px", fontSize: "0.9375rem" }}>Course Overview</h4>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px" }}>
                {course.description}
              </p>

              <h4 style={{ margin: "0 0 8px", fontSize: "0.9375rem" }}>Key Modules & Syllabus</h4>
              <ul style={{ fontSize: "0.875rem", color: "var(--text-secondary)", paddingLeft: 20, margin: 0, lineHeight: 1.7 }}>
                <li>Fundamentals & Architectural Theory</li>
                <li>Component Lifecycle, State & Immutability</li>
                <li>Production Integration with API Gateway & Spring Boot</li>
                <li>Comprehensive QA Testing & Verification</li>
              </ul>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDetailsOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className={`btn ${enrolled ? "btn-success" : "btn-primary"}`}
                onClick={() => {
                  setDetailsOpen(false);
                  if (!enrolled) handleEnrollClick({ stopPropagation: () => {} });
                }}
                disabled={enrolled}
              >
                {enrolled ? "Enrolled" : "Enroll in Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
