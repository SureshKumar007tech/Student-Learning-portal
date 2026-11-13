import { useState, useMemo } from "react";
import CourseCard from "../components/CourseCard";
import Icon from "../components/Icons";

export default function Courses({ courses = [], onCourseClick }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  // useMemo: Avoid recalculating the filtered list unnecessarily (Syllabus topic 13)
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Filter by level
    if (selectedLevel !== "All") {
      result = result.filter(
        (c) => c.level?.toLowerCase() === selectedLevel.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.code?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "duration-asc") {
      result.sort((a, b) => (a.durationHours || 0) - (b.durationHours || 0));
    } else if (sortBy === "duration-desc") {
      result.sort((a, b) => (b.durationHours || 0) - (a.durationHours || 0));
    } else if (sortBy === "title-asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [courses, selectedLevel, searchQuery, sortBy]);

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Academic Course Catalogue</h2>
          <p className="section-subtitle">
            Distributed curriculum loaded dynamically from Course Microservice (Port 8082).
          </p>
        </div>
        <span className="badge badge-blue">
          {filteredCourses.length} of {courses.length} Courses
        </span>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="toolbar-container">
        {/* Level Filter Pills */}
        <div className="filter-pills">
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginRight: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="filter" size={14} /> Level:
          </span>
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`filter-pill ${selectedLevel === lvl ? "active" : ""}`}
              onClick={() => setSelectedLevel(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Right side: Search & Sort */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search Box */}
          <div className="search-input-box">
            <Icon name="search" size={16} className="search-icon-inside" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, title..."
            />
          </div>

          {/* Sort Dropdown */}
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "8px 12px", fontSize: "0.8125rem", width: "auto" }}
          >
            <option value="default">Sort: Default</option>
            <option value="duration-asc">Duration: Short to Long</option>
            <option value="duration-desc">Duration: Long to Short</option>
            <option value="title-asc">Title: A to Z</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="search" size={24} />
          </div>
          <h3 className="empty-state-title">No Courses Match Your Criteria</h3>
          <p className="empty-state-desc">
            Try adjusting your search terms or selecting "All" from the level filter above.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSelectedLevel("All");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id || course.code}
              course={course}
              onClick={onCourseClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
