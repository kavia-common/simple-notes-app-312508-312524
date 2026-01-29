import React, { useEffect } from "react";

// PUBLIC_INTERFACE
function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Confirm"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="dialog">
        <div className="dialog__body">
          <h2 className="dialog__title">{title}</h2>
          {description ? <p className="dialog__desc">{description}</p> : null}
        </div>

        <div className="dialog__footer">
          <button type="button" className="btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${destructive ? "btnDanger" : "btnSolidPrimary"}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
