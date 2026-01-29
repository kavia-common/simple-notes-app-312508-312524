import React from "react";
import NoteItem from "./NoteItem";

// PUBLIC_INTERFACE
function NotesList({
  notes,
  selectedNoteId,
  isLoading,
  errorMessage,
  onSelectNote,
  onEditNote,
  onDeleteNote,
  onCreateNote,
}) {
  const hasNotes = Array.isArray(notes) && notes.length > 0;

  return (
    <section className="notesPanel" aria-label="Notes list">
      <div className="notesPanel__header">
        <h2 className="notesPanel__headerTitle">Your notes</h2>

        <button
          type="button"
          className="btn btnPrimary"
          onClick={onCreateNote}
          disabled={isLoading}
        >
          New
        </button>
      </div>

      <div className="notesPanel__body">
        {isLoading ? (
          <div className="noteEmpty" role="status" aria-live="polite">
            Loading notes…
          </div>
        ) : errorMessage ? (
          <div className="noteEmpty" role="status" aria-live="polite">
            Could not load notes.
          </div>
        ) : !hasNotes ? (
          <div className="noteEmpty">
            <p className="noteEmpty__title">No notes yet</p>
            <p className="noteEmpty__text">
              Create your first note to get started.
            </p>
            <button
              type="button"
              className="btn btnSolidPrimary"
              onClick={onCreateNote}
            >
              Create Note
            </button>
          </div>
        ) : (
          <div className="notesGrid">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                selected={note.id === selectedNoteId}
                onSelect={() => onSelectNote(note.id)}
                onEdit={() => onEditNote(note.id)}
                onDelete={() => onDeleteNote(note.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default NotesList;
