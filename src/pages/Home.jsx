import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import CourseCard from "../components/CourseCard";
import ResourceCard from "../components/ResourceCard";
import Icon from "../components/Icons";

export default function Home({ courses = [], resources = [], onCourseClick }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Preserving syllabus requirement: useEffect logging loaded state
    console.log("Home page loaded from Microservices Gateway (Port 8080)");
  }, []);

  const categories = [
    { name: "Frontend Engineering", count: "12 Courses", icon: "code", color: "var(--accent-primary)" },
    { name: "Microservices & Distributed Systems", count: "8 Courses", icon: "server", color: "var(--accent-cyan)" },
    { name: "UI/UX & Design Systems", count: "6 Courses", icon: "layers", color: "var(--status-warning)" },
    { name: "Cloud Architecture & DevOps", count: "9 Courses", icon: "award", color: "var(--status-success)" }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge-tag">
            <Icon name="sparkles" size={14} />
            <span>Next-Gen Enterprise Learning Management</span>
          </div>

          <h1 className="hero-title">
            Master Modern Software Architecture & Distributed Engineering
          </h1>

          <p className="hero-subtitle">
            An enterprise university LMS powered by independent Spring Boot microservices,
            stateless JWT security, and a responsive React 19 single-page architecture.
          </p>

          <div className="hero-cta-group">
            <Link to="/courses" className="btn btn-primary btn-lg">
              <Icon name="book" size={18} />
              Explore Course Catalogue
            </Link>

            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-secondary btn-lg" style={{ color: "var(--dark-navy)" }}>
                <Icon name="dashboard" size={18} />
                Go to Dashboard
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                style={{ color: "var(--dark-navy)" }}
                onClick={() => openAuthModal("register")}
              >
                <Icon name="user" size={18} />
                Create Student Account
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Live Statistics Ribbon */}
      <section className="stats-ribbon">
        <div className="stat-metric-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--accent-primary-subtle)", color: "var(--accent-primary)" }}>
            <Icon name="book" size={24} />
          </div>
          <div>
            <div className="stat-value">{courses.length > 0 ? courses.length : "4"}</div>
            <div className="stat-label">Active Published Courses</div>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--accent-cyan-subtle)", color: "var(--accent-cyan)" }}>
            <Icon name="download" size={24} />
          </div>
          <div>
            <div className="stat-value">{resources.length > 0 ? resources.length : "4"}</div>
            <div className="stat-label">Curated Learning Assets</div>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--status-warning-bg)", color: "var(--status-warning)" }}>
            <Icon name="calendar" size={24} />
          </div>
          <div>
            <div className="stat-value">4</div>
            <div className="stat-label">Scheduled Workshops</div>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: "var(--status-success-bg)", color: "var(--status-success)" }}>
            <Icon name="server" size={24} />
          </div>
          <div>
            <div className="stat-value">5</div>
            <div className="stat-label">Microservices Running</div>
          </div>
        </div>
      </section>

      {/* Learning Categories */}
      <section className="page-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Specialized Learning Tracks</h2>
            <p className="section-subtitle">
              Comprehensive curriculums structured from foundational web standards to cloud-native distributed microservices.
            </p>
          </div>
          <Link to="/courses" className="btn btn-ghost btn-sm" style={{ color: "var(--accent-primary)" }}>
            View all tracks <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        <div className="grid-cols-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="card"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/courses")}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-surface-subtle)",
                  color: cat.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16
                }}
              >
                <Icon name={cat.icon} size={22} />
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 6px" }}>{cat.name}</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses Grid */}
      <section className="page-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured University Courses</h2>
            <p className="section-subtitle">
              Loaded dynamically from Course Service (Port 8082) via API Gateway reverse proxy.
            </p>
          </div>
          <Link to="/courses" className="btn btn-secondary btn-sm">
            View All Courses ({courses.length})
          </Link>
        </div>

        <div className="grid-cards">
          {courses.slice(0, 3).map((course) => (
            <CourseCard
              key={course.id || course.code}
              course={course}
              onClick={onCourseClick}
            />
          ))}
        </div>
      </section>

      {/* Learning Resources Spotlight */}
      <section className="page-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Study Resources & Technical References</h2>
            <p className="section-subtitle">
              Download lecture slide decks, exercises, and architectural guides directly from Resource Service (Port 8083).
            </p>
          </div>
          <Link to="/resources" className="btn btn-secondary btn-sm">
            All Resources ({resources.length})
          </Link>
        </div>

        <div className="grid-cards">
          {resources.slice(0, 3).map((resource) => (
            <ResourceCard
              key={resource.id || resource.title}
              resource={resource}
            />
          ))}
        </div>
      </section>

      {/* Microservices Architecture Banner */}
      <section
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-xl)",
          padding: "32px 36px",
          marginBottom: 40,
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent-primary)", fontWeight: 600, fontSize: "0.8125rem", marginBottom: 12 }}>
              <Icon name="server" size={16} />
              <span>Independent Microservices & Database-Per-Service</span>
            </div>
            <h3 style={{ fontSize: "1.625rem", fontWeight: 800, margin: "0 0 12px", lineHeight: 1.25 }}>
              Engineered with True Distributed Systems Standards
            </h3>
            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 20px" }}>
              Unlike basic monoliths, this platform separates concerns into 5 distinct Spring Boot microservices,
              each with isolated databases (`user_db`, `course_db`, `resource_db`, `engagement_db`).
              The API Gateway enforces stateless JWT validation and identity header enrichment.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Link to="/about" className="btn btn-primary btn-sm">
                Inspect Architecture & Viva Lab
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-sm">
                Contact Academic Support
              </Link>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--dark-navy)",
              borderRadius: "var(--radius-lg)",
              padding: "20px 24px",
              color: "#CBD5E1",
              fontFamily: "monospace",
              fontSize: "0.8125rem",
              lineHeight: 1.7,
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <div style={{ color: "#38BDF8", fontWeight: 700, marginBottom: 8 }}>
              // Microservices Port Registry
            </div>
            <div>[Gateway]     : 8080 (Reverse Proxy & CORS)</div>
            <div>[User-Svc]    : 8081 (Auth & JWT Provider)</div>
            <div>[Course-Svc]  : 8082 (Courses & Enrollments)</div>
            <div>[Resource-Svc]: 8083 (Assets & Downloads)</div>
            <div>[Engage-Svc]  : 8084 (Events & Support)</div>
            <div style={{ marginTop: 10, color: "#10B981" }}>
              ✓ All services decoupled & isolated
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
