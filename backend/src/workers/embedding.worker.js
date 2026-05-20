const { Worker } = require("bullmq");
const fs = require("fs");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { env } = require("../config/env.js");
const prisma = require("../lib/prisma.js");
const { parsePdf } = require("../parsers/pdf.parser.js");
const { parseTxt } = require("../parsers/txt.parser.js");
const { embedText } = require("../services/embedding.service.js");
const { insertChunk } = require("../services/vectorStore.service.js");

const connection = {
  url: env.REDIS_URL,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processJob(job) {
  const { documentId, tenantId, filePath, mimeType } = job.data;

  try {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "processing" },
    });

    let text;
    if (mimeType === "application/pdf") {
      text = await parsePdf(filePath);
    } else if (mimeType === "text/plain") {
      text = await parseTxt(filePath);
    } else {
      throw new Error(`Unsupported mime type: ${mimeType}`);
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitText(text);

    const batchSize = 5;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      for (const chunk of batch) {
        const embedding = await embedText(chunk);
        await insertChunk(documentId, tenantId, chunk, embedding);
      }
      if (i + batchSize < chunks.length) {
        await sleep(800);
      }
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "done" },
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Embedding job failed for document ${documentId}:`, err.message);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "failed" },
    });
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

const worker = new Worker("embedding", processJob, {
  connection,
  concurrency: 2,
});

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Embedding worker started (concurrency: 2)");
