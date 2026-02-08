"use client";

import { SessionProvider } from "next-auth/react";
import { CurrentProjectProvider } from "./current-project-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CurrentProjectProvider>{children}</CurrentProjectProvider>
    </SessionProvider>
  );
}
