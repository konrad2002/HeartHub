"use client";

import Link from "next/link";
import { useCurrentProject } from "./current-project-context";

export function AppNav() {
  const { currentProject } = useCurrentProject();

  return (
    <nav className="nav-group">
      <Link className="nav-item active" href="/">
        Dashboard
      </Link>
      <Link
        className="nav-item"
        href={currentProject.id ? `/projects/${currentProject.id}/notes` : "/projects"}
      >
        Notes
      </Link>
      <a className="nav-item" href="#">
        Trainings
      </a>
      <a className="nav-item" href="#">
        Locations
      </a>
      <a className="nav-item" href="#">
        Members
      </a>
    </nav>
  );
}
