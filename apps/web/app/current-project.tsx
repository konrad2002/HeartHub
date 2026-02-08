"use client";

import { useCurrentProject } from "./current-project-context";

export function CurrentProjectBadge() {
  const { currentProject } = useCurrentProject();

  if (!currentProject.id) {
    return <p className="eyebrow">Select a project</p>;
  }

  return (
    <div>
      <p className="eyebrow">Current project</p>
      <h1 className="header-title">{currentProject.name ?? "Project"}</h1>
    </div>
  );
}
