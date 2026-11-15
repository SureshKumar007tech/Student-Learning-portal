import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import CourseCard from "../components/CourseCard";
import ResourceCard from "../components/ResourceCard";
import Icon from "../components/Icons";
import { EmptyState, ErrorState, LoadingGrid, SectionHeader } from "../components/ui";

const LEVELS = [
  { name: "Beginner", desc: "Start with the fundamentals — no prior experience needed." },
  { name: "Intermediate", desc: "Build on the basics with deeper, project-based work." },
  { name: "Advanced", desc: "Specialised topics for confident, experienced learners." }
];

export default function Home({
  coursesState,
  resourcesState,
  enrolledCourseIds,
  onEnrolled,
  onRetry,
  onRetryResources,
  onSelectLevel
}) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const courses = coursesState.data;
  const resources = resourcesState.data;

  // Real counts per level, computed from the live catalogue
  const levelCounts = useMemo(() => {
    const counts = {};
    courses.forEach((c) => {
      const key = (c.level || "").toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [courses]);

  const browseLevel = (level) => {
    onSelectLevel(level);
    navigate("/courses");
  };

  const countText = (state, n, singular, plural) =>
    state.status === "ready" ? `${n} ${n === 1 ? singular : plural}` : null;

  const quickLinks = [
    { to: "/courses", icon: "book", title: "Courses", desc: countText(coursesState, courses.length, "course available", "courses available") || "Browse the catalogue" },
    { to: "/resources", icon: "file-text", title: "Study resources", desc: countText(resourcesState, resources.length, "resource to download", "resources to download") || "Notes, exercises and guides" },
    { to: "/events", icon: "calendar", title: "Events & workshops", desc: "See what's on and reserve a seat" },
    { to: "/contact", icon: "help-circle", title: "Help & support", desc: "Ask the student support team" }
  ];

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero" aria-labelledby="home-title">
        <div>
          <div className="eyebrow">
            <Icon name="graduation" size={14} />
            {isAuthenticated ? `Welcome back, ${user.firstName || user.username}` : "Student Learning Portal"}
          </div>
          <h1 id="home-title" className="hero-title">
            Everything you need for your studies, in one place.
          </h1>
          <p className="hero-lead">
            Find and enroll in courses, keep track of your progress, download study materials, and sign up for
            workshops and campus events.
          </p>
          <div className="hero-actions">
            <Link to="/courses" className="btn btn-primary btn-lg">
              Browse courses
              <Icon name="arrow-right" size={16} />
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-secondary btn-lg">
                Go to my dashboard
              </Link>
            ) : (
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => openAuthModal("register")}>
                Create a student account
              </button>
            )}
          </div>
        </div>

        <nav aria-label="Quick links" className="quick-links">
          {quickLinks.map((link) => (
            <Link key={link.to} to={link.to} className="quick-link">
              <span className="feature-icon">
                <Icon name={link.icon} size={18} />
              </span>
              <span>
                <span className="quick-link-title" style={{ display: "block" }}>{link.title}</span>
                <span className="quick-link-desc">{link.desc}</span>
              </span>
              <Icon name="chevron-right" size={16} className="chev" />
            </Link>
          ))}
        </nav>
      </section>

      {/* Browse by level */}
      <section className="section" aria-labelledby="levels-heading">
        <SectionHeader
          id="levels-heading"
          title="Browse by level"
          lead="Pick a starting point that matches your experience."
        />
        <div className="grid-3">
          {LEVELS.map((lvl) => {
            const n = levelCounts[lvl.name.toLowerCase()] || 0;
            return (
              <button
                key={lvl.name}
                type="button"
                className="card card-interactive level-card"
                onClick={() => browseLevel(lvl.name)}
              >
                <span className="row-between" style={{ marginBottom: 8, width: "100%" }}>
                  <span className="card-title" style={{ margin: 0 }}>{lvl.name}</span>
                  {coursesState.status === "ready" && (
                    <span className="badge badge-neutral">
                      {n} course{n === 1 ? "" : "s"}
                    </span>
                  )}
                </span>
                <span className="small" style={{ color: "var(--text-secondary)" }}>{lvl.desc}</span>
                <span className="text-link" style={{ marginTop: 16 }}>
                  View {lvl.name.toLowerCase()} courses <Icon name="arrow-right" size={14} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured courses */}
      <section className="section" aria-labelledby="featured-heading">
        <SectionHeader
          id="featured-heading"
          title="Featured courses"
          lead="A few courses from the current catalogue."
          action={
            <Link to="/courses" className="btn btn-secondary btn-sm">
              See all courses
            </Link>
          }
        />
        {coursesState.status === "loading" && <LoadingGrid count={3} label="Loading courses" />}
        {coursesState.status === "error" && (
          <ErrorState title="Courses are unavailable right now" description={coursesState.error} onRetry={onRetry} compact />
        )}
        {coursesState.status === "ready" && courses.length === 0 && (
          <EmptyState icon="book" title="No courses yet" description="Courses will appear here once they're published." compact />
        )}
        {coursesState.status === "ready" && courses.length > 0 && (
          <div className="grid-cards">
            {courses.slice(0, 3).map((course) => (
              <CourseCard
                key={course.id ?? course.code}
                course={course}
                isAlreadyEnrolled={enrolledCourseIds?.has(course.id)}
                onEnrollSuccess={onEnrolled}
              />
            ))}
          </div>
        )}
      </section>

      {/* Resources */}
      <section className="section" aria-labelledby="resources-heading">
        <SectionHeader
          id="resources-heading"
          title="Study resources"
          lead="Lecture notes, practice exercises, starter projects and quick-reference guides."
          action={
            <Link to="/resources" className="btn btn-secondary btn-sm">
              See all resources
            </Link>
          }
        />
        {resourcesState.status === "loading" && <LoadingGrid count={3} label="Loading resources" />}
        {resourcesState.status === "error" && (
          <ErrorState title="Resources are unavailable right now" description={resourcesState.error} onRetry={onRetryResources} compact />
        )}
        {resourcesState.status === "ready" && resources.length === 0 && (
          <EmptyState icon="file-text" title="No resources yet" description="Study materials will appear here once they're uploaded." compact />
        )}
        {resourcesState.status === "ready" && resources.length > 0 && (
          <div className="grid-cards">
            {resources.slice(0, 3).map((resource) => (
              <ResourceCard key={resource.id ?? resource.title} resource={resource} />
            ))}
          </div>
        )}
      </section>

      {/* Events + support CTA */}
      <section className="cta-band" aria-labelledby="cta-heading">
        <div>
          <h2 id="cta-heading" className="section-title">Workshops, showcases and campus events</h2>
          <p className="section-lead">Reserve a seat at upcoming sessions, or get in touch if you need a hand.</p>
        </div>
        <div className="row">
          <Link to="/events" className="btn btn-primary">
            <Icon name="calendar" size={16} />
            See upcoming events
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Get help
          </Link>
        </div>
      </section>
    </div>
  );
}
