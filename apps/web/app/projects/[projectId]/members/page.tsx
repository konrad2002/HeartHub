"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useCurrentProject } from "../../../current-project-context";
import { getApiBaseUrl } from "@/lib/env";

type Member = {
  id: string;
  role: "member" | "admin";
  user?: { id: string; name: string | null; email: string };
};

export default function MembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: session, status } = useSession();
  const { currentProject, setCurrentProject } = useCurrentProject();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const apiBaseUrl = getApiBaseUrl();

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

    const loadMembers = async () => {
      setLoading(true);
      setError(null);
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
          throw new Error("Failed to load members");
        }

        const data = (await response.json()) as Member[];
        setMembers(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [
    apiBaseUrl,
    currentProject.id,
    currentProject.name,
    projectId,
    session?.accessToken,
    setCurrentProject,
    status,
  ]);

  const handleRemove = async (memberId: string) => {
    const activeProjectId = projectId ?? currentProject.id;
    if (!activeProjectId) {
      setError("Select a project first");
      return;
    }
    setError(null);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${activeProjectId}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken ?? ""}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to remove member");
      }

      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unknown error");
    }
  };

  const handleRoleChange = async (memberId: string, role: "member" | "admin") => {
    const activeProjectId = projectId ?? currentProject.id;
    if (!activeProjectId) {
      setError("Select a project first");
      return;
    }
    setUpdating(memberId);
    setError(null);
    try {
      const response = await fetch(
        `${apiBaseUrl}/projects/${activeProjectId}/members/${memberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken ?? ""}`,
          },
          body: JSON.stringify({ role }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      const updated = (await response.json()) as Member;
      setMembers((prev) =>
        prev.map((m) =>
          m.id === updated.id
            ? { ...m, ...updated, user: updated.user ?? m.user }
            : m,
        ),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unknown error");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="members-page">
      <div className="projects-header">
        <div>
          <p className="eyebrow">Project members</p>
          <h2 className="section-title">Members</h2>
        </div>
      </div>

      {status === "loading" ? <p>Checking session...</p> : null}
      {status === "unauthenticated" ? (
        <div className="card">
          <p className="card-body">Sign in to view members.</p>
        </div>
      ) : null}
      {loading ? (
        <div className="card">
          <p className="card-body">Loading members...</p>
        </div>
      ) : null}
      {error ? (
        <div className="card">
          <p className="card-body">{error}</p>
        </div>
      ) : null}

      <div className="members-grid">
        {members.map((member) => (
          <div key={member.id} className="card member-card">
            <div className="card-header">
              <h3>{member.user?.name ?? member.user?.email ?? "Unknown member"}</h3>
              <span className="badge">{member.role}</span>
            </div>
            <p className="card-meta">{member.user?.email ?? ""}</p>
            <div className="member-actions">
              <select
                className="field-input member-role"
                value={member.role}
                onChange={(event) =>
                  handleRoleChange(member.id, event.target.value as "member" | "admin")
                }
                disabled={updating === member.id}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button className="chip" onClick={() => handleRemove(member.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
