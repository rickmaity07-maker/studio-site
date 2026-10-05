import { db } from "@/lib/server/db";
import { HttpError, route } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Serves a stored screenshot. Images never change once uploaded, so they cache forever. */
export const GET = route(async (_req: Request, { params }: { params: { id: string } }) => {
  const image = await db.image.findUnique({ where: { id: params.id } });
  if (!image) throw new HttpError(404, "Image not found.");
  return new Response(image.data, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    }
  });
});
