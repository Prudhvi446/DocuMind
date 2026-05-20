const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { embedQuery } = require('./src/services/embedding.service.js');

async function main() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log("No tenant found");
    return;
  }
  console.log("Tenant:", tenant.id);
  const q = "What is this document about?";
  const embedding = await embedQuery(q);
  
  function vectorToSql(values) {
    return `[${values.join(",")}]`;
  }
  const vectorStr = vectorToSql(embedding);

  const rows = await prisma.$queryRawUnsafe(
    `SELECT id, content,
            1 - (embedding <=> $1::vector) AS similarity
     FROM "DocumentChunk"
     WHERE "tenantId" = $2
     ORDER BY embedding <=> $1::vector
     LIMIT 5`,
    vectorStr,
    tenant.id
  );
  
  console.log("Found chunks:", rows.length);
  for (const r of rows) {
    console.log("Score:", Number(r.similarity), "Content snippet:", r.content.substring(0, 50));
  }
}
main().finally(() => prisma.$disconnect());