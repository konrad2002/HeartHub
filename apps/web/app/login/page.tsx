"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <div className="card-header">
        <h3>Welcome back</h3>
        <span className="badge">Keycloak</span>
      </div>
      <p className="card-body">
        Sign in to access your shared projects and daily dashboard.
      </p>
      <button className="btn primary" onClick={() => signIn("keycloak")}> 
        Sign in
      </button>
    </div>
  );
}
