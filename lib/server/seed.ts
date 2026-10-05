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
    let imageId: string | null = null;
    if (p.image?.url.startsWith("/screens/")) {
      const file = path.join(process.cwd(), "public", p.image.url);
      const data = await readFile(file).catch(() => null);
      if (data) {
        const image = await db.image.create({ data: { data: new Uint8Array(data), contentType: "image/jpeg" } });
        imageId = image.id;
      }
    }

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
        imageId
      }
    });
  }

  return { imported: starterProjects.length };
}
