import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { HttpError, clientIp } from "./http";

/**
 * Fixed-window rate limit per IP, stored in Postgres (in-memory
 * counters don't survive between serverless invocations). IPs are
 * hashed, never stored, and expired rows are swept on each call.
 */
export async function rateLimit(
  req: Request,
  { bucket, max, windowMs, message }: { bucket: string; max: number; windowMs: number; message: string }
) {
  const salt = process.env.SESSION_SECRET || "";
  const key = bucket + ":" + createHash("sha256").update(salt + clientIp(req)).digest("hex").slice(0, 32);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  // One atomic statement: start a new window, or count within the current one.
  const [row] = await db.$queryRaw<{ count: number }[]>(Prisma.sql`
    INSERT INTO "RateLimit" ("key", "windowStart", "count", "expiresAt")
    VALUES (${key}, ${now}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "windowStart" = CASE WHEN "RateLimit"."expiresAt" <= ${now} THEN ${now} ELSE "RateLimit"."windowStart" END,
      "count"       = CASE WHEN "RateLimit"."expiresAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "expiresAt"   = CASE WHEN "RateLimit"."expiresAt" <= ${now} THEN ${expiresAt} ELSE "RateLimit"."expiresAt" END
    RETURNING "count"
  `);

  await db.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } }).catch(() => {});

  if (row.count > max) throw new HttpError(429, message);
}
