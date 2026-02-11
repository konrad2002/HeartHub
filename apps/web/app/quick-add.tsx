"use client";

import Link from "next/link";
import { useCurrentProject } from "./current-project-context";

export function QuickAdd() {
  const { currentProject } = useCurrentProject();
  const basePath = currentProject.id ? `/projects/${currentProject.id}` : "/projects";

  return (
    <div className="quick-add">
      <p className="sidebar-title">Quick add</p>
      <Link className="chip" href={`${basePath}/notes?new=1`}>
        Note
      </Link>
      <Link className="chip" href={`${basePath}/trainings?new=1`}>
        Training
      </Link>
    </div>
  );
}
