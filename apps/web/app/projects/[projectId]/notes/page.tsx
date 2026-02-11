"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { useCurrentProject } from "../../../current-project-context";
import { getApiBaseUrl } from "../../../lib/env";

type Note = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
};

export default function ProjectNotesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: session, status } = useSession();
  const { currentProject, setCurrentProject } = useCurrentProject();
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", body: "" });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", body: "", pinned: false });
  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    if (projectId && projectId !== currentProject.id) {
      setCurrentProject({ id: projectId, name: currentProject.name });
    }

    if (!projectId && !currentProject.id) {
      return;
    }

    const activeProjectId = projectId ?? currentProject.id;
    if (!activeProjectId) {
      return;
    }

    const loadNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${apiBaseUrl}/projects/${activeProjectId}/notes`,
          {
          headers: {
            Authorization: `Bearer ${session?.accessToken ?? ""}`,
          },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load notes");
        }

        const data = (await response.json()) as Note[];
        setNotes(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [
    apiBaseUrl,
    currentProject.id,
    currentProject.name,
    projectId,
    session?.accessToken,
    setCurrentProject,
    status,
  ]);

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      setError("Title and body are required.");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const activeProjectId = projectId ?? currentProject.id;
      if (!activeProjectId) {
        throw new Error("Select a project first");
      }
      const response = await fetch(`${apiBaseUrl}/projects/${activeProjectId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken ?? ""}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          body: formData.body.trim(),
          pinned: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      const created = (await response.json()) as Note;
      setNotes((prev) => [created, ...prev]);
      setFormData({ title: "", body: "" });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unknown error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    setError(null);
    try {
      const activeProjectId = projectId ?? currentProject.id;
      if (!activeProjectId) {
        throw new Error("Select a project first");
      }
      const response = await fetch(
        `${apiBaseUrl}/projects/${activeProjectId}/notes/${noteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken ?? ""}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unknown error");
    }
  };

  const beginEdit = (note: Note) => {
    setEditingId(note.id);
    setEditData({ title: note.title, body: note.body, pinned: note.pinned });
  };

  const handleUpdate = async () => {
    if (!editingId) {
      return;
    }

    setError(null);
    try {
      const activeProjectId = projectId ?? currentProject.id;
      if (!activeProjectId) {
        throw new Error("Select a project first");
      }
      const response = await fetch(
        `${apiBaseUrl}/projects/${activeProjectId}/notes/${editingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken ?? ""}`,
          },
          body: JSON.stringify({
            title: editData.title.trim(),
            body: editData.body.trim(),
            pinned: editData.pinned,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      const updated = (await response.json()) as Note;
      setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)));
      setEditingId(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unknown error");
    }
  };

  return (
    <div className="notes-page">
      <div className="projects-header">
        <div>
          <p className="eyebrow">Project notes</p>
          <h2 className="section-title">Notes</h2>
        </div>
        <button className="btn primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Close" : "Add note"}
        </button>
      </div>

      {showForm ? (
        <div className="card note-form">
          <div className="card-header">
            <h3>Add a note</h3>
            <span className="badge">Shared</span>
          </div>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">Title</span>
              <input
                className="field-input"
                value={formData.title}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Weekend plan"
              />
            </label>
            <label className="field">
              <span className="field-label">Body</span>
              <textarea
                className="field-input field-textarea"
                value={formData.body}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, body: event.target.value }))
                }
                placeholder="Remember to book the cabin before Friday."
                rows={4}
              />
            </label>
          </div>
          <button className="btn primary" onClick={handleCreate} disabled={creating}>
            {creating ? "Saving..." : "Save note"}
          </button>
        </div>
      ) : null}

      {status === "loading" ? <p>Checking session...</p> : null}
      {status === "unauthenticated" ? (
        <div className="card">
          <p className="card-body">Sign in to view notes.</p>
        </div>
      ) : null}
      {loading ? (
        <div className="card">
          <p className="card-body">Loading notes...</p>
        </div>
      ) : null}
      {error ? (
        <div className="card">
          <p className="card-body">{error}</p>
        </div>
      ) : null}

      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="card note-card">
            <div className="card-header">
              <h3>{note.title}</h3>
              <div className="note-actions">
                <button className="chip" onClick={() => beginEdit(note)}>
                  Edit
                </button>
                <button className="chip" onClick={() => handleDelete(note.id)}>
                  Delete
                </button>
              </div>
            </div>
            <p className="card-body">{note.body}</p>
            <p className="card-meta">
              {new Date(note.createdAt).toLocaleString()}
            </p>
            {editingId === note.id ? (
              <div className="note-edit">
                <label className="field">
                  <span className="field-label">Title</span>
                  <input
                    className="field-input"
                    value={editData.title}
                    onChange={(event) =>
                      setEditData((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">Body</span>
                  <textarea
                    className="field-input field-textarea"
                    value={editData.body}
                    onChange={(event) =>
                      setEditData((prev) => ({ ...prev, body: event.target.value }))
                    }
                    rows={3}
                  />
                </label>
                <label className="note-toggle">
                  <input
                    type="checkbox"
                    checked={editData.pinned}
                    onChange={(event) =>
                      setEditData((prev) => ({ ...prev, pinned: event.target.checked }))
                    }
                  />
                  <span>Pin note</span>
                </label>
                <div className="form-actions">
                  <button className="btn ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                  <button className="btn primary" onClick={handleUpdate}>
                    Save changes
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}