import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { projects as starterProjects } from "@/data/projects";

/**
 * Copies data/projects.ts into an empty database, including the
 * starter screenshots from /public. Used by `npm run db:seed` and
 * the admin portal's "Import starter projects" button.
 */
export async function importStarterProjects(db: PrismaClient) {
  if ((await db.project.count()) > 0) return { imported: 0 };

  for (const [order, p] of starterProjects.entries()) {
    const imageId = await storeStatic(db, p.image?.url);
    const mobileImageId = await storeStatic(db, p.mobileImage?.url);

    await db.project.create({
      data: {
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        category: p.category,
        year: p.year,
        stack: p.stack,
        description: p.description,
        liveUrl: p.liveUrl ?? null,
        embeddable: p.embeddable !== false,
        accent: p.accent,
        featured: p.featured ?? false,
        published: true,
        order,
        imageId,
        mobileImageId
      }
    });
  }

  return { imported: starterProjects.length };
}

/** Copies a starter screenshot from /public into the Image table. */
export async function storeStatic(db: PrismaClient, url: string | undefined, origin?: string) {
  if (!url?.startsWith("/screens")) return null;
  let data: Uint8Array | null = await readFile(path.join(process.cwd(), "public", url)).catch(() => null);
  // On Vercel, /public isn't on the function's disk; fetch it from the site instead.
  if (!data && origin) {
    const res = await fetch(new URL(url, origin)).catch(() => null);
    if (res?.ok) data = new Uint8Array(await res.arrayBuffer());
  }
  if (!data) return null;
  const image = await db.image.create({ data: { data: new Uint8Array(data), contentType: "image/jpeg" } });
  return image.id;
}

/**
 * Adds the starter projects whose slug isn't in the database yet, at the end
 * of the list, with their screenshots. Never changes existing projects, so
 * edits made in the admin portal are kept. Used by `npm run db:add-starters`.
 */
export async function addMissingStarterProjects(db: PrismaClient, origin?: string) {
  const existing = await db.project.findMany({ select: { slug: true, order: true } });
  const have = new Set(existing.map((p) => p.slug));
  let order = existing.reduce((max, p) => Math.max(max, p.order), -1);
  const added: string[] = [];

  for (const p of starterProjects) {
    if (have.has(p.slug)) continue;
    const imageId = await storeStatic(db, p.image?.url, origin);
    const mobileImageId = await storeStatic(db, p.mobileImage?.url, origin);
    await db.project.create({
      data: {
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        category: p.category,
        year: p.year,
        stack: p.stack,
        description: p.description,
        liveUrl: p.liveUrl ?? null,
        embeddable: p.embeddable !== false,
        accent: p.accent,
        featured: p.featured ?? false,
        published: true,
        order: ++order,
        imageId,
        mobileImageId
      }
    });
    added.push(p.slug);
  }
  return { added };
}
