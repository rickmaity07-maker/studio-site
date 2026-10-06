/**
 * npm run db:backfill-mobile — gives existing projects the phone screenshot
 * from public/screens-mobile/<slug>.jpg, where they don't have one yet.
 * Safe to run more than once; it never replaces an uploaded screenshot.
 */
import { PrismaClient } from "@prisma/client";
import { storeStatic } from "../lib/server/seed";
import { existsSync } from "node:fs";
import path from "node:path";

const db = new PrismaClient();

(async () => {
  const projects = await db.project.findMany({ where: { mobileImageId: null }, select: { id: true, slug: true } });
  let added = 0;
  for (const p of projects) {
    const url = `/screens-mobile/${p.slug}.jpg`;
    if (!existsSync(path.join(process.cwd(), "public", url))) continue;
    const mobileImageId = await storeStatic(db, url);
    if (mobileImageId) {
      await db.project.update({ where: { id: p.id }, data: { mobileImageId } });
      added++;
      console.log("  +", p.slug);
    }
  }
  console.log(`Added phone screenshots to ${added} project(s).`);
  await db.$disconnect();
})();
