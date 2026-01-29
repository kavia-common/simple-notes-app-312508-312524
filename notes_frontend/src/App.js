import React, { useMemo, useState } from "react";
import "./App.css";
import NotesList from "./components/NotesList";
import NoteEditorModal from "./components/NoteEditorModal";
import ConfirmDialog from "./components/ConfirmDialog";

/**
 * Notes are kept in local state for now. API integration will replace these handlers
 * in a subsequent step.
 */
const seedNotes = [
  {
    id: "n1",
    title: "Welcome",
    content:
      "This is a lightweight notes app UI. In the next step, these notes will be loaded from the backend. You can create, edit, and delete notes in the meantime.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "n2",
    title: "Tip",
    content:
      "Click a note to edit it. Use the Delete action to remove it (with confirmation). Titles are required; content is optional.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// PUBLIC_INTERFACE
function App() {
  /** UI state */
  const [notes, setNotes] = useState(seedNotes);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create"); // "create" | "edit"

  /** Placeholder API state for next step */
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /** Delete confirmation state */
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    noteId: null,
  });

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  // PUBLIC_INTERFACE
  const openCreate = () => {
    setEditorMode("create");
    setActiveNoteId(null);
    setIsEditorOpen(true);
  };

  // PUBLIC_INTERFACE
  const openEdit = (noteId) => {
    setEditorMode("edit");
    setActiveNoteId(noteId);
    setIsEditorOpen(true);
  };

  // PUBLIC_INTERFACE
  const closeEditor = () => {
    setIsEditorOpen(false);
  };

  // PUBLIC_INTERFACE
  const requestDelete = (noteId) => {
    setConfirmState({ isOpen: true, noteId });
  };

  const closeConfirm = () => {
    setConfirmState({ isOpen: false, noteId: null });
  };

  /**
   * Placeholder save handler.
   * Next step: replace the internals with API calls and optimistic updates.
   */
  // PUBLIC_INTERFACE
  const handleSave = async ({ title, content }) => {
    setErrorMessage("");

    // Placeholder async boundary to make it easy to swap to API.
    try {
      setIsLoading(true);

      if (editorMode === "create") {
        const now = new Date().toISOString();
        const newNote = {
          id: `local_${Date.now()}`,
          title,
          content,
          created_at: now,
          updated_at: now,
        };
        setNotes((prev) => [newNote, ...prev]);
        setIsEditorOpen(false);
        return;
      }

      if (!activeNote) {
        setErrorMessage("Selected note not found.");
        return;
      }

      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNote.id
            ? { ...n, title, content, updated_at: new Date().toISOString() }
            : n
        )
      );
      setIsEditorOpen(false);
    } catch (e) {
      setErrorMessage("Something went wrong while saving. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Placeholder delete handler.
   * Next step: replace with API call; keep confirm flow.
   */
  const confirmDelete = async () => {
    if (!confirmState.noteId) return;

    setErrorMessage("");
    try {
      setIsLoading(true);
      const toDeleteId = confirmState.noteId;
      setNotes((prev) => prev.filter((n) => n.id !== toDeleteId));

      if (activeNoteId === toDeleteId) {
        setActiveNoteId(null);
      }
      closeConfirm();
    } catch (e) {
      setErrorMessage("Failed to delete the note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App notesApp">
      <header className="notesHeader">
        <div className="notesHeader__brand" role="banner">
          <div className="notesHeader__mark" aria-hidden="true" />
          <div className="notesHeader__text">
            <h1 className="notesHeader__title">Notes</h1>
            <p className="notesHeader__subtitle">
              Simple, fast notes — light theme with blue/cyan accents.
            </p>
          </div>
        </div>

        <div className="notesHeader__actions">
          <button
            type="button"
            className="btn btnPrimary"
            onClick={openCreate}
            disabled={isLoading}
          >
            Create Note
          </button>
        </div>
      </header>

      <main className="notesMain">
        {errorMessage ? (
          <div className="alert alertError" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <NotesList
          notes={notes}
          selectedNoteId={activeNoteId}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onSelectNote={(noteId) => {
            setActiveNoteId(noteId);
            openEdit(noteId);
          }}
          onEditNote={(noteId) => openEdit(noteId)}
          onDeleteNote={(noteId) => requestDelete(noteId)}
          onCreateNote={openCreate}
        />
      </main>

      {/* Floating action button (mobile-friendly secondary entry) */}
      <button
        type="button"
        className="fab"
        onClick={openCreate}
        aria-label="Create note"
        disabled={isLoading}
      >
        +
      </button>

      <NoteEditorModal
        isOpen={isEditorOpen}
        mode={editorMode}
        note={activeNote}
        isSaving={isLoading}
        onClose={closeEditor}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title="Delete note?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onCancel={closeConfirm}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default App;
