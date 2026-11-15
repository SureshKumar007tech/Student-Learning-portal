import { useEffect, useRef, useState } from "react";
import Icon from "./Icons";
import { useToast } from "../hooks/ToastContext";

/**
 * React core hooks demonstration (useState · useEffect · useRef — Syllabus topic 10).
 * Shown only on the About page, inside the developer section.
 */
export default function FocusDemo() {
  const inputRef = useRef(null);
  const [count, setCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // useEffect synchronising the document title with state
    if (count > 0) document.title = `(${count}) About · Student Learning Portal`;
    else document.title = "About · Student Learning Portal";
  }, [count]);

  const handleFocus = () => {
    inputRef.current?.focus();
    toast.info("useRef moved focus to the input without a re-render.", "useRef");
  };

  return (
    <div className="dev-panel">
      <button
        type="button"
        className="dev-panel-toggle"
        onClick={() => setIsExpanded((v) => !v)}
        aria-expanded={isExpanded}
        aria-controls="focus-demo-body"
      >
        <span className="row" style={{ gap: 12 }}>
          <span className="feature-icon" style={{ margin: 0, width: 32, height: 32 }}>
            <Icon name="code" size={16} />
          </span>
          <span>
            <span style={{ display: "block", fontWeight: 600, fontSize: "var(--text-sm)" }}>Core hooks demo</span>
            <span className="small muted">useState · useEffect · useRef</span>
          </span>
        </span>
        <Icon name="chevron-down" size={16} style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>

      {isExpanded && (
        <div id="focus-demo-body" className="dev-panel-body">
          <div className="card card-compact" style={{ background: "var(--bg-surface-subtle)", boxShadow: "none" }}>
            <h4 style={{ fontSize: "var(--text-sm)", marginBottom: 6 }}>useState &amp; useEffect</h4>
            <p className="small" style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
              Clicking updates local state, and an effect mirrors the count into the browser tab title.
            </p>
            <div className="row">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setCount((c) => c + 1)}>
                Increment ({count})
              </button>
              {count > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCount(0)}>
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="card card-compact" style={{ background: "var(--bg-surface-subtle)", boxShadow: "none" }}>
            <h4 style={{ fontSize: "var(--text-sm)", marginBottom: 6 }}>useRef DOM access</h4>
            <p className="small" style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
              Focuses the input imperatively without triggering a re-render.
            </p>
            <div className="row" style={{ flexWrap: "nowrap" }}>
              <label htmlFor="focus-demo-input" className="visually-hidden">Demo input</label>
              <input id="focus-demo-input" ref={inputRef} className="form-input" placeholder="Target input" />
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleFocus}>
                Focus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
