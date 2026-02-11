"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useCurrentProject } from "./current-project-context";
import { getApiBaseUrl } from "../lib/env";

export function InviteButton() {
  const { data: session } = useSession();
  const { currentProject } = useCurrentProject();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = getApiBaseUrl();

  const handleInvite = async () => {
    if (!currentProject.id) {
      setError("Select a project first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/projects/${currentProject.id}/invites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken ?? ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create invite");
      }

      const invite = (await response.json()) as { code: string };
      setCode(invite.code);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(invite.code);
      }
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-control">
      <button className="btn ghost" onClick={handleInvite} disabled={loading}>
        {loading ? "Creating..." : "Invite"}
      </button>
      {code ? <span className="invite-code">Code: {code}</span> : null}
      {error ? <span className="invite-error">{error}</span> : null}
    </div>
  );
}
