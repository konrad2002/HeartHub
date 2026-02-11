"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentProject } from "./current-project-context";

export function AppNav() {
  const { currentProject } = useCurrentProject();
  const pathname = usePathname();
  const notesPath = currentProject.id ? `/projects/${currentProject.id}/notes` : "/projects";
  const trainingsPath = currentProject.id
    ? `/projects/${currentProject.id}/trainings`
    : "/projects";
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <nav className="nav-group">
      <Link className={`nav-item${isActive("/") ? " active" : ""}`} href="/">
        Dashboard
      </Link>
      <Link
        className={`nav-item${isActive(notesPath) ? " active" : ""}`}
        href={notesPath}
      >
        Notes
      </Link>
      <Link
        className={`nav-item${isActive(trainingsPath) ? " active" : ""}`}
        href={trainingsPath}
      >
        Trainings
      </Link>
      <a className="nav-item" href="#">
        Locations
      </a>
      <Link
        className={`nav-item${isActive(`/projects/${currentProject.id}/members`) ? " active" : ""}`}
        href={currentProject.id ? `/projects/${currentProject.id}/members` : "/projects"}
      >
        Members
      </Link>
    </nav>
  );
}
