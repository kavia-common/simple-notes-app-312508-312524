import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import NotesList from "./components/NotesList";
import NoteEditorModal from "./components/NoteEditorModal";
import ConfirmDialog from "./components/ConfirmDialog";
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
} from "./api/notes";

/** Local fallback if backend is unavailable (keeps UI usable). */
const seedNotes = [
  {
    id: "n1",
    title: "Welcome",
    content:
      "This is a lightweight notes app UI. Notes will load from the backend when available. You can create, edit, and delete notes.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// PUBLIC_INTERFACE
function App() {
  /** UI state */
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create"); // "create" | "edit"

  /** API state */
  const [isLoading, setIsLoading] = useState(false); // for list + any mutation
  const [errorMessage, setErrorMessage] = useState("");

  /** Delete confirmation state */
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    noteId: null,
  });

  const activeNote = useMemo(() => {
    return notes.find((n) => String(n.id) === String(activeNoteId)) || null;
  }, [notes, activeNoteId]);

  const loadNotes = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const data = await listNotes();
      setNotes(Array.isArray(data) ? data : []);
    } catch (e) {
      // If backend is down, keep UX friendly by showing a message + seed content.
      setErrorMessage(
        `Could not load notes from backend. ${e?.message ? `(${e.message})` : ""}`.trim()
      );
      setNotes(seedNotes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
   * Save handler: create or update via API.
   */
  // PUBLIC_INTERFACE
  const handleSave = async ({ title, content }) => {
    setErrorMessage("");

    try {
      setIsLoading(true);

      if (editorMode === "create") {
        const created = await createNote({ title, content });
        setNotes((prev) => [created, ...prev]);
        setIsEditorOpen(false);
        return;
      }

      if (!activeNote) {
        setErrorMessage("Selected note not found.");
        return;
      }

      // Ensure we use numeric id when it comes from API; seed notes are string ids
      // and won't be updatable against backend.
      const updated = await updateNote(activeNote.id, { title, content });
      setNotes((prev) =>
        prev.map((n) => (String(n.id) === String(updated.id) ? updated : n))
      );
      setIsEditorOpen(false);
    } catch (e) {
      setErrorMessage(
        `Something went wrong while saving. ${e?.message ? `(${e.message})` : ""}`.trim()
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete handler: delete via API (keeps confirm flow).
   */
  const confirmDelete = async () => {
    if (!confirmState.noteId) return;

    setErrorMessage("");
    const toDeleteId = confirmState.noteId;

    try {
      setIsLoading(true);

      await deleteNote(toDeleteId);

      setNotes((prev) => prev.filter((n) => String(n.id) !== String(toDeleteId)));
      if (String(activeNoteId) === String(toDeleteId)) {
        setActiveNoteId(null);
      }
      closeConfirm();
    } catch (e) {
      setErrorMessage(
        `Failed to delete the note. ${e?.message ? `(${e.message})` : ""}`.trim()
      );
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
