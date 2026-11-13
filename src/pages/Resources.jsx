import { useState, useMemo } from "react";
import ResourceCard from "../components/ResourceCard";
import Icon from "../components/Icons";

export default function Resources({ resources = [] }) {
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const types = ["All", "NOTES", "EXERCISES", "PROJECTS", "CHEATSHEET"];

  const filteredResources = useMemo(() => {
    let result = [...resources];

    if (selectedType !== "All") {
      result = result.filter(
        (r) => r.resourceType?.toUpperCase() === selectedType.toUpperCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.resourceType?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [resources, selectedType, searchQuery]);

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Academic Study Resources & Assets</h2>
          <p className="section-subtitle">
            Downloadable lecture slides, coding exercises, starter boilerplates, and architectural cheat sheets from Resource Service (Port 8083).
          </p>
        </div>
        <span className="badge badge-cyan">
          {filteredResources.length} of {resources.length} Assets
        </span>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="toolbar-container">
        {/* Category Filter Pills */}
        <div className="filter-pills">
          <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginRight: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="filter" size={14} /> Category:
          </span>
          {types.map((type) => (
            <button
              key={type}
              type="button"
              className={`filter-pill ${selectedType === type ? "active" : ""}`}
              onClick={() => setSelectedType(type)}
            >
              {type === "ALL" || type === "All"
                ? "All Assets"
                : type === "NOTES"
                ? "Lecture Notes"
                : type === "EXERCISES"
                ? "Exercises"
                : type === "PROJECTS"
                ? "Projects"
                : "Cheatsheet"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="search-input-box">
          <Icon name="search" size={16} className="search-icon-inside" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by keyword..."
          />
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="download" size={24} />
          </div>
          <h3 className="empty-state-title">No Resources Match Your Filter</h3>
          <p className="empty-state-desc">
            No study materials found for this selection. Try choosing "All Assets" or searching with different keywords.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSelectedType("All");
              setSearchQuery("");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id || resource.title}
              resource={resource}
            />
          ))}
        </div>
      )}
    </div>
  );
}
