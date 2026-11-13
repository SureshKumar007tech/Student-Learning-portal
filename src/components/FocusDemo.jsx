import { useEffect, useRef, useState } from "react";
import Icon from "./Icons";
import { useToast } from "../hooks/ToastContext";

export default function FocusDemo() {
  const inputRef = useRef(null);
  const [count, setCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Preserving syllabus topic: useEffect synchronizing document title
    document.title = count > 0 ? `Student Portal (${count}) • LMS` : "Student Learning Portal • Enterprise LMS";
  }, [count]);

  const handleFocus = () => {
    inputRef.current?.focus();
    toast.info("useRef focused the direct DOM input node.");
  };

  return (
    <div
      style={{
        marginTop: 48,
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--bg-surface)",
        padding: "16px 20px",
        boxShadow: "var(--shadow-xs)"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer"
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--accent-primary-subtle)",
              color: "var(--accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Icon name="code" size={14} />
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
              React 19 Core Hooks Demonstration
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: 8 }}>
              (useState • useEffect • useRef • Syllabus Topic 10)
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ padding: "4px 8px" }}
        >
          <Icon name={isExpanded ? "chevron-down" : "chevron-right"} size={16} />
        </button>
      </div>

      {isExpanded && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid var(--border-color-subtle)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20
          }}
        >
          {/* useState + useEffect demonstration */}
          <div style={{ background: "var(--bg-surface-subtle)", padding: 14, borderRadius: "var(--radius-md)" }}>
            <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--text-primary)", marginBottom: 6 }}>
              useState & useEffect Demo
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 10px" }}>
              Clicking updates local state (<code>useState</code>) which triggers a document title update (<code>useEffect</code>):
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setCount((c) => c + 1)}
              >
                Increment Counter ({count})
              </button>
              {count > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCount(0)}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* useRef demonstration */}
          <div style={{ background: "var(--bg-surface-subtle)", padding: 14, borderRadius: "var(--radius-md)" }}>
            <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--text-primary)", marginBottom: 6 }}>
              useRef DOM Focus Demo
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 10px" }}>
              Accesses imperative DOM methods without triggering re-render:
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={inputRef}
                className="form-input"
                style={{ padding: "6px 10px", fontSize: "0.8125rem" }}
                placeholder="Target DOM element"
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleFocus}
              >
                Focus Input
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
