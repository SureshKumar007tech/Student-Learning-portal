import { useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import { useToast } from "../hooks/ToastContext";
import { enrollInCourse } from "../services/courseService";
import Icon from "./Icons";
import ConfirmDialog from "./ConfirmDialog";
import Modal from "./Modal";
import { formatLevel, levelBadgeClass } from "./ui";

export default function CourseCard({ course, onClick, onEnrollSuccess, isAlreadyEnrolled = false, headingLevel = 3 }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();

  const [justEnrolled, setJustEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const enrolled = isAlreadyEnrolled || justEnrolled;
  const Heading = `h${headingLevel}`;

  const startEnroll = () => {
    if (!isAuthenticated) {
      toast.info("Sign in or create an account to enroll in courses.", "Sign in required");
      openAuthModal("login");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmEnrollment = async () => {
    setLoading(true);
    try {
      const res = await enrollInCourse(course.id, user?.userId);
      if (res.success) {
        setJustEnrolled(true);
        setConfirmOpen(false);
        toast.success(`You're enrolled in ${course.title}. It's now on your dashboard.`, "Enrolled");
        onEnrollSuccess?.(course);
      } else if (res.status === 409) {
        // Already enrolled according to the server — reflect that honestly
        setJustEnrolled(true);
        setConfirmOpen(false);
        toast.info("You're already enrolled in this course.", "Already enrolled");
        onEnrollSuccess?.(course);
      } else {
        toast.error(res.error || "Enrollment couldn't be completed. Please try again.");
      }
    } catch {
      toast.error("Enrollment couldn't be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = () => {
    onClick?.(course);
    setDetailsOpen(true);
  };

  return (
    <>
      <article className="card card-interactive">
        <div className="card-header-row">
          <div className="row">
            <span className={`badge ${levelBadgeClass(course.level)}`}>{formatLevel(course.level)}</span>
            {course.code && <span className="badge badge-neutral badge-mono">{course.code}</span>}
          </div>
          {enrolled && (
            <span className="badge badge-success">
              <Icon name="check" size={12} /> Enrolled
            </span>
          )}
        </div>

        <Heading className="card-title">{course.title}</Heading>
        {course.description && <p className="card-desc">{course.description}</p>}

        {(course.durationHours > 0 || course.instructor) && (
          <div className="card-meta">
            {course.durationHours > 0 && (
              <span>
                <Icon name="clock" size={14} />
                {course.durationHours} hours
              </span>
            )}
            {course.instructor && (
              <span>
                <Icon name="user" size={14} />
                {course.instructor}
              </span>
            )}
          </div>
        )}

        <div className="card-footer">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={openDetails}
            aria-label={`View details for ${course.title}`}
          >
            View details
          </button>
          {enrolled ? (
            <span className="small muted">On your dashboard</span>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={startEnroll}
              disabled={loading}
              aria-label={`Enroll in ${course.title}`}
            >
              Enroll
            </button>
          )}
        </div>
      </article>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Enroll in this course?"
        message={`${course.title}${course.code ? ` (${course.code})` : ""} will be added to your dashboard, where you can track your progress.`}
        confirmText="Enroll"
        loadingText="Enrolling…"
        loading={loading}
        onConfirm={confirmEnrollment}
        onCancel={() => setConfirmOpen(false)}
      />

      <Modal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={course.title}
        subtitle={course.code}
        size="md"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setDetailsOpen(false)}>
              Close
            </button>
            {enrolled ? (
              <span className="badge badge-success" style={{ alignSelf: "center" }}>
                <Icon name="check" size={12} /> You're enrolled
              </span>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setDetailsOpen(false);
                  startEnroll();
                }}
              >
                Enroll in course
              </button>
            )}
          </>
        }
      >
        <div className="modal-body">
          <div className="fact-grid">
            <div className="fact">
              <div className="fact-label">Level</div>
              <div className="fact-value">{formatLevel(course.level)}</div>
            </div>
            <div className="fact">
              <div className="fact-label">Duration</div>
              <div className="fact-value">{course.durationHours > 0 ? `${course.durationHours} hours` : "Not specified"}</div>
            </div>
            <div className="fact">
              <div className="fact-label">Course code</div>
              <div className="fact-value">{course.code || "—"}</div>
            </div>
          </div>

          <h3 className="section-title-sm" style={{ fontSize: "var(--text-md)", marginBottom: 8 }}>
            About this course
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-base)", lineHeight: 1.65 }}>
            {course.description || "No description has been added for this course yet."}
          </p>
        </div>
      </Modal>
    </>
  );
}
