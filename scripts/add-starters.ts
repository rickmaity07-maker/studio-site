/**
 * npm run db:add-starters — adds the projects from data/projects.ts that
 * aren't in the database yet (matched by slug), with their screenshots.
 * Existing projects are left exactly as they are. Safe to run more than once.
 */
import { PrismaClient } from "@prisma/client";
import { addMissingStarterProjects } from "../lib/server/seed";

const db = new PrismaClient();

addMissingStarterProjects(db)
  .then(({ added }) =>
    console.log(added.length ? `Added ${added.length} project(s): ${added.join(", ")}` : "Nothing to add: every starter project is already there.")
  )
  .finally(() => db.$disconnect());
