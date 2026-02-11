"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useCurrentProject } from "./current-project-context";
import { getApiBaseUrl } from "@/lib/env";

type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

type Training = {
  id: string;
  title: string;
  type: string;
  duration: number;
  intensity?: number | null;
  date: string;
};

export default function Home() {
  const { data: session, status } = useSession();
  const { currentProject } = useCurrentProject();
  const [notes, setNotes] = useState<Note[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    if (status !== "authenticated" || !currentProject.id) {
      return;
    }

    const loadDashboard = async () => {
      setError(null);
      try {
        const [notesRes, trainingsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/projects/${currentProject.id}/notes`, {
            headers: { Authorization: `Bearer ${session?.accessToken ?? ""}` },
          }),
          fetch(`${apiBaseUrl}/projects/${currentProject.id}/trainings`, {
            headers: { Authorization: `Bearer ${session?.accessToken ?? ""}` },
          }),
        ]);

        if (notesRes.ok) {
          const data = (await notesRes.json()) as Note[];
          setNotes(data.slice(0, 3));
        }
        if (trainingsRes.ok) {
          const data = (await trainingsRes.json()) as Training[];
          setTrainings(data.slice(0, 3));
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      }
    };

    loadDashboard();
  }, [apiBaseUrl, currentProject.id, session?.accessToken, status]);

  const notesLink = currentProject.id
    ? `/projects/${currentProject.id}/notes?new=1`
    : "/projects";
  const trainingsLink = currentProject.id
    ? `/projects/${currentProject.id}/trainings?new=1`
    : "/projects";

  return (
    <div className="dashboard">
      <section className="hero-card reveal">
        <div>
          <p className="eyebrow">Today</p>
          <h2 className="hero-title">A shared space for tiny moments.</h2>
          <p className="hero-copy">
            Capture notes, track training, and keep your shared routines in one place.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="btn primary" href={notesLink}>
            Add a note
          </Link>
          <Link className="btn ghost" href={trainingsLink}>
            Add training
          </Link>
        </div>
      </section>

      {status === "unauthenticated" ? (
        <div className="card">
          <p className="card-body">Sign in to see your dashboard.</p>
        </div>
      ) : null}

      {!currentProject.id && status === "authenticated" ? (
        <div className="card">
          <p className="card-body">Select a project to load your dashboard.</p>
        </div>
      ) : null}

      {error ? (
        <div className="card">
          <p className="card-body">{error}</p>
        </div>
      ) : null}

      <section className="grid-two">
        <div className="card reveal">
          <div className="card-header">
            <h3>Recent notes</h3>
            <span className="badge">Latest</span>
          </div>
          <ul className="list">
            {notes.length === 0 ? <li>No notes yet.</li> : null}
            {notes.map((note) => (
              <li key={note.id}>{note.title}</li>
            ))}
          </ul>
        </div>
        <div className="card reveal">
          <div className="card-header">
            <h3>Trainings</h3>
            <span className="badge">Latest</span>
          </div>
          <ul className="list">
            {trainings.length === 0 ? <li>No trainings yet.</li> : null}
            {trainings.map((training) => (
              <li key={training.id}>
                {training.title} · {training.duration} min
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
