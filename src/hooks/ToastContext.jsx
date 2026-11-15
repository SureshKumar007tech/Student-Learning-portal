import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = "info", duration = type === "error" ? 7000 : 4500 }) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = useCallback((options) => {
    if (typeof options === "string") {
      return addToast({ message: options, type: "info" });
    }
    return addToast(options);
  }, [addToast]);

  toast.success = (message, title = "Done") => addToast({ title, message, type: "success" });
  toast.error = (message, title = "Something went wrong") => addToast({ title, message, type: "error" });
  toast.info = (message, title = "") => addToast({ title, message, type: "info" });
  toast.warning = (message, title = "Heads up") => addToast({ title, message, type: "warning" });

  return (
    <ToastContext.Provider value={{ toast, removeToast, toasts }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role={t.type === "error" ? "alert" : "status"}>
            <div className="toast-icon">
              {t.type === "success" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              {t.type === "error" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              {t.type === "warning" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {t.type === "info" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>
            <div className="toast-content">
              {t.title && <div className="toast-title">{t.title}</div>}
              <div className="toast-message">{t.message}</div>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(t.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
