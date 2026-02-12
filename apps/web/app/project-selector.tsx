"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCurrentProject } from "./current-project-context";
import { getApiBaseUrl } from "@/lib/env";

type Project = {
  id: string;
  name: string;
  description?: string | null;
};

export function ProjectSelector() {
  const { data: session, status } = useSession();
  const { currentProject, setCurrentProject } = useCurrentProject();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const loadProjects = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/projects`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken ?? ""}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Project[];
        setProjects(data);
        if (!currentProject.id && data.length > 0) {
          setCurrentProject({ id: data[0].id, name: data[0].name });
        }
      } catch {
        // Ignore selector errors to avoid blocking the header.
      }
    };

    loadProjects();
  }, [apiBaseUrl, currentProject.id, session?.accessToken, setCurrentProject, status]);

  return (
    <div className="project-selector">
      <button className="selector-pill" onClick={() => setOpen((prev) => !prev)}>
        <span className="selector-pill-label">Project</span>
        <span className="selector-pill-value">
          {currentProject.name ?? "Select"}
        </span>
        <span className="selector-pill-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="selector-menu">
          <div className="selector-menu-actions">
            <Link className="selector-menu-link" href="/projects">
              Manage
            </Link>
            <Link className="selector-menu-link" href="/projects">
              New project
            </Link>
          </div>
          <div className="selector-menu-list">
            {projects.length === 0 ? (
              <p className="selector-menu-empty">No projects yet.</p>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  className={
                    project.id === currentProject.id
                      ? "selector-menu-item active"
                      : "selector-menu-item"
                  }
                  onClick={() => {
                    setCurrentProject({ id: project.id, name: project.name });
                    setOpen(false);
                  }}
                >
                  <span className="selector-menu-name">{project.name}</span>
                  {project.description ? (
                    <span className="selector-menu-meta">{project.description}</span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
