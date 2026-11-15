import Modal from "./Modal";
import { Spinner } from "./ui";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  details,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loadingText = "Working…",
  type = "primary", // 'primary' | 'danger'
  loading = false,
  onConfirm,
  onCancel
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      closeDisabled={loading}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading} data-autofocus={type === "danger" ? true : undefined}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${type === "danger" ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            data-autofocus={type !== "danger" ? true : undefined}
          >
            {loading ? (
              <>
                <Spinner /> {loadingText}
              </>
            ) : (
              confirmText
            )}
          </button>
        </>
      }
    >
      <div className="modal-body">
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-base)" }}>{message}</p>
        {details && <div style={{ marginTop: 16 }}>{details}</div>}
      </div>
    </Modal>
  );
}
