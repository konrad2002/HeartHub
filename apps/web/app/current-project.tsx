"use client";

import { useEffect, useState } from "react";

type CurrentProject = {
  id: string | null;
  name: string | null;
};

export function CurrentProjectBadge() {
  const [current, setCurrent] = useState<CurrentProject>({ id: null, name: null });

  useEffect(() => {
    const storedId = window.localStorage.getItem("currentProjectId");
    const storedName = window.localStorage.getItem("currentProjectName");
    setCurrent({ id: storedId, name: storedName });
  }, []);

  if (!current.id) {
    return <p className="eyebrow">Select a project</p>;
  }

  return (
    <div>
      <p className="eyebrow">Current project</p>
      <h1 className="header-title">{current.name ?? "Project"}</h1>
    </div>
  );
}
