"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/admin-api";
import type { StoredProject } from "@/lib/project-schema";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<StoredProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ project: StoredProject }>(`/api/admin/projects/${params.id}`)
      .then((r) => setProject(r.project))
      .catch((err) => setError(err.message));
  }, [params.id]);

  return (
    <div>
      <Link
        href="/admin/projects"
        className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-live"
      >
        ← Projects
      </Link>
      <h1 className="mb-8 mt-3 font-display text-3xl">{project ? project.name : "Edit project"}</h1>

      {error ? (
        <p className="rounded-xl border border-signal/30 bg-signal/10 p-4 text-sm text-signal">{error}</p>
      ) : !project ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <ProjectForm id={project.id} initial={toInput(project)} />
      )}
    </div>
  );
}

function toInput({ id, order, ...input }: StoredProject) {
  return input;
}
