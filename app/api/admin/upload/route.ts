import { NextResponse } from "next/server";
import { HttpError, requireAdmin, route } from "@/lib/server/http";
import { MAX_UPLOAD_BYTES, isAllowedImage, uploadImage } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export const POST = route(async (req: Request) => {
  await requireAdmin();

  const form = await req.formData().catch(() => {
    throw new HttpError(400, "Expected a file upload.");
  });
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "No file received.");
  if (!isAllowedImage(file.type)) throw new HttpError(400, "Use a PNG, JPG, WebP or AVIF image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "Images must be 4 MB or smaller.");

  const image = await uploadImage(new Uint8Array(await file.arrayBuffer()), file.type);
  return NextResponse.json({ image }, { status: 201 });
});
