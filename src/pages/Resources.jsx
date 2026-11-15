import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ResourceCard from "../components/ResourceCard";
import Icon from "../components/Icons";
import { EmptyState, ErrorState, LoadingGrid, PageHeader, RESOURCE_TYPES } from "../components/ui";

const TYPES = ["All", ...Object.keys(RESOURCE_TYPES)];

export default function Resources({ resourcesState, onRetry }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchQuery(q);
      setSelectedType("All");
    }
  }, [searchParams]);

  const updateSearch = (value) => {
    setSearchQuery(value);
    if (searchParams.has("q")) {
      searchParams.delete("q");
      setSearchParams(searchParams, { replace: true });
    }
  };

  const resources = resourcesState.data;

  const filteredResources = useMemo(() => {
    let result = [...resources];
    if (selectedType !== "All") {
      result = result.filter((r) => r.resourceType?.toUpperCase() === selectedType);
    }
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.resourceType?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [resources, selectedType, searchQuery]);

  const hasFilters = selectedType !== "All" || searchQuery.trim() !== "";
  const resetFilters = () => {
    setSelectedType("All");
    updateSearch("");
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Study resources"
        title="Notes, exercises and guides"
        lead="Download lecture notes, practice exercises, starter projects and quick-reference sheets to support your coursework."
      />

      <section className="section" aria-labelledby="resource-results-heading">
        <h2 id="resource-results-heading" className="visually-hidden">Resource results</h2>

        <div className="toolbar" role="search" aria-label="Filter resources">
          <div>
            <span className="toolbar-label" id="type-filter-label">Type</span>
            <div className="segmented" role="group" aria-labelledby="type-filter-label">
              {TYPES.map((type) => (
                <button key={type} type="button" aria-pressed={selectedType === type} onClick={() => setSelectedType(type)}>
                  {type === "All" ? "All types" : RESOURCE_TYPES[type].label}
                </button>
              ))}
            </div>
          </div>
          <div className="search-field">
            <label htmlFor="resource-search" className="toolbar-label">Search</label>
            <div style={{ position: "relative" }}>
              <Icon name="search" size={16} />
              <input
                id="resource-search"
                type="search"
                className="form-input"
                value={searchQuery}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder="Title or keyword"
              />
            </div>
          </div>
        </div>

        {resourcesState.status === "ready" && (
          <div className="row-between">
            <p className="results-summary" role="status" aria-live="polite">
              Showing {filteredResources.length} of {resources.length} resource{resources.length === 1 ? "" : "s"}
            </p>
            {hasFilters && (
              <button type="button" className="text-link" onClick={resetFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {resourcesState.status === "loading" && <LoadingGrid count={6} label="Loading resources" />}

        {resourcesState.status === "error" && (
          <ErrorState title="We couldn't load study resources" description={resourcesState.error} onRetry={onRetry} />
        )}

        {resourcesState.status === "ready" && resources.length === 0 && (
          <EmptyState
            icon="file-text"
            title="No resources have been shared yet"
            description="Study materials will appear here as soon as faculty upload them."
          />
        )}

        {resourcesState.status === "ready" && resources.length > 0 && filteredResources.length === 0 && (
          <EmptyState icon="search" title="No resources match your filters" description="Try another type or a different keyword.">
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters}>
              Clear filters
            </button>
          </EmptyState>
        )}

        {resourcesState.status === "ready" && filteredResources.length > 0 && (
          <div className="grid-cards">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id ?? resource.title} resource={resource} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
