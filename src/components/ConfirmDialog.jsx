import Icon from "./Icons";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "primary", // 'primary' | 'danger'
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-dialog"
        style={{ maxWidth: "440px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor:
                  type === "danger"
                    ? "var(--status-error-bg)"
                    : "var(--accent-primary-subtle)",
                color:
                  type === "danger"
                    ? "var(--status-error)"
                    : "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icon name={type === "danger" ? "trash" : "award"} size={18} />
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            aria-label="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${type === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

