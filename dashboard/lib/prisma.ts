import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Global variable to persist across hot reloads in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    // In production, create a new connection pool and adapter for each request
    const connectionString = process.env.DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)

    return new PrismaClient({
      adapter,
      log: ['error'],
    });
  } else {
    // In development, use global variable to persist across hot reloads
    if (!globalForPrisma.prisma) {
      const connectionString = process.env.DATABASE_URL
      const pool = new Pool({ connectionString })
      const adapter = new PrismaPg(pool)

      globalForPrisma.prisma = new PrismaClient({
        adapter,
        log: ['query', 'error', 'warn'],
      });
    }
    return globalForPrisma.prisma;
  }
}

// Export the singleton instance
const prisma = getPrismaClient();

export default prisma;
