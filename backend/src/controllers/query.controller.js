const crypto = require("crypto");
const { z } = require("zod");
const prisma = require("../lib/prisma.js");
const { env } = require("../config/env.js");
const { embedQuery } = require("../services/embedding.service.js");
const { similaritySearch } = require("../services/vectorStore.service.js");
const { generateAnswer } = require("../services/generation.service.js");
const cacheService = require("../services/cache.service.js");

const questionSchema = z.object({
  question: z.string().min(1).max(1000),
});

const NO_INFO_ANSWER =
  "I don't have enough information in the provided documentation to answer this question.";

function cacheKey(tenantId, question) {
  const hash = crypto
    .createHash("sha256")
    .update(question.trim().toLowerCase())
    .digest("hex");
  return `query:${tenantId}:${hash}`;
}

async function logQuery(data) {
  return prisma.queryLog.create({ data });
}

async function query(req, res, next) {
  try {
    const parsed = questionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { question } = parsed.data;
    const tenantId = req.tenantId;
    const key = cacheKey(tenantId, question);

    const cached = await cacheService.get(key);
    if (cached) {
      await logQuery({
        tenantId,
        question,
        answer: cached.answer,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cached: true,
        similarityScore: cached.similarityScore ?? null,
      });

      return res.json({
        answer: cached.answer,
        cached: true,
        belowThreshold: false,
        tokensUsed: { input: 0, output: 0, total: 0 },
        similarityScore: cached.similarityScore ?? null,
      });
    }

    const embedding = await embedQuery(question);
    const chunks = await similaritySearch(tenantId, embedding, 5);

    const threshold = env.SIMILARITY_THRESHOLD;
    const topScore = chunks[0]?.similarity ?? 0;

    if (chunks.length === 0 || topScore < threshold) {
      await logQuery({
        tenantId,
        question,
        answer: NO_INFO_ANSWER,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        cached: false,
        similarityScore: topScore,
      });

      return res.json({
        answer: NO_INFO_ANSWER,
        cached: false,
        belowThreshold: true,
        tokensUsed: { input: 0, output: 0, total: 0 },
        similarityScore: topScore,
      });
    }

    const { answer, inputTokens, outputTokens } = await generateAnswer(
      question,
      chunks
    );
    const totalTokens = inputTokens + outputTokens;

    await cacheService.set(key, { answer, similarityScore: topScore });

    await logQuery({
      tenantId,
      question,
      answer,
      inputTokens,
      outputTokens,
      totalTokens,
      cached: false,
      similarityScore: topScore,
    });

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        queryCount: { increment: 1 },
        monthlyCount: { increment: 1 },
      },
    });

    res.json({
      answer,
      cached: false,
      belowThreshold: false,
      tokensUsed: {
        input: inputTokens,
        output: outputTokens,
        total: totalTokens,
      },
      similarityScore: topScore,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { query, getHistory };

async function getHistory(req, res, next) {
  try {
    const tenantId = req.tenantId;
    const history = await prisma.queryLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
}
