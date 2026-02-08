"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CurrentProject = {
  id: string | null;
  name: string | null;
};

type CurrentProjectContextValue = {
  currentProject: CurrentProject;
  setCurrentProject: (project: CurrentProject) => void;
};

const CurrentProjectContext = createContext<CurrentProjectContextValue | undefined>(
  undefined,
);

export function CurrentProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProjectState] = useState<CurrentProject>({
    id: null,
    name: null,
  });

  useEffect(() => {
    const storedId = window.localStorage.getItem("currentProjectId");
    const storedName = window.localStorage.getItem("currentProjectName");
    setCurrentProjectState({ id: storedId, name: storedName });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "currentProjectId" || event.key === "currentProjectName") {
        const updatedId = window.localStorage.getItem("currentProjectId");
        const updatedName = window.localStorage.getItem("currentProjectName");
        setCurrentProjectState({ id: updatedId, name: updatedName });
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setCurrentProject = (project: CurrentProject) => {
    setCurrentProjectState(project);
    if (project.id) {
      window.localStorage.setItem("currentProjectId", project.id);
    } else {
      window.localStorage.removeItem("currentProjectId");
    }
    if (project.name) {
      window.localStorage.setItem("currentProjectName", project.name);
    } else {
      window.localStorage.removeItem("currentProjectName");
    }
  };

  const value = useMemo(
    () => ({ currentProject, setCurrentProject }),
    [currentProject],
  );

  return (
    <CurrentProjectContext.Provider value={value}>
      {children}
    </CurrentProjectContext.Provider>
  );
}

export function useCurrentProject() {
  const context = useContext(CurrentProjectContext);
  if (!context) {
    throw new Error("useCurrentProject must be used within CurrentProjectProvider");
  }
  return context;
}
