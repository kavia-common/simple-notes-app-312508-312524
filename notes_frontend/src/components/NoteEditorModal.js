import React, { useEffect, useMemo, useRef, useState } from "react";

const initialDraft = { title: "", content: "" };

// PUBLIC_INTERFACE
function NoteEditorModal({ isOpen, mode, note, isSaving, onClose, onSave }) {
  const [draft, setDraft] = useState(initialDraft);
  const [touched, setTouched] = useState({ title: false });
  const titleInputRef = useRef(null);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!isOpen) return;

    // Initialize draft when opening.
    if (isEdit && note) {
      setDraft({ title: note.title || "", content: note.content || "" });
    } else {
      setDraft(initialDraft);
    }
    setTouched({ title: false });

    // Focus title for fast entry/edit.
    window.setTimeout(() => titleInputRef.current?.focus(), 0);
  }, [isOpen, isEdit, note]);

  const titleError = useMemo(() => {
    if (!touched.title) return "";
    if (!draft.title.trim()) return "Title is required.";
    return "";
  }, [draft.title, touched.title]);

  const canSave = draft.title.trim().length > 0 && !isSaving;

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit note" : "Create note"}
      onMouseDown={(e) => {
        // Close when clicking on overlay (not when clicking inside modal).
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">{isEdit ? "Edit Note" : "Create Note"}</h2>
          <button type="button" className="btn btnGhost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal__body">
          <div className="formGrid">
            <div>
              <label className="fieldLabel" htmlFor="note-title">
                Title <span aria-hidden="true">*</span>
              </label>
              <input
                id="note-title"
                ref={titleInputRef}
                className="input"
                value={draft.title}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, title: e.target.value }))
                }
                onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                placeholder="e.g., Meeting notes"
                disabled={isSaving}
                aria-invalid={Boolean(titleError)}
                aria-describedby={titleError ? "note-title-error" : undefined}
              />
              {titleError ? (
                <div className="fieldError" id="note-title-error">
                  {titleError}
                </div>
              ) : (
                <div className="fieldHelp">Keep it short and descriptive.</div>
              )}
            </div>

            <div>
              <label className="fieldLabel" htmlFor="note-content">
                Content
              </label>
              <textarea
                id="note-content"
                className="textarea"
                value={draft.content}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="Write your note here…"
                disabled={isSaving}
              />
              <div className="fieldHelp">
                Content is optional (you can save a title-only note).
              </div>
            </div>
          </div>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btnSolidPrimary"
            onClick={() => {
              setTouched({ title: true });
              if (!draft.title.trim()) return;
              onSave({ title: draft.title.trim(), content: draft.content });
            }}
            disabled={!canSave}
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteEditorModal;
