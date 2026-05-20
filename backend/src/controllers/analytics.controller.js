const prisma = require("../lib/prisma.js");

async function getAnalytics(req, res, next) {
  try {
    const tenantId = req.tenantId;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(401).json({ error: "Unauthorized", code: "AUTH_REQUIRED" });
    }

    const [
      cachedQueries,
      tokenAgg,
      belowThresholdCount,
      recentQueries,
    ] = await Promise.all([
      prisma.queryLog.count({
        where: { tenantId, cached: true },
      }),
      prisma.queryLog.aggregate({
        where: { tenantId },
        _sum: {
          inputTokens: true,
          outputTokens: true,
          totalTokens: true,
        },
      }),
      prisma.queryLog.count({
        where: {
          tenantId,
          cached: false,
          totalTokens: 0,
        },
      }),
      prisma.queryLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          question: true,
          answer: true,
          totalTokens: true,
          cached: true,
          similarityScore: true,
          createdAt: true,
        },
      }),
    ]);

    const totalQueries = tenant.queryCount;
    const cacheHitRate =
      totalQueries > 0
        ? `${((cachedQueries / totalQueries) * 100).toFixed(1)}%`
        : "0.0%";

    res.json({
      totalQueries,
      monthlyQueries: tenant.monthlyCount,
      queryLimit: tenant.queryLimit,
      remainingQueries: Math.max(0, tenant.queryLimit - tenant.monthlyCount),
      cachedQueries,
      cacheHitRate,
      totalInputTokens: tokenAgg._sum.inputTokens ?? 0,
      totalOutputTokens: tokenAgg._sum.outputTokens ?? 0,
      totalTokens: tokenAgg._sum.totalTokens ?? 0,
      belowThresholdCount,
      recentQueries,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };
