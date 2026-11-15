import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import Icon from "../components/Icons";
import { EmptyState, ErrorState, LoadingGrid, PageHeader } from "../components/ui";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function Courses({
  coursesState,
  filteredCourses = [],
  selectedLevel = "All",
  onLevelChange,
  enrolledCourseIds,
  onEnrolled,
  onRetry
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState("default");

  // Keep the search box in sync when arriving from global search
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchQuery(q);
      onLevelChange("All");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateSearch = (value) => {
    setSearchQuery(value);
    if (searchParams.has("q")) {
      searchParams.delete("q");
      setSearchParams(searchParams, { replace: true });
    }
  };

  const allCourses = coursesState.data;

  // useMemo: avoid recalculating the visible list unnecessarily (Syllabus topic 13)
  const visibleCourses = useMemo(() => {
    let result = [...filteredCourses];
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.code?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    if (sortBy === "duration-asc") result.sort((a, b) => (a.durationHours || 0) - (b.durationHours || 0));
    else if (sortBy === "duration-desc") result.sort((a, b) => (b.durationHours || 0) - (a.durationHours || 0));
    else if (sortBy === "title-asc") result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return result;
  }, [filteredCourses, searchQuery, sortBy]);

  const hasFilters = selectedLevel !== "All" || searchQuery.trim() !== "";

  const resetFilters = () => {
    onLevelChange("All");
    updateSearch("");
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Course catalogue"
        title="Find your next course"
        lead="Browse courses by level, read what each one covers, and enroll in a click. Enrolled courses appear on your dashboard."
      />

      <section className="section" aria-labelledby="course-results-heading">
        <h2 id="course-results-heading" className="visually-hidden">Course results</h2>

        <div className="toolbar" role="search" aria-label="Filter courses">
          <div className="toolbar-group">
            <div>
              <span className="toolbar-label" id="level-filter-label">Level</span>
              <div className="segmented" role="group" aria-labelledby="level-filter-label">
                {LEVELS.map((lvl) => (
                  <button key={lvl} type="button" aria-pressed={selectedLevel === lvl} onClick={() => onLevelChange(lvl)}>
                    {lvl === "All" ? "All levels" : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="toolbar-group" style={{ flex: 1, justifyContent: "flex-end" }}>
            <div className="search-field">
              <label htmlFor="course-search" className="toolbar-label">Search</label>
              <div style={{ position: "relative" }}>
                <Icon name="search" size={16} />
                <input
                  id="course-search"
                  type="search"
                  className="form-input"
                  value={searchQuery}
                  onChange={(e) => updateSearch(e.target.value)}
                  placeholder="Title, code or topic"
                />
              </div>
            </div>
            <div>
              <label htmlFor="course-sort" className="toolbar-label">Sort by</label>
              <select id="course-sort" className="form-select form-select-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Recommended</option>
                <option value="title-asc">Title (A–Z)</option>
                <option value="duration-asc">Shortest first</option>
                <option value="duration-desc">Longest first</option>
              </select>
            </div>
          </div>
        </div>

        {coursesState.status === "ready" && (
          <div className="row-between">
            <p className="results-summary" role="status" aria-live="polite">
              Showing {visibleCourses.length} of {allCourses.length} course{allCourses.length === 1 ? "" : "s"}
            </p>
            {hasFilters && (
              <button type="button" className="text-link" onClick={resetFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {coursesState.status === "loading" && <LoadingGrid count={6} label="Loading courses" />}

        {coursesState.status === "error" && (
          <ErrorState
            title="We couldn't load the course catalogue"
            description={coursesState.error}
            onRetry={onRetry}
          />
        )}

        {coursesState.status === "ready" && allCourses.length === 0 && (
          <EmptyState
            icon="book"
            title="No courses have been published yet"
            description="New courses will appear here as soon as faculty publish them."
          />
        )}

        {coursesState.status === "ready" && allCourses.length > 0 && visibleCourses.length === 0 && (
          <EmptyState
            icon="search"
            title="No courses match your filters"
            description="Try a different search term or show all levels."
          >
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters}>
              Clear filters
            </button>
          </EmptyState>
        )}

        {coursesState.status === "ready" && visibleCourses.length > 0 && (
          <div className="grid-cards">
            {visibleCourses.map((course) => (
              <CourseCard
                key={course.id ?? course.code}
                course={course}
                isAlreadyEnrolled={enrolledCourseIds?.has(course.id)}
                onEnrollSuccess={onEnrolled}
                headingLevel={3}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
