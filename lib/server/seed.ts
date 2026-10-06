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
export async function storeStatic(db: PrismaClient, url: string | undefined) {
  if (!url?.startsWith("/screens")) return null;
  const data = await readFile(path.join(process.cwd(), "public", url)).catch(() => null);
  if (!data) return null;
  const image = await db.image.create({ data: { data: new Uint8Array(data), contentType: "image/jpeg" } });
  return image.id;
}
