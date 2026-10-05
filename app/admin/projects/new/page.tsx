"use client";

import Link from "next/link";
import { EMPTY_PROJECT, ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <Link
        href="/admin/projects"
        className="font-mono text-[12px] uppercase tracking-[0.1em] text-muted transition hover:text-live"
      >
        ← Projects
      </Link>
      <h1 className="mb-8 mt-3 font-display text-3xl">New project</h1>
      <ProjectForm initial={EMPTY_PROJECT} />
    </div>
  );
}
