import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icons";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog shell shared by every modal in the portal.
 * - Traps focus while open and restores it to the trigger on close
 * - Closes on Escape and backdrop click
 * - Locks page scroll
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  footer,
  hideHeader = false,
  labelledBy,
  initialFocusRef,
  closeDisabled = false
}) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  onCloseRef.current = closeDisabled ? () => {} : onClose;

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocused.current = document.activeElement;
    document.body.classList.add("modal-open");

    const focusTimer = window.setTimeout(() => {
      const target =
        initialFocusRef?.current ||
        dialogRef.current?.querySelector("[data-autofocus]") ||
        dialogRef.current?.querySelector(FOCUSABLE) ||
        dialogRef.current;
      target?.focus();
    }, 20);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-open");
      const prev = previouslyFocused.current;
      if (prev && typeof prev.focus === "function") prev.focus();
    };
  }, [isOpen, initialFocusRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCloseRef.current?.();
      }}
    >
      <div
        ref={dialogRef}
        className={`modal-dialog modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || (title ? titleId : undefined)}
        tabIndex={-1}
      >
        {!hideHeader && (
          <div className="modal-header">
            <div>
              {title && (
                <h2 id={titleId} className="modal-title">
                  {title}
                </h2>
              )}
              {subtitle && <p className="modal-subtitle">{subtitle}</p>}
            </div>
            <button
              type="button"
              className="icon-btn modal-close"
              onClick={() => onCloseRef.current?.()}
              aria-label="Close dialog"
              disabled={closeDisabled}
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
