import React, { useMemo } from "react";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// PUBLIC_INTERFACE
function NoteItem({ note, selected, onSelect, onEdit, onDelete }) {
  const preview = useMemo(() => {
    const raw = (note?.content || "").trim();
    return raw.length ? raw : "No content";
  }, [note]);

  return (
    <article
      className={`noteCard ${selected ? "noteCard--selected" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`Open note ${note?.title || ""}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="noteCard__titleRow">
        <h3 className="noteCard__title">{note?.title || "Untitled"}</h3>

        <div className="noteCard__actions">
          <button
            type="button"
            className="iconBtn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Edit note"
            title="Edit"
          >
            Edit
          </button>

          <button
            type="button"
            className="iconBtn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete note"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="noteCard__content">{preview}</p>

      <div className="noteCard__meta">
        <span>Updated {formatDate(note?.updated_at || note?.created_at)}</span>
        <span style={{ color: "var(--accent)", fontWeight: 700 }}>●</span>
      </div>
    </article>
  );
}

export default NoteItem;
