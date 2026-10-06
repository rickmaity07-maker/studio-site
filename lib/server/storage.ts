import { imageUrl } from "@/lib/project-schema";
import { db } from "./db";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/avif"];

export function isAllowedImage(type: string) {
  return ALLOWED.includes(type);
}

/**
 * Stores a screenshot in Postgres. Images are served (and CDN-cached
 * forever, since they never change) from /api/images/:id.
 */
export async function uploadImage(data: Uint8Array<ArrayBuffer>, contentType: string) {
  const image = await db.image.create({ data: { data, contentType }, select: { id: true } });
  return { id: image.id, url: imageUrl(image.id) };
}

/** Removes images no project points at any more (replaced or removed screenshots). */
export async function deleteOrphanImages() {
  try {
    // Keep fresh uploads: the form may not have been saved yet.
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.image.deleteMany({ where: { project: null, mobileProjects: { none: {} }, createdAt: { lt: cutoff } } });
  } catch (err) {
    console.error("Couldn't clean up images", err);
  }
}
