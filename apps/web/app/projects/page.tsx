"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useCurrentProject } from "../current-project-context";

type Project = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
};

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const { currentProject, setCurrentProject } = useCurrentProject();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<Record<string, string>>({});

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

  const rememberProject = (id: string, name: string) => {
    setCurrentProject({ id, name });
  };

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/projects`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken ?? ""}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load projects");
        }

        const data = (await response.json()) as Project[];
        setProjects(data);
        if (!currentProject.id && data.length === 1) {
          setCurrentProject({ id: data[0].id, name: data[0].name });
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [apiBaseUrl, currentProject.id, session?.accessToken, setCurrentProject, status]);

  return (
    <div className="projects">
      <div className="projects-header">
        <div>
          <p className="eyebrow">Your spaces</p>
          <h2 className="section-title">Projects</h2>
        </div>
        <button className="btn primary" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Close" : "New project"}
        </button>
      </div>

      {showForm ? (
        <div className="card project-form">
          <div className="card-header">
            <h3>Create a new project</h3>
            <span className="badge">Shared space</span>
          </div>
          <div className="form-grid">
            <label className="field">
              <span className="field-label">Project name</span>
              <input
                className="field-input"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Konrad + Lia"
              />
            </label>
            <label className="field">
              <span className="field-label">Description</span>
              <textarea
                className="field-input field-textarea"
                value={formData.description}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Shared plans, notes, and training log"
                rows={3}
              />
            </label>
          </div>
          {createError ? <p className="form-error">{createError}</p> : null}
          <div className="form-actions">
            <button
              className="btn ghost"
              onClick={() => {
                setFormData({ name: "", description: "" });
                setCreateError(null);
              }}
              disabled={creating}
            >
              Reset
            </button>
            <button
              className="btn primary"
              onClick={async () => {
                if (!formData.name.trim()) {
                  setCreateError("Project name is required.");
                  return;
                }
                setCreating(true);
                setCreateError(null);
                try {
                  const response = await fetch(`${apiBaseUrl}/projects`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${session?.accessToken ?? ""}`,
                    },
                    body: JSON.stringify({
                      name: formData.name.trim(),
                      description: formData.description.trim() || undefined,
                    }),
                  });

                  if (!response.ok) {
                    throw new Error("Failed to create project");
                  }

                  const created = (await response.json()) as Project;
                  setProjects((prev) => [created, ...prev]);
                  setFormData({ name: "", description: "" });
                  setShowForm(false);
                } catch (createFailure) {
                  setCreateError(
                    createFailure instanceof Error ? createFailure.message : "Unknown error",
                  );
                } finally {
                  setCreating(false);
                }
              }}
              disabled={creating || status !== "authenticated"}
            >
              {creating ? "Creating..." : "Create project"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="card project-form">
        <div className="card-header">
          <h3>Join with invite code</h3>
          <span className="badge">Code</span>
        </div>
        <div className="form-grid">
          <label className="field">
            <span className="field-label">Invite code</span>
            <input
              className="field-input"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder="ABCD1234"
            />
          </label>
        </div>
        {joinError ? <p className="form-error">{joinError}</p> : null}
        <div className="form-actions">
          <button
            className="btn primary"
            onClick={async () => {
              if (!joinCode.trim()) {
                setJoinError("Invite code is required.");
                return;
              }
              setJoining(true);
              setJoinError(null);
              try {
                const response = await fetch(`${apiBaseUrl}/invites/accept`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken ?? ""}`,
                  },
                  body: JSON.stringify({ code: joinCode.trim() }),
                });

                if (!response.ok) {
                  throw new Error("Failed to accept invite");
                }

                setJoinCode("");
                setJoinError(null);
                // Refresh projects list
                const refreshed = await fetch(`${apiBaseUrl}/projects`, {
                  headers: {
                    Authorization: `Bearer ${session?.accessToken ?? ""}`,
                  },
                });
                if (refreshed.ok) {
                  const data = (await refreshed.json()) as Project[];
                  setProjects(data);
                  if (!currentProject.id && data.length > 0) {
                    setCurrentProject({ id: data[0].id, name: data[0].name });
                  }
                }
              } catch (joinFailure) {
                setJoinError(
                  joinFailure instanceof Error ? joinFailure.message : "Unknown error",
                );
              } finally {
                setJoining(false);
              }
            }}
            disabled={joining || status !== "authenticated"}
          >
            {joining ? "Joining..." : "Join project"}
          </button>
        </div>
      </div>

      {status === "loading" ? <p>Checking session...</p> : null}

      {status === "unauthenticated" ? (
        <div className="card">
          <p className="card-body">Sign in to view your projects.</p>
        </div>
      ) : null}

      {status === "authenticated" && loading ? (
        <div className="card">
          <p className="card-body">Loading projects...</p>
        </div>
      ) : null}

      {status === "authenticated" && error ? (
        <div className="card">
          <p className="card-body">{error}</p>
        </div>
      ) : null}

      {status === "authenticated" && !loading && !error ? (
        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className="card">
              <p className="card-body">No projects yet. Create your first one.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="card project-card">
                <div className="card-header">
                  <h3>{project.name}</h3>
                  <span className="badge">Active</span>
                </div>
                <p className="card-body">
                  {project.description || "No description yet."}
                </p>
                <div className="project-actions">
                  <button
                    className="chip"
                    onClick={() => rememberProject(project.id, project.name)}
                  >
                    Set current
                  </button>
                  <Link
                    className="chip"
                    href={`/projects/${project.id}/notes`}
                    onClick={() => rememberProject(project.id, project.name)}
                  >
                    Open notes
                  </Link>
                  <button
                    className="chip"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `${apiBaseUrl}/projects/${project.id}/invites`,
                          {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${session?.accessToken ?? ""}`,
                            },
                          },
                        );

                        if (!response.ok) {
                          throw new Error("Failed to create invite");
                        }

                        const invite = (await response.json()) as { code: string };
                        setInviteCodes((prev) => ({ ...prev, [project.id]: invite.code }));
                      } catch (inviteError) {
                        setError(
                          inviteError instanceof Error
                            ? inviteError.message
                            : "Unknown error",
                        );
                      }
                    }}
                  >
                    Get invite code
                  </button>
                </div>
                {inviteCodes[project.id] ? (
                  <p className="card-meta">Invite code: {inviteCodes[project.id]}</p>
                ) : null}
                {project.createdAt ? (
                  <p className="card-meta">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
