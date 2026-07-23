import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Local dev runs on SQLite via the better-sqlite3 driver adapter (Prisma 7
// requires an explicit adapter — no bundled query engine). When moving to
// the real Supabase/Postgres deployment, swap this for `@prisma/adapter-pg`
// pointed at DATABASE_URL and flip the datasource provider in schema.prisma.
function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
