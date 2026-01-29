/**
 * Notes API client.
 *
 * Base URL resolution:
 * - Uses REACT_APP_BACKEND_URL if set (recommended in preview environments)
 * - Falls back to REACT_APP_API_BASE
 * - Finally falls back to "http://localhost:8000" for local dev
 */

const DEFAULT_BASE_URL = "http://localhost:8000";

function getApiBaseUrl() {
  const envUrl = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_BASE;
  return (envUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

async function parseErrorResponse(res) {
  const contentType = res.headers.get("content-type") || "";

  // FastAPI typically returns { detail: "..." } for errors.
  if (contentType.includes("application/json")) {
    try {
      const body = await res.json();
      if (body && typeof body.detail === "string") return body.detail;
      return JSON.stringify(body);
    } catch (_) {
      return `Request failed with status ${res.status}`;
    }
  }

  try {
    const text = await res.text();
    return text || `Request failed with status ${res.status}`;
  } catch (_) {
    return `Request failed with status ${res.status}`;
  }
}

async function request(path, options = {}) {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const message = await parseErrorResponse(res);
    throw new Error(message);
  }

  // For 204 No Content.
  if (res.status === 204) return null;

  // Otherwise JSON response.
  return res.json();
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** Fetch all notes ordered by backend (updated_at desc). */
  return request("/notes", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getNote(id) {
  /** Fetch a single note by id. */
  return request(`/notes/${encodeURIComponent(id)}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function createNote({ title, content }) {
  /** Create a new note. */
  return request("/notes", {
    method: "POST",
    body: JSON.stringify({ title, content: content ?? "" }),
  });
}

// PUBLIC_INTERFACE
export async function updateNote(id, { title, content }) {
  /** Replace title/content for an existing note. */
  return request(`/notes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ title, content: content ?? "" }),
  });
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete a note by id. */
  return request(`/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
}
