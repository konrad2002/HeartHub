"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AppNav() {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("currentProjectId");
    if (stored) {
      setCurrentProjectId(stored);
    }
  }, []);

  return (
    <nav className="nav-group">
      <Link className="nav-item active" href="/">
        Dashboard
      </Link>
      <Link className="nav-item" href="/projects">
        Projects
      </Link>
      <Link
        className="nav-item"
        href={currentProjectId ? `/projects/${currentProjectId}/notes` : "/projects"}
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
