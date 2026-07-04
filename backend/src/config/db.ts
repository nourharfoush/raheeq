import { PrismaClient } from '@prisma/client';

console.log('Prisma initializing. DATABASE_URL exists:', !!process.env.DATABASE_URL);

const prisma = new PrismaClient();

export default prisma;
export { prisma };
