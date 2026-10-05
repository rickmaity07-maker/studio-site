import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import type { Prisma, Project as ProjectRow } from "@prisma/client";
import { projects as starterProjects, type Project, type ProjectCategory } from "@/data/projects";
import { imageUrl, type ProjectInput, type StoredProject } from "@/lib/project-schema";
import { db, dbConfigured } from "./db";

export function toStoredProject(row: ProjectRow): StoredProject {
  const p: StoredProject = {
    id: row.id,
    order: row.order,
    published: row.published,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    category: row.category as ProjectCategory,
    year: row.year,
    stack: row.stack,
    description: row.description,
    embeddable: row.embeddable,
    accent: row.accent,
    featured: row.featured
  };
  if (row.liveUrl) p.liveUrl = row.liveUrl;
  if (row.imageId) p.image = { id: row.imageId, url: imageUrl(row.imageId) };
  return p;
}

/** Columns written from a validated ProjectInput. */
export function toRow(input: ProjectInput): Omit<Prisma.ProjectUncheckedCreateInput, "order"> {
  return {
    slug: input.slug,
    name: input.name,
    tagline: input.tagline,
    category: input.category,
    year: input.year,
    stack: input.stack,
    description: input.description,
    liveUrl: input.liveUrl ?? null,
    embeddable: input.embeddable !== false,
    accent: input.accent,
    featured: Boolean(input.featured),
    published: input.published,
    imageId: input.image?.id ?? null
  };
}

const loadPublished = unstable_cache(
  async (): Promise<Project[]> => {
    const rows = await db.project.findMany({ where: { published: true }, orderBy: { order: "asc" } });
    return rows.map((row) => {
      const { id, order, published, ...project } = toStoredProject(row);
      return project;
    });
  },
  ["published-projects"],
  { tags: ["projects"], revalidate: 3600 }
);

/**
 * Published projects for the public site, in admin-defined order.
 * Falls back to the starter list when there's no database configured
 * (or it can't be reached), so the site never renders empty.
 */
export async function getProjects(): Promise<Project[]> {
  if (!dbConfigured) return starterProjects;
  try {
    return await loadPublished();
  } catch (err) {
    console.error("Couldn't load projects from the database, using starter list:", err);
    return starterProjects;
  }
}

export async function getProjectBySlug(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug);
}

/** Call after any project change so the public pages pick it up. */
export function refreshPublicPages() {
  revalidateTag("projects");
  revalidatePath("/", "layout");
}
