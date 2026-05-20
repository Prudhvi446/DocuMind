const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Docs:', await prisma.document.count());
  console.log('Chunks:', await prisma.documentChunk.count());
}
main().finally(() => prisma.$disconnect());