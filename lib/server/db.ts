import { PrismaClient } from "@prisma/client";

/**
 * Server-only Prisma client for the Neon Postgres database.
 * DATABASE_URL (pooled) and DATABASE_URL_UNPOOLED are added to the
 * Vercel project by the Neon integration — `vercel env pull` copies
 * them into .env.local for local dev.
 */
export const dbConfigured = Boolean(process.env.DATABASE_URL);

// Reuse one client across hot reloads in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
