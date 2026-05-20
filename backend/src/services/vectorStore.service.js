const prisma = require("../lib/prisma.js");

function vectorToSql(values) {
  return `[${values.join(",")}]`;
}

async function insertChunk(documentId, tenantId, content, embedding) {
  const vectorStr = vectorToSql(embedding);
  await prisma.$executeRawUnsafe(
    `INSERT INTO "DocumentChunk"
       (id, "documentId", "tenantId", content, embedding, "createdAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, NOW())`,
    documentId,
    tenantId,
    content,
    vectorStr
  );
}

async function similaritySearch(tenantId, embedding, limit = 5) {
  const vectorStr = vectorToSql(embedding);
  const rows = await prisma.$queryRawUnsafe(
    `SELECT id, content,
            1 - (embedding <=> $1::vector) AS similarity
     FROM "DocumentChunk"
     WHERE "tenantId" = $2
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    vectorStr,
    tenantId,
    limit
  );
  return rows.map((row) => ({
    ...row,
    similarity: Number(row.similarity),
  }));
}

module.exports = { insertChunk, similaritySearch, vectorToSql };
