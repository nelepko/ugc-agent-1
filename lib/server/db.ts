import { randomUUID } from "crypto";

type PrismaModule = {
  PrismaClient: new () => PrismaClientLike;
};

type PrismaClientLike = {
  scriptRun: { create: (args: unknown) => Promise<{ id: string }> };
  videoJob: {
    create: (args: unknown) => Promise<{ id: string }>;
    findUnique: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
  };
  template: {
    updateMany: (args: unknown) => Promise<{ count: number }>;
    create: (args: unknown) => Promise<unknown>;
  };
};

type GlobalWithPrisma = typeof globalThis & {
  __ugcPrisma?: unknown;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

async function loadPrismaModule(): Promise<PrismaModule | null> {
  try {
    const dynamicImport = new Function("m", "return import(m)") as (m: string) => Promise<PrismaModule>;
    return await dynamicImport("@prisma/client");
  } catch {
    return null;
  }
}

export async function getPrismaClient() {
  if (globalForPrisma.__ugcPrisma) {
    return globalForPrisma.__ugcPrisma as PrismaClientLike;
  }

  if (!process.env.DATABASE_URL) {
    return null;
  }

  const prismaModule = await loadPrismaModule();
  if (!prismaModule) {
    return null;
  }

  const prisma = new prismaModule.PrismaClient();
  globalForPrisma.__ugcPrisma = prisma;
  return prisma;
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}
