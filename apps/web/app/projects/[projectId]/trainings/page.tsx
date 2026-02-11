"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { useCurrentProject } from "../../../current-project-context";

type Training = {
  id: string;
  title: string;
  type: string;
  duration: number;
  date: string;
  intensity?: number | null;
  notes?: string | null;
  tags: string[];
  createdAt: string;
  author?: { id: string; name: string | null; email: string };
};

type Member = {
  id: string;
  userId: string;
  user: { id: string; name: string | null; email: string };
};

const activityOptions = [
  "Gym",
  "Swimming",
  "Bike",
  "Hiking",
  "Running",
  "Yoga",
  "Other",
];

export default function TrainingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: session, status } = useSession();
  const { currentProject, setCurrentProject } = useCurrentProject();
  const searchParams = useSearchParams();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    type: activityOptions[0],
    duration: "",
    date: new Date().toISOString().slice(0, 10),
    intensity: "",
    notes: "",
    tags: "",
  });
  const [formData, setFormData] = useState({
    title: "",
    type: activityOptions[0],
    duration: "",
    date: new Date().toISOString().slice(0, 10),
    intensity: "",
    notes: "",
    tags: "",
  });

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

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

    const activeProjectId = projectId ?? currentProject.id;
    if (!activeProjectId) {
      return;
    }

    const loadTrainings = async () => {
      setLoading(true);
      setError(null);
      try {
        const authorQuery =
          selectedAuthorId !== "all" ? `?authorId=${selectedAuthorId}` : "";
        const response = await fetch(
          `${apiBaseUrl}/projects/${activeProjectId}/trainings${authorQuery}`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken ?? ""}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load trainings");
        }

        const data = (await response.json()) as Training[];
        setTrainings(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    const loadMembers = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/projects/${activeProjectId}/members`,
          {
            headers: {
              Authorization: `Bearer ${session?.accessToken ?? ""}`,
            },
          },
        );
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as Member[];
        setMembers(data);
      } catch {
        // ignore member load errors
      }
    };

    loadTrainings();
    loadMembers();
  }, [
    apiBaseUrl,
    currentProject.id,
    currentProject.name,
    projectId,
    selectedAuthorId,
    session?.accessToken,
    setCurrentProject,
    status,
  ]);

  const handleCreate = async () => {
    const activeProjectId = projectId ?? currentProject.id;
    if (!activeProjectId) {
      setError("Select a project first");
      return;
    }
    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!formData.duration.trim()) {
      setError("Duration is required.");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${activeProjectId}/trainings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken ?? ""}`,
          },
          body: JSON.stringify({
            title: formData.title.trim(),
            type: formData.type,
            duration: Number(formData.duration),
            date: formData.date,
            intensity: formData.intensity ? Number(formData.intensity) : null,
            notes: formData.notes.trim() || null,
            tags: formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create training");
      }

      const created = (await response.json()) as Training;
      setTrainings((prev) => [created, ...prev]);
      setFormData((prev) => ({
        ...prev,
        title: "",
        duration: "",
        intensity: "",
        notes: "",
        tags: "",
      }));
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unknown error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (trainingId: string) => {
    const activeProjectId = projectId ?? currentProject.id;
    if (!activeProjectId) {
      setError("Select a project first");
      return;
    }
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${activeProjectId}/trainings/${trainingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken ?? ""}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete training");
      }

      setTrainings((prev) => prev.filter((training) => training.id !== trainingId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unknown error");
    }
  };

  const beginEdit = (training: Training) => {
    setEditingId(training.id);
    setEditData({
      title: training.title,
      type: training.type,
      duration: String(training.duration),
      date: training.date.slice(0, 10),
      intensity: training.intensity ? String(training.intensity) : "",
      notes: training.notes ?? "",
      tags: training.tags.join(", "),
    });
  };

  const handleUpdate = async () => {
    if (!editingId) {
      return;
    }
    const activeProjectId = projectId ?? currentProject.id;
    if (!activeProjectId) {
      setError("Select a project first");
      return;
    }
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${activeProjectId}/trainings/${editingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken ?? ""}`,
          },
          body: JSON.stringify({
            title: editData.title.trim(),
            type: editData.type,
            duration: Number(editData.duration),
            date: editData.date,
            intensity: editData.intensity ? Number(editData.intensity) : null,
            notes: editData.notes.trim() || null,
            tags: editData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update training");
      }

      const updated = (await response.json()) as Training;
      setTrainings((prev) =>
        prev.map((training) => (training.id === updated.id ? updated : training)),
      );
      setEditingId(null);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unknown error");
    }
  };

  return (
    <div className="trainings-page">
      <div className="projects-header">
        <div>
          <p className="eyebrow">Project trainings</p>
          <h2 className="section-title">Trainings</h2>
        </div>
        <label className="filter-control">
          <span className="field-label">Filter</span>
          <select
            className="field-input"
            value={selectedAuthorId}
            onChange={(event) => setSelectedAuthorId(event.target.value)}
          >
            <option value="all">All members</option>
            {members.map((member) => (
              <option key={member.user.id} value={member.user.id}>
                {member.user.name ?? member.user.email}
              </option>
            ))}
          </select>
        </label>
        <button className="btn primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Close" : "Add training"}
        </button>
      </div>

      {showForm ? (
        <div className="card training-form">
          <div className="card-header">
            <h3>Add a training</h3>
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
                placeholder="Morning swim"
              />
            </label>
            <label className="field">
              <span className="field-label">Activity</span>
              <select
                className="field-input"
                value={formData.type}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, type: event.target.value }))
                }
              >
                {activityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Duration (min)</span>
              <input
                className="field-input"
                type="number"
                min={0}
                value={formData.duration}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, duration: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Date</span>
              <input
                className="field-input"
                type="date"
                value={formData.date}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, date: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Intensity (1-10)</span>
              <input
                className="field-input"
                type="number"
                min={1}
                max={10}
                value={formData.intensity}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, intensity: event.target.value }))
                }
              />
            </label>
            <label className="field">
              <span className="field-label">Tags</span>
              <input
                className="field-input"
                value={formData.tags}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, tags: event.target.value }))
                }
                placeholder="cardio, morning"
              />
            </label>
            <label className="field">
              <span className="field-label">Notes</span>
              <textarea
                className="field-input field-textarea"
                value={formData.notes}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, notes: event.target.value }))
                }
                rows={3}
              />
            </label>
          </div>
          <button className="btn primary" onClick={handleCreate} disabled={creating}>
            {creating ? "Saving..." : "Save training"}
          </button>
        </div>
      ) : null}

      {status === "loading" ? <p>Checking session...</p> : null}
      {status === "unauthenticated" ? (
        <div className="card">
          <p className="card-body">Sign in to view trainings.</p>
        </div>
      ) : null}
      {loading ? (
        <div className="card">
          <p className="card-body">Loading trainings...</p>
        </div>
      ) : null}
      {error ? (
        <div className="card">
          <p className="card-body">{error}</p>
        </div>
      ) : null}

      <div className="trainings-grid">
        {trainings.map((training) => (
          <div key={training.id} className="card training-card">
            <div className="card-header">
              <h3>{training.title}</h3>
              <div className="note-actions">
                <button className="chip" onClick={() => beginEdit(training)}>
                  Edit
                </button>
                <button className="chip" onClick={() => handleDelete(training.id)}>
                  Delete
                </button>
              </div>
            </div>
            <p className="card-body">
              {training.type} · {training.duration} min
              {training.intensity ? ` · RPE ${training.intensity}` : ""}
            </p>
            <p className="card-meta">
              {new Date(training.date).toLocaleDateString()}
            </p>
            {training.author ? (
              <p className="card-meta">
                By {training.author.name ?? training.author.email}
              </p>
            ) : null}
            {training.notes ? <p className="card-body">{training.notes}</p> : null}
            {training.tags.length > 0 ? (
              <div className="tag-row">
                {training.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            {editingId === training.id ? (
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
                  <span className="field-label">Activity</span>
                  <select
                    className="field-input"
                    value={editData.type}
                    onChange={(event) =>
                      setEditData((prev) => ({ ...prev, type: event.target.value }))
                    }
                  >
                    {activityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Duration (min)</span>
                  <input
                    className="field-input"
                    type="number"
                    min={0}
                    value={editData.duration}
                    onChange={(event) =>
                      setEditData((prev) => ({ ...prev, duration: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">Date</span>
                  <input
                    className="field-input"
                    type="date"
                    value={editData.date}
                    onChange={(event) =>
                      setEditData((prev) => ({ ...prev, date: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">Intensity (1-10)</span>
                  <input
                    className="field-input"
                    type="number"
                    min={1}
                    max={10}
                    value={editData.intensity}
                    onChange={(event) =>
                      setEditData((prev) => ({ ...prev, intensity: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">Tags</span>
                  <input
                    className="field-input"
                    value={editData.tags}
                    onChange={(event) =>
                      setEditData((prev) => ({ ...prev, tags: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span className="field-label">Notes</span>
                  <textarea
                    className="field-input field-textarea"
                    value={editData.notes}
                    onChange={(event) =>
                      setEditData((prev) => ({ ...prev, notes: event.target.value }))
                    }
                    rows={3}
                  />
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
