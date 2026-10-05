/**
 * npm run db:seed — copies data/projects.ts (with screenshots) into an
 * empty database. Does nothing if projects already exist.
 */
import { PrismaClient } from "@prisma/client";
import { importStarterProjects } from "../lib/server/seed";

const db = new PrismaClient();

importStarterProjects(db)
  .then(({ imported }) =>
    console.log(imported ? `Imported ${imported} projects.` : "Projects already exist — nothing imported.")
  )
  .finally(() => db.$disconnect());
