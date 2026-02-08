"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="auth-status">Loading...</span>;
  }

  if (!session?.user) {
    return (
      <button className="btn ghost" onClick={() => signIn("keycloak")}>
        Sign in
      </button>
    );
  }

  return (
    <div className="auth-status">
      <div className="auth-user">
        <span className="auth-name">{session.user.name ?? "Signed in"}</span>
        {session.user.email ? <span className="auth-email">{session.user.email}</span> : null}
      </div>
      <button className="btn ghost" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}
